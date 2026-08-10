from app.domain.problem import ProblemSpec
from app.domain.story import StorySpec
from app.narrative.templates import load_templates


def story_for_problem(problem: ProblemSpec, theme: str = "DINOSAURS") -> tuple[StorySpec, str]:
    data = load_templates(theme)
    template = next(t for t in data["templates"] if t["id"] == problem.template_id)
    spec = StorySpec(
        id=f"story-{problem.id}",
        version=data["version"],
        theme=theme,
        place=template["place"],
        object_singular=template["object_singular"],
        object_plural=template["object_plural"],
        character=template.get("character"),
        template_id=template["id"],
        template_version=data["version"],
    )
    rendered = template["text"].format(
        character=spec.character,
        a=problem.math.a,
        b=problem.math.b,
        object=spec.object_singular if problem.math.a == 1 else spec.object_plural,
        object_plural=spec.object_plural,
    )
    return spec, rendered
