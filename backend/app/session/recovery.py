import json

from app.db.models import SessionRow
from app.domain.problem import ProblemResponse, ProblemSpec, UIHints
from app.domain.visual import NumberLineSpec, PartPartWholeSpec, TenFrameSpec
from app.session.policies import allowed_actions


def visual_from_json(data: dict):
    if data["type"] == "TEN_FRAME":
        return TenFrameSpec.model_validate(data)
    if data["type"] == "NUMBER_LINE":
        return NumberLineSpec.model_validate(data)
    return PartPartWholeSpec.model_validate(data)


def response_from_session(row: SessionRow) -> ProblemResponse:
    problem = ProblemSpec.model_validate(json.loads(row.active_problem_json))
    return ProblemResponse(
        session_id=row.id,
        session_revision=row.revision,
        state=row.state,
        problem=problem,
        visual=visual_from_json(json.loads(row.active_visual_json)),
        rendered_story=row.rendered_story,
        tutor_message=row.tutor_message,
        allowed_actions=allowed_actions(row.state),
        attempt_number=row.attempt_number,
        hint_level=row.hint_level,
        ui=UIHints(
            input_mode="NUMBER",
            submit_label="Comprobar",
            show_hint_button=True,
            theme=row.theme,
        ),
    )
