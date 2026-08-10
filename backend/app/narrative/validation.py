from app.domain.problem import ProblemSpec


def validate_narrative(problem: ProblemSpec, rendered: str) -> list[str]:
    allowed = {str(problem.math.a), str(problem.math.b)}
    forbidden_answer = str(problem.math.answer)
    if forbidden_answer not in allowed and forbidden_answer in rendered:
        return ["Narrative leaks computed answer."]
    if not all(number in rendered for number in allowed):
        return ["Narrative omits authorized operands."]
    return []
