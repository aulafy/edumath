import hashlib
import json
from dataclasses import dataclass
from io import BytesIO
from pathlib import PurePosixPath
from zipfile import BadZipFile, ZipFile

import yaml
from app.modules.schemas import EduModuleManifest, ModuleActivity
from pydantic import ValidationError

MAX_PACKAGE_BYTES = 20_000_000
MAX_UNCOMPRESSED_BYTES = 50_000_000
MAX_FILES = 200
ALLOWED_SUFFIXES = {
    ".json",
    ".yaml",
    ".yml",
    ".md",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".mp3",
    ".wav",
    ".ogg",
    ".pdf",
}


class ModulePackageError(ValueError):
    pass


@dataclass(frozen=True)
class ValidatedModulePackage:
    manifest: EduModuleManifest
    activities: list[ModuleActivity]
    package_sha256: str


def _safe_member_name(name: str) -> bool:
    path = PurePosixPath(name)
    return bool(name) and not path.is_absolute() and ".." not in path.parts and "\\" not in name


def validate_module_package(content: bytes) -> ValidatedModulePackage:
    if not content or len(content) > MAX_PACKAGE_BYTES:
        raise ModulePackageError("Package must be between 1 byte and 20 MB.")
    try:
        archive = ZipFile(BytesIO(content))
    except BadZipFile as exc:
        raise ModulePackageError("EduModule package is not a valid ZIP archive.") from exc
    with archive:
        members = archive.infolist()
        if len(members) > MAX_FILES:
            raise ModulePackageError("EduModule package contains too many files.")
        if sum(member.file_size for member in members) > MAX_UNCOMPRESSED_BYTES:
            raise ModulePackageError("Uncompressed package exceeds 50 MB.")
        names = {member.filename for member in members if not member.is_dir()}
        if "manifest.json" not in names or "LICENSE" not in names:
            raise ModulePackageError("manifest.json and LICENSE are required.")
        if not archive.read("LICENSE").strip():
            raise ModulePackageError("LICENSE must contain the module content license.")
        for member in members:
            if member.is_dir():
                continue
            if not _safe_member_name(member.filename):
                raise ModulePackageError(f"Unsafe package path: {member.filename}")
            if (
                member.filename != "LICENSE"
                and PurePosixPath(member.filename).suffix.lower() not in ALLOWED_SUFFIXES
            ):
                raise ModulePackageError(f"Unsupported file type: {member.filename}")
            if (member.external_attr >> 16) & 0o170000 == 0o120000:
                raise ModulePackageError("Symbolic links are not allowed.")
        try:
            manifest = EduModuleManifest.model_validate_json(archive.read("manifest.json"))
        except (ValidationError, UnicodeDecodeError) as exc:
            raise ModulePackageError("Invalid EduModule manifest.") from exc
        declared = set(manifest.activity_files + manifest.asset_files)
        missing = declared - names
        if missing:
            raise ModulePackageError(f"Declared files are missing: {', '.join(sorted(missing))}")
        if any(not path.startswith("activities/") for path in manifest.activity_files):
            raise ModulePackageError("Activity files must be inside activities/.")
        activities: list[ModuleActivity] = []
        for path in manifest.activity_files:
            try:
                raw = archive.read(path).decode("utf-8")
                data = json.loads(raw) if path.endswith(".json") else yaml.safe_load(raw)
                activities.append(ModuleActivity.model_validate(data))
            except (KeyError, UnicodeDecodeError, json.JSONDecodeError, ValidationError) as exc:
                raise ModulePackageError(f"Invalid activity file: {path}") from exc
        activity_ids = [activity.id for activity in activities]
        if len(activity_ids) != len(set(activity_ids)):
            raise ModulePackageError("Activity IDs must be unique.")
    return ValidatedModulePackage(
        manifest=manifest,
        activities=activities,
        package_sha256=hashlib.sha256(content).hexdigest(),
    )
