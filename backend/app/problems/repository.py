from app.domain.problem import MathSpec, ProblemSpec


def fallback_problem() -> ProblemSpec:
    return ProblemSpec(
        id="fallback-add-2-1",
        skill_id="ADD_COUNT_ON_10",
        skill_version="1.0",
        strategy="COUNT_ON",
        representation="NUMBER_LINE",
        difficulty=0.1,
        math=MathSpec(operation="add", a=2, b=1),
        unknown="TOTAL",
        template_id="dino-eggs-1",
        template_version="1",
    )
