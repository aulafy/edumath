from app.consistency.gate import ConsistencyGate
from app.curriculum.planner import PlannerDecision
from app.narrative.renderer import story_for_problem
from app.problems.generator import ProblemGenerator
from app.visuals.factory import make_visual


def test_generated_problem_passes_gate() -> None:
    problem = ProblemGenerator().generate(
        PlannerDecision(
            skill_id="ADD_COUNT_ON_10",
            strategy="COUNT_ON",
            representation="NUMBER_LINE",
            difficulty=0.3,
            reason_code="test",
        )
    )
    visual = make_visual(problem)
    _, story = story_for_problem(problem)
    assert ConsistencyGate().validate(problem, visual, story).passed
