import os
from tempfile import TemporaryDirectory

_test_database_dir = TemporaryDirectory(prefix="edumath-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_test_database_dir.name}/test.sqlite"
