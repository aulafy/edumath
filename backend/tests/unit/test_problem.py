from app.domain.problem import MathSpec, ProblemSpec


def test_answer_is_computed() -> None:
    spec = MathSpec(operation="add", a=5, b=3)
    assert spec.answer == 8


def test_problem_has_versions() -> None:
    problem = ProblemSpec(
        id="p1",
        skill_id="ADD_COUNT_ON_10",
        skill_version="1.0",
        strategy="COUNT_ON",
        representation="NUMBER_LINE",
        difficulty=0.3,
        math=MathSpec(operation="add", a=2, b=3),
        template_id="dino-eggs-1",
        template_version="1",
    )
    assert problem.spec_version == "2"
    assert problem.math.answer == 5
