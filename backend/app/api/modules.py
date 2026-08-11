import json
import secrets
from datetime import UTC, datetime
from uuid import uuid4

from app.db.models import ClassroomRow, EducationalModuleRow
from app.db.session import get_db
from app.modules.package import MAX_PACKAGE_BYTES, ModulePackageError, validate_module_package
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter(prefix="/modules")


def _require_known_teacher(db: Session, teacher_key: str | None) -> None:
    if not teacher_key:
        raise HTTPException(status_code=403, detail="A teacher key is required.")
    rows = db.scalars(select(ClassroomRow)).all()
    if not any(secrets.compare_digest(row.teacher_key, teacher_key) for row in rows):
        raise HTTPException(status_code=403, detail="Invalid teacher key.")


def _module_payload(row: EducationalModuleRow) -> dict:
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
    return {**_module_payload(row), "manifest": json.loads(row.manifest_json)}


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
