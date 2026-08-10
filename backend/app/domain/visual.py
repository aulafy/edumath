from typing import Annotated, Literal

from pydantic import BaseModel, Field


class TenFrameSpec(BaseModel):
    type: Literal["TEN_FRAME"]
    filled: int = Field(ge=0, le=10)
    added: int = Field(ge=0, le=10)
    unknown: Literal["TOTAL"] | None = None


class NumberLineSpec(BaseModel):
    type: Literal["NUMBER_LINE"]
    minimum: int = 0
    maximum: int = 10
    start: int = Field(ge=0, le=10)
    jumps: list[int]
    unknown: Literal["END"] | None = None


class PartPartWholeSpec(BaseModel):
    type: Literal["PART_PART_WHOLE"]
    part_a: int = Field(ge=0, le=10)
    part_b: int = Field(ge=0, le=10)
    whole: int | None
    unknown: Literal["WHOLE", "PART_A", "PART_B"]


VisualSpec = Annotated[
    TenFrameSpec | NumberLineSpec | PartPartWholeSpec,
    Field(discriminator="type"),
]
