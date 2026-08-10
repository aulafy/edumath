from app.domain.enums import Classification


def mastery_weight(classification: str, hint_level: int) -> float:
    if classification == Classification.CORRECT:
        return {0: 1.0, 1: 0.7, 2: 0.4, 3: 0.2}.get(hint_level, 0.2)
    if classification == Classification.PARTIAL:
        return 0.2
    if classification == Classification.NON_ANSWER:
        return 0.0
    return 0.0
