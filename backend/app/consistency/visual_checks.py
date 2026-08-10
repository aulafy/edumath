from app.domain.problem import ProblemSpec
from app.visuals.validation import validate_visual


def check_visual(problem: ProblemSpec, visual) -> list[str]:
    return validate_visual(problem, visual)
