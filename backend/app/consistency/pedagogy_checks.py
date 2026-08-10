from app.curriculum.loader import load_curriculum
from app.domain.problem import ProblemSpec


def check_pedagogy(problem: ProblemSpec) -> list[str]:
    skill = next((s for s in load_curriculum().skills if s.id == problem.skill_id), None)
    if skill is None:
        return ["Unknown skill."]
    errors = []
    if problem.strategy not in skill.strategies:
        errors.append("Strategy not allowed for skill.")
    if problem.representation not in skill.allowed_representations:
        errors.append("Representation not allowed for skill.")
    return errors
