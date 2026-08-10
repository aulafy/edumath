from app.curriculum.loader import load_curriculum
from app.curriculum.validation import validate_curriculum


def test_curriculum_is_valid() -> None:
    assert validate_curriculum(load_curriculum()) == []
