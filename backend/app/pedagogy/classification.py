from app.domain.enums import Classification
from app.domain.problem import MathSpec
from app.math_engine.verifier import ArithmeticVerifier
from app.narrative.number_normalizer import normalize_number

NON_ANSWERS = {"no se", "no sé", "ni idea", "no lo se", "ayuda", "pista"}


def classify_answer(spec: MathSpec, answer_text: str) -> tuple[Classification, bool, int | None]:
    clean = answer_text.strip().lower()
    if not clean:
        return Classification.NON_ANSWER, False, None
    if clean in NON_ANSWERS:
        return Classification.NON_ANSWER, False, None
    number = normalize_number(clean)
    if number is None:
        return Classification.INVALID_INPUT, False, None
    correct = ArithmeticVerifier().verify(spec, number)
    return (Classification.CORRECT if correct else Classification.INCORRECT), correct, number
