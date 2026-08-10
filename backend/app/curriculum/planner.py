from app.curriculum.loader import load_curriculum
from pydantic import BaseModel


class PlannerDecision(BaseModel):
    skill_id: str
    strategy: str
    representation: str
    difficulty: float
    reason_code: str


class Planner:
    def decide(self, student_id: str, attempt_count: int = 0) -> PlannerDecision:
        curriculum = load_curriculum()
        skill = next(s for s in curriculum.skills if s.id == "ADD_COUNT_ON_10")
        rep = skill.allowed_representations[attempt_count % len(skill.allowed_representations)]
        return PlannerDecision(
            skill_id=skill.id,
            strategy=skill.strategies[0],
            representation=rep,
            difficulty=0.35,
            reason_code="MVP_FIRST_ADDITION_SKILL",
        )
