from app.domain.visual import VisualSpec
from pydantic import BaseModel, Field, computed_field


class MathSpec(BaseModel):
    operation: str = Field(pattern="^add$")
    a: int = Field(ge=0, le=10)
    b: int = Field(ge=0, le=10)

    @computed_field
    @property
    def answer(self) -> int:
        if self.operation == "add":
            return self.a + self.b
        raise ValueError("Unsupported operation")


class ProblemSpec(BaseModel):
    id: str
    spec_version: str = "2"
    skill_id: str
    skill_version: str
    strategy: str
    representation: str
    difficulty: float = Field(ge=0, le=1)
    math: MathSpec
    unknown: str = "TOTAL"
    template_id: str
    template_version: str


class UIHints(BaseModel):
    input_mode: str = Field(pattern="^(NUMBER|MULTIPLE_CHOICE|MANIPULATIVE)$")
    submit_label: str
    show_hint_button: bool
    theme: str


class ProblemResponse(BaseModel):
    session_id: str
    session_revision: int
    state: str
    problem: ProblemSpec
    visual: VisualSpec
    rendered_story: str
    tutor_message: str | None
    allowed_actions: list[str]
    attempt_number: int
    hint_level: int
    ui: UIHints
