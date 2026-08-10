from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, HttpUrl

ROOT = Path(__file__).resolve().parents[3]


class CurriculumSource(BaseModel):
    id: str
    stage: Literal["PRIMARY", "ESO"]
    title: str
    url: HttpUrl


class SpainFramework(BaseModel):
    id: str
    version: str
    jurisdiction: str
    title: str
    sources: list[CurriculumSource]
    note: str


class CurriculumUnit(BaseModel):
    id: str
    stage: Literal["PRIMARY", "ESO"]
    grades: list[int]
    cycle: int | None
    title: str
    sense: str
    competency_refs: list[str]
    assessment_refs: list[str]
    basic_knowledge_refs: list[str]
    skill_ids: list[str]
    content_status: Literal["READY", "PLANNED"]


class SpainMathCatalog(BaseModel):
    framework: SpainFramework
    units: list[CurriculumUnit]


def load_spain_math_catalog() -> SpainMathCatalog:
    path = ROOT / "curriculum" / "spain_math.v1.yaml"
    return SpainMathCatalog.model_validate(yaml.safe_load(path.read_text()))
