import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "content" / "open_modules.v1.json"
OUTPUT = ROOT / "examples" / "dist"
LICENSE_NOTICE = """Creative Commons Attribution 4.0 International

Copyright (c) 2026 EduMath Contributors
Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
"""


def write_file(archive: ZipFile, name: str, content: str) -> None:
    info = ZipInfo(name, date_time=(2026, 8, 11, 0, 0, 0))
    info.compress_type = ZIP_DEFLATED
    info.external_attr = 0o100644 << 16
    archive.writestr(info, content.encode())


def main() -> None:
    modules = json.loads(CATALOG.read_text())["modules"]
    modules.extend(
        json.loads(path.read_text())
        for path in sorted((ROOT / "content" / "generated" / "primary").glob("*.json"))
    )
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for module in modules:
        activities = module.pop("activities")
        activity_files = [f"activities/{activity['id']}.json" for activity in activities]
        manifest = {
            "format": "EDUMODULE",
            "format_version": "1.0",
            "id": module["id"],
            "version": module.get("version", "1.0.0"),
            "title": module["title"],
            "summary": module["summary"],
            "language": "es",
            "license": "CC-BY-4.0",
            "authors": [{"name": "EduMath Contributors", "role": "AUTHOR"}],
            "curriculum": [
                {
                    "jurisdiction": "ES",
                    "autonomous_community": "STATE_BASE",
                    "stage": module["stage"],
                    "grades": module["grades"],
                    "subject": module["subject"],
                    "competencies": module["competencies"],
                    "assessment_criteria": module["assessment_criteria"],
                    "basic_knowledge": module["basic_knowledge"],
                }
            ],
            "activity_files": activity_files,
            "asset_files": [],
            "created_at": "2026-08-11T00:00:00Z",
            "review_status": module.get("review_status", "COMMUNITY_DRAFT"),
            "curriculum_strand": module.get("curriculum_strand"),
        }
        target = OUTPUT / f"{module['id']}-{manifest['version']}.edumath"
        with ZipFile(target, "w") as archive:
            write_file(archive, "manifest.json", json.dumps(manifest, ensure_ascii=False))
            write_file(archive, "LICENSE", LICENSE_NOTICE)
            for path, activity in zip(activity_files, activities, strict=True):
                write_file(archive, path, json.dumps(activity, ensure_ascii=False))
        print(f"Built {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
