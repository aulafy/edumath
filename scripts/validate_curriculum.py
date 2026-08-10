import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.curriculum.loader import load_curriculum
from app.curriculum.spain import load_spain_math_catalog
from app.curriculum.validation import validate_curriculum


def main() -> None:
    errors = validate_curriculum(load_curriculum())
    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)
    catalog = load_spain_math_catalog()
    unit_ids = [unit.id for unit in catalog.units]
    if len(unit_ids) != len(set(unit_ids)):
        raise SystemExit("Spanish curriculum unit IDs must be unique.")
    print(f"Curriculum valid: {len(catalog.units)} Spanish mathematics units mapped.")


if __name__ == "__main__":
    main()
