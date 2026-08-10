import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.domain.problem import MathSpec
from app.pedagogy.classification import classify_answer


def run() -> tuple[int, int]:
    passed = 0
    failed = 0
    for path in Path("scenarios").glob("*/*.yaml"):
        scenario = yaml.safe_load(path.read_text())
        spec = MathSpec(operation="add", a=scenario["problem"]["a"], b=scenario["problem"]["b"])
        for step in scenario["steps"]:
            classification, correct, _ = classify_answer(spec, step["child"]["answer"])
            expected = step["expect"]["classification"]
            if classification.value == expected and correct is step["expect"].get(
                "correct", correct
            ):
                passed += 1
            else:
                failed += 1
                print(f"FAILED {path}: got {classification.value}, expected {expected}")
    return passed, failed


def main() -> None:
    passed, failed = run()
    print("Scenario contracts:")
    print(f"{passed} passed")
    print(f"{failed} failed")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
