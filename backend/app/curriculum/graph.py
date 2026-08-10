from app.curriculum.loader import load_curriculum
from app.curriculum.validation import validate_curriculum


def assert_valid_graph() -> None:
    errors = validate_curriculum(load_curriculum())
    if errors:
        raise ValueError("; ".join(errors))
