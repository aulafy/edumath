from contextlib import asynccontextmanager

from app.api import classrooms, curriculum, debug, health, progress, sessions, students, voice
from app.config import settings
from app.db.session import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Math AI Tutor", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(debug.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(curriculum.router, prefix="/api")
app.include_router(classrooms.router, prefix="/api")
