import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.db.session import init_db, session_scope
from app.student.repository import StudentCreate, create_student


def main() -> None:
    init_db()
    db = session_scope()
    try:
        student = create_student(db, StudentCreate(display_name="Demo"))
        print(f"Created demo student {student.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
