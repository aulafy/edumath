from app.domain.problem import ProblemSpec
from app.math_engine.strategies import StrategyEngine, StrategyStep
from pydantic import BaseModel


class ReteachPlan(BaseModel):
    skill_id: str
    strategy: str
    representation: str
    example_problem: ProblemSpec
    explanation_steps: list[StrategyStep]
    follow_up_difficulty: float


def make_reteach(problem: ProblemSpec) -> ReteachPlan:
    return ReteachPlan(
        skill_id=problem.skill_id,
        strategy=problem.strategy,
        representation=problem.representation,
        example_problem=problem,
        explanation_steps=StrategyEngine().steps(problem.strategy, problem.math),
        follow_up_difficulty=max(0.1, problem.difficulty - 0.1),
    )
