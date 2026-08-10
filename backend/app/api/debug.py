from app.config import settings
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/debug")


@router.get("/config")
def debug_config():
    if settings.app_env != "development":
        raise HTTPException(status_code=404)
    return {"app_env": settings.app_env, "llm_enabled": settings.llm_enabled}
