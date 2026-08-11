import json
import secrets
from datetime import UTC, datetime
from uuid import uuid4

from app.db.models import (
    AssignmentRow,
    ClassroomRow,
    EducationalModuleRow,
    EnrollmentRow,
    ModuleActivityProgressRow,
    ModuleAssignmentRow,
    StudentRow,
)
from app.db.session import get_db
from app.modules.package import MAX_PACKAGE_BYTES, ModulePackageError, validate_module_package
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter(prefix="/modules")


class ModuleAssignmentCreate(BaseModel):
    classroom_id: str
    activity_ids: list[str] = Field(min_length=1, max_length=100)
    starts_at: str | None = None
    due_at: str | None = None


class ModuleJoinRequest(BaseModel):
    student_id: str


class ActivityCompleteRequest(BaseModel):
    student_id: str
    response: str | dict | list[int] | None = None


def _require_known_teacher(db: Session, teacher_key: str | None) -> None:
    if not teacher_key:
        raise HTTPException(status_code=403, detail="A teacher key is required.")
    rows = db.scalars(select(ClassroomRow)).all()
    if not any(secrets.compare_digest(row.teacher_key, teacher_key) for row in rows):
        raise HTTPException(status_code=403, detail="Invalid teacher key.")


def _module_payload(row: EducationalModuleRow) -> dict:
    manifest = json.loads(row.manifest_json)
    return {
        "id": row.id,
        "module_id": row.module_id,
        "version": row.version,
        "title": row.title,
        "summary": row.summary,
        "subject": row.subject,
        "stage": row.stage,
        "grades": json.loads(row.grades_json),
        "license": row.license,
        "authors": json.loads(row.authors_json),
        "status": row.status,
        "package_sha256": row.package_sha256,
        "imported_at": row.imported_at,
        "review_status": manifest.get("review_status", "COMMUNITY_DRAFT"),
        "curriculum_strand": manifest.get("curriculum_strand"),
        "generation_provider": manifest.get("generation_provider"),
    }


def _validated_activities(row: EducationalModuleRow):
    return validate_module_package(row.package_bytes).activities


def _make_join_code(db: Session) -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    for _ in range(20):
        code = "".join(secrets.choice(alphabet) for _ in range(6))
        used_by_lesson = db.scalar(select(AssignmentRow).where(AssignmentRow.join_code == code))
        used_by_module = db.scalar(
            select(ModuleAssignmentRow).where(ModuleAssignmentRow.join_code == code)
        )
        if not used_by_lesson and not used_by_module:
            return code
    raise HTTPException(status_code=503, detail="Could not allocate an assignment code.")


def _assignment_payload(
    assignment: ModuleAssignmentRow,
    module: EducationalModuleRow,
    student_id: str | None = None,
    db: Session | None = None,
) -> dict:
    selected_ids = json.loads(assignment.activity_ids_json)
    activities = [
        activity.model_dump()
        for activity in _validated_activities(module)
        if activity.id in selected_ids
    ]
    activities.sort(key=lambda activity: selected_ids.index(activity["id"]))
    completed: list[str] = []
    if student_id and db:
        completed = list(
            db.scalars(
                select(ModuleActivityProgressRow.activity_id).where(
                    ModuleActivityProgressRow.assignment_id == assignment.id,
                    ModuleActivityProgressRow.student_id == student_id,
                )
            ).all()
        )
    return {
        "kind": "MODULE",
        "id": assignment.id,
        "join_code": assignment.join_code,
        "status": assignment.status,
        "module": _module_payload(module),
        "activities": activities,
        "completed_activity_ids": completed,
    }


@router.get("")
def list_modules(
    subject: str | None = None,
    stage: str | None = None,
    db: Session = Depends(get_db),
):
    query = select(EducationalModuleRow).where(EducationalModuleRow.status == "VALIDATED")
    if subject:
        query = query.where(EducationalModuleRow.subject == subject.upper())
    if stage:
        query = query.where(EducationalModuleRow.stage == stage.upper())
    rows = db.scalars(query.order_by(EducationalModuleRow.title)).all()
    return [_module_payload(row) for row in rows]


