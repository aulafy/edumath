from app.domain.problem import ProblemSpec


def validate_visual(problem: ProblemSpec, visual) -> list[str]:
    if visual.type == "TEN_FRAME" and visual.filled + visual.added != problem.math.answer:
        return ["TEN_FRAME does not match math total."]
    if visual.type == "NUMBER_LINE" and visual.start + sum(visual.jumps) != problem.math.answer:
        return ["NUMBER_LINE does not end at computed answer."]
    if visual.type == "PART_PART_WHOLE" and (
        visual.part_a != problem.math.a
        or visual.part_b != problem.math.b
        or visual.whole is not None
    ):
        return ["PART_PART_WHOLE does not match problem."]
    return []
