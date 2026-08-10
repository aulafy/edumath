from app.db.models import AttemptRow
from app.student.mastery import mastery_weight
from sqlalchemy.orm import Session


def progress_for_student(db: Session, student_id: str) -> dict:
    attempts = db.query(AttemptRow).filter(AttemptRow.student_id == student_id).all()
    by_skill: dict[str, list[float]] = {}
    independent = 0
    hinted = 0
    for attempt in attempts:
        by_skill.setdefault(attempt.skill_id, []).append(
            mastery_weight(attempt.classification, attempt.hint_level)
        )
        if attempt.correct and attempt.hint_level == 0:
            independent += 1
        elif attempt.correct:
            hinted += 1
    return {
        "student_id": student_id,
        "attempts": len(attempts),
        "independent_correct": independent,
        "correct_with_hints": hinted,
        "skills": [
            {"skill_id": skill, "mastery_estimate": round(sum(values) / len(values), 2)}
            for skill, values in sorted(by_skill.items())
        ],
    }
