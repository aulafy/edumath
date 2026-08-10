from typing import Literal

from pydantic import BaseModel


class StorySpec(BaseModel):
    id: str
    version: str
    theme: Literal["DINOSAURS", "SPACE"]
    place: str
    object_singular: str
    object_plural: str
    character: str | None = None
    template_id: str
    template_version: str
