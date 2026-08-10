from app.consistency.age_language_checks import check_age_language
from app.consistency.math_checks import check_math
from app.consistency.narrative_checks import check_narrative
from app.consistency.pedagogy_checks import check_pedagogy
from app.consistency.visual_checks import check_visual
from app.domain.problem import ProblemSpec
from pydantic import BaseModel


class GateResult(BaseModel):
    passed: bool
    errors: list[str]


class ConsistencyGate:
    def validate(self, problem: ProblemSpec, visual, rendered_story: str) -> GateResult:
        errors: list[str] = []
        errors += check_math(problem)
        errors += check_visual(problem, visual)
        errors += check_narrative(problem, rendered_story)
        errors += check_pedagogy(problem)
        errors += check_age_language(rendered_story)
        return GateResult(passed=not errors, errors=errors)
