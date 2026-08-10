from pathlib import Path

import yaml
from app.curriculum.models import Curriculum

ROOT = Path(__file__).resolve().parents[3]


def load_curriculum(path: Path | None = None) -> Curriculum:
    target = path or ROOT / "curriculum" / "skills.v1.yaml"
    return Curriculum.model_validate(yaml.safe_load(target.read_text()))
