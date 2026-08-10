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


class ClassroomRow(Base):
    __tablename__ = "classrooms"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    teacher_key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    stage: Mapped[str] = mapped_column(String, nullable=False)
    grade: Mapped[int] = mapped_column(Integer, nullable=False)
    autonomous_community: Mapped[str] = mapped_column(String, default="STATE_BASE")
    created_at: Mapped[str] = mapped_column(String, nullable=False)


class LessonRow(Base):
    __tablename__ = "lessons"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    classroom_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    instructions: Mapped[str] = mapped_column(Text, default="")
    curriculum_unit_id: Mapped[str] = mapped_column(String, nullable=False)
    skill_ids_json: Mapped[str] = mapped_column(Text, nullable=False)
    problem_count: Mapped[int] = mapped_column(Integer, default=8)
    theme: Mapped[str] = mapped_column(String, default="DINOSAURS")
    pacing: Mapped[str] = mapped_column(String, default="STUDENT")
    created_at: Mapped[str] = mapped_column(String, nullable=False)


class AssignmentRow(Base):
    __tablename__ = "assignments"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    lesson_id: Mapped[str] = mapped_column(String, nullable=False)
    join_code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String, default="OPEN")
    starts_at: Mapped[str | None] = mapped_column(String)
    due_at: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[str] = mapped_column(String, nullable=False)


class EnrollmentRow(Base):
    __tablename__ = "enrollments"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    classroom_id: Mapped[str] = mapped_column(String, nullable=False)
    student_id: Mapped[str] = mapped_column(String, nullable=False)
    joined_at: Mapped[str] = mapped_column(String, nullable=False)


class SessionPlanRow(Base):
    __tablename__ = "session_plans"
    session_id: Mapped[str] = mapped_column(String, primary_key=True)
    assignment_id: Mapped[str] = mapped_column(String, nullable=False)
    skill_ids_json: Mapped[str] = mapped_column(Text, nullable=False)
    problem_count: Mapped[int] = mapped_column(Integer, nullable=False)
