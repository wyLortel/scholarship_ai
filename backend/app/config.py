import os
from pathlib import Path

# 컨테이너(/app/app/config.py → /examples)와 로컬(repo/backend/app → repo/examples) 모두 parents[2].
_DEFAULT_FIXTURE = Path(__file__).resolve().parents[2] / "examples" / "fixture-notices.json"


def fixture_notices_file() -> Path:
    return Path(os.environ.get("FIXTURE_NOTICES_FILE", _DEFAULT_FIXTURE))
