from pydantic import BaseModel, Field


class MinimumEvidence(BaseModel):
    independent_correct: int = Field(ge=1)
    distinct_problems: int = Field(ge=1)


class SoftLock(BaseModel):
    max_consecutive_failures: int = Field(ge=1)


class Skill(BaseModel):
    id: str
    version: str
    title: str
    prerequisites: list[str]
    allowed_representations: list[str]
    strategies: list[str]
    mastery_threshold: float = Field(ge=0, le=1)
    minimum_evidence: MinimumEvidence
    soft_lock: SoftLock


class Curriculum(BaseModel):
    skills: list[Skill]
