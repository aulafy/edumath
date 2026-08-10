from app.domain.problem import ProblemSpec
from app.narrative.validation import validate_narrative


def check_narrative(problem: ProblemSpec, rendered: str) -> list[str]:
    return validate_narrative(problem, rendered)
