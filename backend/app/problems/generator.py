from itertools import count
from uuid import uuid4

from app.curriculum.planner import PlannerDecision
from app.domain.problem import MathSpec, ProblemSpec

_counter = count(0)


class ProblemGenerator:
    def generate(self, decision: PlannerDecision, template_id: str = "dino-eggs-1") -> ProblemSpec:
        index = next(_counter)
        pairs = [(1, 1), (2, 1), (3, 2), (5, 3), (4, 4), (6, 2), (7, 1), (5, 5)]
        a, b = pairs[index % len(pairs)]
        return ProblemSpec(
            id=f"prob-{uuid4()}",
            skill_id=decision.skill_id,
            skill_version="1.0",
            strategy=decision.strategy,
            representation=decision.representation,
            difficulty=decision.difficulty,
            math=MathSpec(operation="add", a=a, b=b),
            unknown="TOTAL",
            template_id=template_id,
            template_version="1",
        )
