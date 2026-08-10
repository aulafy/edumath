from app.domain.problem import ProblemSpec
from app.problems.validator import validate_problem


def check_math(problem: ProblemSpec) -> list[str]:
    return validate_problem(problem)
