import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.curriculum.loader import load_curriculum
from app.curriculum.validation import validate_curriculum


def main() -> None:
    errors = validate_curriculum(load_curriculum())
    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)
    print("Curriculum valid.")


if __name__ == "__main__":
    main()
