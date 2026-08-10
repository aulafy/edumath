from app.curriculum.spain import load_spain_math_catalog
from fastapi import APIRouter

router = APIRouter(prefix="/curriculum")


@router.get("/spain/mathematics")
def spain_mathematics(stage: str | None = None, grade: int | None = None):
    catalog = load_spain_math_catalog()
    units = catalog.units
    if stage:
        units = [unit for unit in units if unit.stage == stage.upper()]
    if grade:
        units = [unit for unit in units if grade in unit.grades]
    return {"framework": catalog.framework, "units": units}
