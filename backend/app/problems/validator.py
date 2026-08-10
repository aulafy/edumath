from app.domain.problem import ProblemSpec


def validate_problem(problem: ProblemSpec) -> list[str]:
    errors: list[str] = []
    if problem.math.answer > 10:
        errors.append("Addition result exceeds 10.")
    if problem.math.a == 0 or problem.math.b == 0:
        errors.append("MVP requires non-zero addends.")
    return errors
