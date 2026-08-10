from app.domain.enums import Classification
from app.domain.problem import MathSpec
from app.pedagogy.classification import classify_answer


def test_spanish_number_answer() -> None:
    classification, correct, number = classify_answer(MathSpec(operation="add", a=5, b=3), "ocho")
    assert classification == Classification.CORRECT
    assert correct
    assert number == 8


def test_non_answer_does_not_advance() -> None:
    classification, correct, _ = classify_answer(MathSpec(operation="add", a=5, b=3), "no sé")
    assert classification == Classification.NON_ANSWER
    assert not correct
