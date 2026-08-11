from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "examples" / "modules" / "plant-growth"
OUTPUT = ROOT / "examples" / "dist" / "org.edumath.examples.plant-growth-1.0.0.edumath"


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as archive:
        for path in sorted(item for item in SOURCE.rglob("*") if item.is_file()):
            info = ZipInfo(path.relative_to(SOURCE).as_posix(), date_time=(2026, 8, 11, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    print(f"Built {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
