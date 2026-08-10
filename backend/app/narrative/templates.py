from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]


def load_templates(theme: str) -> dict:
    name = "dinosaurs" if theme == "DINOSAURS" else "space"
    return yaml.safe_load((ROOT / "curriculum" / "templates" / f"{name}.v1.yaml").read_text())