@router.get("/{module_row_id}")
def get_module(module_row_id: str, db: Session = Depends(get_db)):
    row = db.get(EducationalModuleRow, module_row_id)
    if not row or row.status != "VALIDATED":
        raise HTTPException(status_code=404, detail="Module not found.")
    return {
        **_module_payload(row),
        "manifest": json.loads(row.manifest_json),
        "activities": [activity.model_dump() for activity in _validated_activities(row)],
    }


@router.post("/import")
async def import_module(
    package: UploadFile = File(...),
    x_teacher_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    _require_known_teacher(db, x_teacher_key)
    content = await package.read(MAX_PACKAGE_BYTES + 1)
    try:
        validated = validate_module_package(content)
    except ModulePackageError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    manifest = validated.manifest
    existing = db.scalar(
        select(EducationalModuleRow).where(
            EducationalModuleRow.module_id == manifest.id,
            EducationalModuleRow.version == manifest.version,
        )
    )
    if existing:
        if existing.package_sha256 == validated.package_sha256:
            return _module_payload(existing)
        raise HTTPException(status_code=409, detail="This module version already exists.")
    primary_mapping = manifest.curriculum[0]
    row = EducationalModuleRow(
        id=str(uuid4()),
        module_id=manifest.id,
        version=manifest.version,
        title=manifest.title,
        summary=manifest.summary,
        subject=primary_mapping.subject.upper(),
        stage=primary_mapping.stage,
        grades_json=json.dumps(primary_mapping.grades),
        license=manifest.license,
        authors_json=json.dumps([author.model_dump() for author in manifest.authors]),
        manifest_json=manifest.model_dump_json(),
        package_sha256=validated.package_sha256,
        package_bytes=content,
        status="VALIDATED",
        imported_at=datetime.now(UTC).isoformat(),
    )
    db.add(row)
    db.commit()
    return _module_payload(row)


@router.post("/{module_row_id}/assignments")
def publish_module_assignment(
    module_row_id: str,
    data: ModuleAssignmentCreate,
    x_teacher_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    module = db.get(EducationalModuleRow, module_row_id)
    classroom = db.get(ClassroomRow, data.classroom_id)
    if not module or module.status != "VALIDATED":
        raise HTTPException(status_code=404, detail="Module not found.")
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found.")
    if not x_teacher_key or not secrets.compare_digest(classroom.teacher_key, x_teacher_key):
        raise HTTPException(status_code=403, detail="Invalid teacher key.")
    mappings = json.loads(module.manifest_json)["curriculum"]
    if not any(
        mapping["stage"] == classroom.stage and classroom.grade in mapping["grades"]
        for mapping in mappings
    ):
        raise HTTPException(
            status_code=422, detail="Module does not match the class stage and grade."
        )
    available_ids = {activity.id for activity in _validated_activities(module)}
    if (
        len(data.activity_ids) != len(set(data.activity_ids))
        or not set(data.activity_ids) <= available_ids
    ):
        raise HTTPException(status_code=422, detail="Assignment contains invalid activities.")
    assignment = ModuleAssignmentRow(
        id=str(uuid4()),
        classroom_id=classroom.id,
        module_row_id=module.id,
        activity_ids_json=json.dumps(data.activity_ids),
        join_code=_make_join_code(db),
        status="OPEN",
        starts_at=data.starts_at,
        due_at=data.due_at,
        created_at=datetime.now(UTC).isoformat(),
    )
    db.add(assignment)
    db.commit()
    return _assignment_payload(assignment, module)


@router.post("/assignments/{join_code}/join")
def join_module_assignment(
    join_code: str,
    data: ModuleJoinRequest,
    db: Session = Depends(get_db),
):
    assignment = db.scalar(
        select(ModuleAssignmentRow).where(ModuleAssignmentRow.join_code == join_code.upper())
    )
    student = db.get(StudentRow, data.student_id)
    if not assignment or assignment.status != "OPEN":
        raise HTTPException(status_code=404, detail="Open module assignment not found.")
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    enrollment = db.scalar(
        select(EnrollmentRow).where(
            EnrollmentRow.classroom_id == assignment.classroom_id,
            EnrollmentRow.student_id == student.id,
        )
    )
    if not enrollment:
        db.add(
            EnrollmentRow(
                id=str(uuid4()),
                classroom_id=assignment.classroom_id,
                student_id=student.id,
                joined_at=datetime.now(UTC).isoformat(),
            )
        )
        db.commit()
    module = db.get(EducationalModuleRow, assignment.module_row_id)
    return _assignment_payload(assignment, module, student.id, db)


@router.post("/assignments/{join_code}/activities/{activity_id}/complete")
def complete_module_activity(
    join_code: str,
    activity_id: str,
    data: ActivityCompleteRequest,
    db: Session = Depends(get_db),
):
    assignment = db.scalar(
        select(ModuleAssignmentRow).where(ModuleAssignmentRow.join_code == join_code.upper())
    )
    if not assignment or assignment.status != "OPEN":
        raise HTTPException(status_code=404, detail="Open module assignment not found.")
    selected_ids = json.loads(assignment.activity_ids_json)
    if activity_id not in selected_ids:
        raise HTTPException(status_code=404, detail="Activity not assigned.")
    if not db.get(StudentRow, data.student_id):
        raise HTTPException(status_code=404, detail="Student not found.")
    enrollment = db.scalar(
        select(EnrollmentRow).where(
            EnrollmentRow.classroom_id == assignment.classroom_id,
            EnrollmentRow.student_id == data.student_id,
        )
    )
    if not enrollment:
        raise HTTPException(status_code=403, detail="Student has not joined this class.")
    module = db.get(EducationalModuleRow, assignment.module_row_id)
    activity = next(item for item in _validated_activities(module) if item.id == activity_id)
    if activity.type == "CLOSED_QUESTION" and data.response != activity.content["correct_option"]:
        raise HTTPException(status_code=422, detail="The submitted answer is not correct.")
    if activity.type == "CLASSIFICATION":
        expected = {item["label"]: item["category"] for item in activity.content["items"]}
        if data.response != expected:
            raise HTTPException(
                status_code=422, detail="The submitted classification is not correct."
            )
    if activity.type == "BALANCE_LAB":
        weights = activity.content["weights"]
        if (
            not isinstance(data.response, list)
            or any(type(value) is not int for value in data.response)
            or len(data.response) != len(set(data.response))
            or any(value not in weights for value in data.response)
            or sum(data.response) != activity.content["left_value"]
        ):
            raise HTTPException(status_code=422, detail="The submitted weights do not balance.")
    existing = db.scalar(
        select(ModuleActivityProgressRow).where(
            ModuleActivityProgressRow.assignment_id == assignment.id,
            ModuleActivityProgressRow.student_id == data.student_id,
            ModuleActivityProgressRow.activity_id == activity_id,
        )
    )
    if not existing:
        db.add(
            ModuleActivityProgressRow(
                id=str(uuid4()),
                assignment_id=assignment.id,
                student_id=data.student_id,
                activity_id=activity_id,
                status="COMPLETED",
                completed_at=datetime.now(UTC).isoformat(),
            )
        )
        db.commit()
    return _assignment_payload(assignment, module, data.student_id, db)


@router.get("/{module_row_id}/export")
def export_module(module_row_id: str, db: Session = Depends(get_db)):
    row = db.get(EducationalModuleRow, module_row_id)
    if not row or row.status != "VALIDATED":
        raise HTTPException(status_code=404, detail="Module not found.")
    filename = f"{row.module_id}-{row.version}.edumath"
    return Response(
        content=row.package_bytes,
        media_type="application/vnd.edumath.module+zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
