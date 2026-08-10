from app.curriculum.loader import load_curriculum
from pydantic import BaseModel


class PlannerDecision(BaseModel):
    skill_id: str
    strategy: str
    representation: str
    difficulty: float
    reason_code: str


class Planner:
    def decide(
        self, student_id: str, attempt_count: int = 0, skill_id: str | None = None
    ) -> PlannerDecision:
        curriculum = load_curriculum()
        selected_skill_id = skill_id or "ADD_COUNT_ON_10"
        skill = next(s for s in curriculum.skills if s.id == selected_skill_id)
        rep = skill.allowed_representations[attempt_count % len(skill.allowed_representations)]
        return PlannerDecision(
            skill_id=skill.id,
            strategy=skill.strategies[0],
            representation=rep,
            difficulty=0.35,
            reason_code="TEACHER_ASSIGNED" if skill_id else "MVP_FIRST_ADDITION_SKILL",
        )
