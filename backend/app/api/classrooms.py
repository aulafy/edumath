import json
import secrets
from datetime import UTC, datetime
from uuid import uuid4

from app.curriculum.loader import load_curriculum
from app.curriculum.spain import load_spain_math_catalog
from app.db.models import AssignmentRow, ClassroomRow, EnrollmentRow, LessonRow, StudentRow
from app.db.session import get_db
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter()


class ClassroomCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    stage: str = Field(pattern="^(PRIMARY|ESO)$")
    grade: int = Field(ge=1, le=6)
    autonomous_community: str = Field(default="STATE_BASE", max_length=60)


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    instructions: str = Field(default="", max_length=500)
    curriculum_unit_id: str
    skill_ids: list[str] = Field(min_length=1)
    problem_count: int = Field(default=8, ge=1, le=30)
    theme: str = Field(default="DINOSAURS", pattern="^(DINOSAURS|SPACE)$")
    pacing: str = Field(default="STUDENT", pattern="^(STUDENT|TEACHER)$")


class AssignmentCreate(BaseModel):
    starts_at: str | None = None
    due_at: str | None = None


class JoinRequest(BaseModel):
    student_id: str


def now() -> str:
    return datetime.now(UTC).isoformat()


def require_teacher(classroom: ClassroomRow, teacher_key: str | None) -> None:
    if not teacher_key or not secrets.compare_digest(classroom.teacher_key, teacher_key):
        raise HTTPException(status_code=403, detail="Invalid teacher key.")


def classroom_payload(row: ClassroomRow, include_key: bool = False) -> dict:
    payload = {
        "id": row.id,
        "name": row.name,
        "stage": row.stage,
        "grade": row.grade,
        "autonomous_community": row.autonomous_community,
        "created_at": row.created_at,
    }
    if include_key:
        payload["teacher_key"] = row.teacher_key
    return payload


def lesson_payload(row: LessonRow) -> dict:
    return {
        "kind": "LESSON",
        "id": row.id,
        "classroom_id": row.classroom_id,
        "title": row.title,
        "instructions": row.instructions,
        "curriculum_unit_id": row.curriculum_unit_id,
        "skill_ids": json.loads(row.skill_ids_json),
        "problem_count": row.problem_count,
        "theme": row.theme,
        "pacing": row.pacing,
        "created_at": row.created_at,
    }


@router.post("/teacher/classrooms")
def create_classroom(data: ClassroomCreate, db: Session = Depends(get_db)):
    if data.stage == "ESO" and data.grade > 4:
        raise HTTPException(status_code=422, detail="ESO grades range from 1 to 4.")
    row = ClassroomRow(
        id=str(uuid4()),
        teacher_key=secrets.token_urlsafe(24),
        name=data.name,
        stage=data.stage,
        grade=data.grade,
        autonomous_community=data.autonomous_community,
        created_at=now(),
    )
    db.add(row)
    db.commit()
    return classroom_payload(row, include_key=True)


@router.get("/teacher/classrooms/{classroom_id}")
def get_classroom(
    classroom_id: str,
    x_teacher_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    classroom = db.get(ClassroomRow, classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found.")
    require_teacher(classroom, x_teacher_key)
    lessons = db.scalars(select(LessonRow).where(LessonRow.classroom_id == classroom_id)).all()
    return {**classroom_payload(classroom), "lessons": [lesson_payload(row) for row in lessons]}


@router.post("/teacher/classrooms/{classroom_id}/lessons")
def create_lesson(
    classroom_id: str,
    data: LessonCreate,
    x_teacher_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    classroom = db.get(ClassroomRow, classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found.")
    require_teacher(classroom, x_teacher_key)
    catalog = load_spain_math_catalog()
    unit = next((item for item in catalog.units if item.id == data.curriculum_unit_id), None)
    if not unit or classroom.stage != unit.stage or classroom.grade not in unit.grades:
        raise HTTPException(status_code=422, detail="Curriculum unit does not match the class.")
    available_skills = {skill.id for skill in load_curriculum().skills}
    if unit.content_status != "READY" or not set(data.skill_ids) <= set(unit.skill_ids):
        raise HTTPException(status_code=422, detail="This curriculum unit is not teachable yet.")
    if not set(data.skill_ids) <= available_skills:
        raise HTTPException(status_code=422, detail="Lesson contains unavailable skills.")
    row = LessonRow(
        id=str(uuid4()),
        classroom_id=classroom_id,
        title=data.title,
        instructions=data.instructions,
        curriculum_unit_id=data.curriculum_unit_id,
        skill_ids_json=json.dumps(data.skill_ids),
        problem_count=data.problem_count,
        theme=data.theme,
        pacing=data.pacing,
        created_at=now(),
    )
    db.add(row)
    db.commit()
    return lesson_payload(row)


def make_join_code(db: Session) -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    for _ in range(20):
        code = "".join(secrets.choice(alphabet) for _ in range(6))
        if not db.scalar(select(AssignmentRow).where(AssignmentRow.join_code == code)):
            return code
    raise HTTPException(status_code=503, detail="Could not allocate an assignment code.")


@router.post("/teacher/lessons/{lesson_id}/publish")
def publish_lesson(
    lesson_id: str,
    data: AssignmentCreate,
    x_teacher_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    lesson = db.get(LessonRow, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    classroom = db.get(ClassroomRow, lesson.classroom_id)
    require_teacher(classroom, x_teacher_key)
    row = AssignmentRow(
        id=str(uuid4()),
        lesson_id=lesson.id,
        join_code=make_join_code(db),
        status="OPEN",
        starts_at=data.starts_at,
        due_at=data.due_at,
        created_at=now(),
    )
    db.add(row)
    db.commit()
    return {
        "kind": "LESSON",
        "id": row.id,
        "join_code": row.join_code,
        "status": row.status,
        "lesson": lesson_payload(lesson),
    }


@router.get("/assignments/{join_code}")
def get_assignment(join_code: str, db: Session = Depends(get_db)):
    row = db.scalar(select(AssignmentRow).where(AssignmentRow.join_code == join_code.upper()))
    if not row or row.status != "OPEN":
        raise HTTPException(status_code=404, detail="Open assignment not found.")
    lesson = db.get(LessonRow, row.lesson_id)
    classroom = db.get(ClassroomRow, lesson.classroom_id)
    return {
        "kind": "LESSON",
        "id": row.id,
        "join_code": row.join_code,
        "status": row.status,
        "classroom": classroom_payload(classroom),
        "lesson": lesson_payload(lesson),
    }


@router.post("/assignments/{join_code}/join")
def join_assignment(join_code: str, data: JoinRequest, db: Session = Depends(get_db)):
    assignment = db.scalar(
        select(AssignmentRow).where(AssignmentRow.join_code == join_code.upper())
    )
    student = db.get(StudentRow, data.student_id)
    if not assignment or assignment.status != "OPEN":
        raise HTTPException(status_code=404, detail="Open assignment not found.")
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    lesson = db.get(LessonRow, assignment.lesson_id)
    existing = db.scalar(
        select(EnrollmentRow).where(
            EnrollmentRow.classroom_id == lesson.classroom_id,
            EnrollmentRow.student_id == student.id,
        )
    )
    if not existing:
        db.add(
            EnrollmentRow(
                id=str(uuid4()),
                classroom_id=lesson.classroom_id,
                student_id=student.id,
                joined_at=now(),
            )
        )
        db.commit()
    return get_assignment(join_code, db)
