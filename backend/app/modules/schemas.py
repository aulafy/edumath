from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class ModuleAuthor(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    role: str = Field(default="AUTHOR", max_length=40)


class CurriculumMapping(BaseModel):
    jurisdiction: str = Field(default="ES", pattern="^ES$")
    autonomous_community: str = Field(default="STATE_BASE", max_length=60)
    stage: Literal["PRIMARY", "ESO"]
    grades: list[int] = Field(min_length=1)
    subject: str = Field(min_length=2, max_length=80)
    competencies: list[str] = Field(default_factory=list)
    assessment_criteria: list[str] = Field(default_factory=list)
    basic_knowledge: list[str] = Field(default_factory=list)

    @field_validator("grades")
    @classmethod
    def validate_grades(cls, grades: list[int], info):
        if len(grades) != len(set(grades)):
            raise ValueError("Grades must be unique.")
        return grades

    @model_validator(mode="after")
    def validate_stage_grades(self):
        valid = range(1, 7) if self.stage == "PRIMARY" else range(1, 5)
        if any(grade not in valid for grade in self.grades):
            raise ValueError(f"Grades are outside the valid range for {self.stage}.")
        return self


class EduModuleManifest(BaseModel):
    format: Literal["EDUMODULE"]
    format_version: Literal["1.0"]
    id: str = Field(pattern=r"^[a-z0-9]+(?:[.-][a-z0-9]+)+$", max_length=160)
    version: str = Field(pattern=r"^\d+\.\d+\.\d+$")
    title: str = Field(min_length=3, max_length=140)
    summary: str = Field(min_length=10, max_length=500)
    language: str = Field(default="es", pattern=r"^[a-z]{2}(?:-[A-Z]{2})?$")
    license: Literal["CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0"]
    authors: list[ModuleAuthor] = Field(min_length=1)
    curriculum: list[CurriculumMapping] = Field(min_length=1)
    activity_files: list[str] = Field(min_length=1, max_length=100)
    asset_files: list[str] = Field(default_factory=list, max_length=100)
    created_at: str


class CoinValueScene(BaseModel):
    type: Literal["COIN_VALUE"]
    value: str = Field(min_length=1, max_length=40)
    answer: str = Field(min_length=1, max_length=120)


class FoodChainScene(BaseModel):
    type: Literal["FOOD_CHAIN"]
    answer: str = Field(min_length=1, max_length=120)


class ClosedQuestionContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    options: list[str] = Field(min_length=2, max_length=6)
    correct_option: str
    explanation: str = Field(min_length=3, max_length=500)
    scene: CoinValueScene | FoodChainScene | None = None

    @model_validator(mode="after")
    def validate_answer(self):
        if len(self.options) != len(set(self.options)):
            raise ValueError("Closed-question options must be unique.")
        if self.correct_option not in self.options:
            raise ValueError("The correct option must appear in options.")
        if self.scene and self.scene.answer != self.correct_option:
            raise ValueError("The scene answer must match the correct option.")
        return self


class ClassificationItem(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)


class ClassificationContent(BaseModel):
    prompt: str = Field(min_length=3, max_length=500)
    categories: list[str] = Field(min_length=2, max_length=6)
    items: list[ClassificationItem] = Field(min_length=2, max_length=20)
    explanation: str = Field(min_length=3, max_length=500)

    @model_validator(mode="after")
    def validate_categories(self):
        if len(self.categories) != len(set(self.categories)):
            raise ValueError("Classification categories must be unique.")
        if any(item.category not in self.categories for item in self.items):
            raise ValueError("Every classification answer must use a declared category.")
        return self


class ModuleActivity(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=100)
    type: Literal[
        "EXPLANATION",
        "CLOSED_QUESTION",
        "OPEN_QUESTION",
        "CLASSIFICATION",
        "TIMELINE",
        "MAP",
        "SIMULATION",
        "GUIDED_EXPERIMENT",
        "READING",
        "WRITING",
        "ASSESSMENT",
    ]
    title: str = Field(min_length=3, max_length=140)
    instructions: str = Field(min_length=3, max_length=1000)
    content: dict = Field(default_factory=dict)
    evidence: dict = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_interactive_content(self):
        if self.type == "CLOSED_QUESTION":
            ClosedQuestionContent.model_validate(self.content)
        elif self.type == "CLASSIFICATION":
            ClassificationContent.model_validate(self.content)
        return self
