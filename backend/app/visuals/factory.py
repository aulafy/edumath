from app.domain.problem import ProblemSpec
from app.domain.visual import NumberLineSpec, PartPartWholeSpec, TenFrameSpec


def make_visual(problem: ProblemSpec):
    if problem.representation == "TEN_FRAME":
        return TenFrameSpec(
            type="TEN_FRAME", filled=problem.math.a, added=problem.math.b, unknown="TOTAL"
        )
    if problem.representation == "NUMBER_LINE":
        return NumberLineSpec(
            type="NUMBER_LINE",
            minimum=0,
            maximum=10,
            start=problem.math.a,
            jumps=[1 for _ in range(problem.math.b)],
            unknown="END",
        )
    return PartPartWholeSpec(
        type="PART_PART_WHOLE",
        part_a=problem.math.a,
        part_b=problem.math.b,
        whole=None,
        unknown="WHOLE",
    )
