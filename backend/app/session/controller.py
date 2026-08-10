import json
from datetime import UTC, datetime
from uuid import uuid4

from app.consistency.gate import ConsistencyGate
from app.curriculum.planner import Planner
from app.db.models import AttemptRow, SessionPlanRow, SessionRow
from app.domain.problem import ProblemResponse
from app.events.service import record_event
from app.narrative.renderer import story_for_problem
from app.pedagogy.classification import classify_answer
from app.pedagogy.hint_policy import HintPolicy
from app.pedagogy.misconceptions import misconception_candidate
from app.problems.generator import ProblemGenerator
from app.session.idempotency import previous_attempt_response
from app.session.recovery import response_from_session
from app.student.mastery import mastery_weight
from app.visuals.factory import make_visual
from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session


class AnswerRequest(BaseModel):
    idempotency_key: str
    expected_revision: int
    answer: str
    response_ms: int | None = None


class HintRequest(BaseModel):
    expected_revision: int


def _new_problem(
    student_id: str,
    db: Session,
    theme: str = "DINOSAURS",
    attempt_count: int = 0,
    skill_ids: list[str] | None = None,
):
    template_id = "dino-eggs-1" if theme == "DINOSAURS" else "space-stars-1"
    selected_skill = skill_ids[attempt_count % len(skill_ids)] if skill_ids else None
    decision = Planner().decide(student_id, attempt_count, selected_skill)
    problem = ProblemGenerator().generate(decision, template_id)
    visual = make_visual(problem)
    _, rendered = story_for_problem(problem, theme)
    gate = ConsistencyGate().validate(problem, visual, rendered)
    if not gate.passed:
        raise HTTPException(
            status_code=500,
            detail={
                "error": {
                    "code": "CONSISTENCY_FAILED",
                    "message": "; ".join(gate.errors),
                    "recoverable": False,
                }
            },
        )
    return problem, visual, rendered


def create_session(
    db: Session,
    student_id: str,
    theme: str = "DINOSAURS",
    assignment_id: str | None = None,
    skill_ids: list[str] | None = None,
    problem_count: int = 8,
) -> ProblemResponse:
    problem, visual, rendered = _new_problem(student_id, db, theme, skill_ids=skill_ids)
    row = SessionRow(
        id=str(uuid4()),
        student_id=student_id,
        revision=1,
        state="WAITING_FOR_ANSWER",
        active_problem_json=problem.model_dump_json(),
        active_visual_json=visual.model_dump_json(),
        rendered_story=rendered,
        tutor_message="Vamos paso a paso.",
        attempt_number=1,
        hint_level=0,
        theme=theme,
        created_at=datetime.now(UTC).isoformat(),
    )
    db.add(row)
    if assignment_id and skill_ids:
        db.add(
            SessionPlanRow(
                session_id=row.id,
                assignment_id=assignment_id,
                skill_ids_json=json.dumps(skill_ids),
                problem_count=problem_count,
            )
        )
    record_event(db, student_id, row.id, "SESSION_STARTED", {"theme": theme})
    record_event(db, student_id, row.id, "PROBLEM_PRESENTED", {"problem_id": problem.id})
    db.commit()
    db.refresh(row)
    return response_from_session(row)


def submit_answer(db: Session, row: SessionRow, request: AnswerRequest) -> ProblemResponse:
    previous = previous_attempt_response(db, request.idempotency_key)
    if previous:
        return ProblemResponse.model_validate(json.loads(previous))
    if request.expected_revision != row.revision:
        raise HTTPException(
            status_code=409,
            detail={
                "error": {
                    "code": "SESSION_REVISION_CONFLICT",
                    "message": "Session state changed.",
                    "recoverable": True,
                }
            },
        )
    problem = response_from_session(row).problem
    classification, correct, submitted = classify_answer(problem.math, request.answer)
    used_hint_level = row.hint_level
    submitted_attempt_number = row.attempt_number
    row.revision += 1
    row.attempt_number += 1
    if correct:
        row.tutor_message = "Bien pensado. Seguimos con otro reto."
        plan = db.get(SessionPlanRow, row.id)
        assigned_skills = json.loads(plan.skill_ids_json) if plan else None
        next_problem, visual, rendered = _new_problem(
            row.student_id, db, row.theme, row.attempt_number, assigned_skills
        )
        row.active_problem_json = next_problem.model_dump_json()
        row.active_visual_json = visual.model_dump_json()
        row.rendered_story = rendered
        row.hint_level = 0
        row.state = "WAITING_FOR_ANSWER"
    else:
        row.hint_level = min(3, row.hint_level + 1)
        row.tutor_message = HintPolicy().message(problem, row.hint_level)
        row.state = "WAITING_FOR_ANSWER"
    response = response_from_session(row)
    attempt = AttemptRow(
        id=str(uuid4()),
        idempotency_key=request.idempotency_key,
        student_id=row.student_id,
        session_id=row.id,
        session_revision=request.expected_revision,
        problem_id=problem.id,
        skill_id=problem.skill_id,
        skill_version=problem.skill_version,
        representation=problem.representation,
        strategy=problem.strategy,
        difficulty=problem.difficulty,
        submitted_answer=request.answer,
        classification=classification.value,
        correct=correct,
        hint_level=used_hint_level,
        attempt_number=submitted_attempt_number,
        response_ms=request.response_ms,
        error_type=None if correct else classification.value,
        misconception_candidate=misconception_candidate(problem.math.answer, submitted),
        response_json=response.model_dump_json(),
        created_at=datetime.now(UTC).isoformat(),
    )
    db.add(attempt)
    record_event(
        db,
        row.student_id,
        row.id,
        "ANSWER_CLASSIFIED",
        {
            "classification": classification.value,
            "correct": correct,
            "mastery_weight": mastery_weight(classification.value, used_hint_level),
        },
    )
    db.commit()
    return response


def request_hint(db: Session, row: SessionRow, request: HintRequest) -> ProblemResponse:
    if request.expected_revision != row.revision:
        raise HTTPException(
            status_code=409,
            detail={
                "error": {
                    "code": "SESSION_REVISION_CONFLICT",
                    "message": "Session state changed.",
                    "recoverable": True,
                }
            },
        )
    problem = response_from_session(row).problem
    row.revision += 1
    row.hint_level = min(3, row.hint_level + 1)
    row.tutor_message = HintPolicy().message(problem, row.hint_level)
    record_event(db, row.student_id, row.id, "HINT_REQUESTED", {"hint_level": row.hint_level})
    db.commit()
    return response_from_session(row)
