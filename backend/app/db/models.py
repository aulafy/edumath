from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class StudentRow(Base):
    __tablename__ = "students"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    age_band: Mapped[str] = mapped_column(String, default="6-8")
    created_at: Mapped[str] = mapped_column(String, nullable=False)


class SessionRow(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    student_id: Mapped[str] = mapped_column(String, nullable=False)
    revision: Mapped[int] = mapped_column(Integer, default=0)
    state: Mapped[str] = mapped_column(String, nullable=False)
    active_problem_json: Mapped[str] = mapped_column(Text, nullable=False)
    active_visual_json: Mapped[str] = mapped_column(Text, nullable=False)
    rendered_story: Mapped[str] = mapped_column(Text, nullable=False)
    tutor_message: Mapped[str | None] = mapped_column(Text)
    attempt_number: Mapped[int] = mapped_column(Integer, default=1)
    hint_level: Mapped[int] = mapped_column(Integer, default=0)
    theme: Mapped[str] = mapped_column(String, default="DINOSAURS")
    created_at: Mapped[str] = mapped_column(String, nullable=False)


class AttemptRow(Base):
    __tablename__ = "attempts"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    idempotency_key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    student_id: Mapped[str] = mapped_column(String, nullable=False)
    session_id: Mapped[str] = mapped_column(String, nullable=False)
    session_revision: Mapped[int] = mapped_column(Integer, nullable=False)
    problem_id: Mapped[str] = mapped_column(String, nullable=False)
    skill_id: Mapped[str] = mapped_column(String, nullable=False)
    skill_version: Mapped[str] = mapped_column(String, nullable=False)
    representation: Mapped[str] = mapped_column(String, nullable=False)
    strategy: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[float] = mapped_column(Float, nullable=False)
    submitted_answer: Mapped[str | None] = mapped_column(String)
    classification: Mapped[str] = mapped_column(String, nullable=False)
    correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    hint_level: Mapped[int] = mapped_column(Integer, default=0)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
    response_ms: Mapped[int | None] = mapped_column(Integer)
    error_type: Mapped[str | None] = mapped_column(String)
    misconception_candidate: Mapped[str | None] = mapped_column(String)
    response_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(String, nullable=False)


class EventRow(Base):
    __tablename__ = "events"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    student_id: Mapped[str] = mapped_column(String, nullable=False)
    session_id: Mapped[str] = mapped_column(String, nullable=False)
    event_type: Mapped[str] = mapped_column(String, nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(String, nullable=False)
