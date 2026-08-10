from app.curriculum.models import Curriculum
from app.domain.enums import Representation, Strategy


def validate_curriculum(curriculum: Curriculum) -> list[str]:
    errors: list[str] = []
    skills = {skill.id: skill for skill in curriculum.skills}
    if len(skills) != len(curriculum.skills):
        errors.append("Skill IDs must be unique.")
    valid_reps = {item.value for item in Representation}
    valid_strategies = {item.value for item in Strategy}
    for skill in curriculum.skills:
        for prereq in skill.prerequisites:
            if prereq not in skills:
                errors.append(f"{skill.id} has missing prerequisite {prereq}.")
        if not set(skill.allowed_representations) <= valid_reps:
            errors.append(f"{skill.id} has invalid representation.")
        if not set(skill.strategies) <= valid_strategies:
            errors.append(f"{skill.id} has invalid strategy.")
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(skill_id: str) -> None:
        if skill_id in visiting:
            errors.append(f"Cycle detected at {skill_id}.")
            return
        if skill_id in visited or skill_id not in skills:
            return
        visiting.add(skill_id)
        for prereq in skills[skill_id].prerequisites:
            visit(prereq)
        visiting.remove(skill_id)
        visited.add(skill_id)

    for skill_id in skills:
        visit(skill_id)
    return errors
