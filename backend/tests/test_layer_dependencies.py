"""#102 계층 의존 방향 검사: domain은 웹·저장소·외부 라이브러리를 모른다.

api → application → domain ← infrastructure (repository 계약은 domain에 둔다).
새 패키지 없이 import 문을 읽어 확인한다.
"""

import ast
from pathlib import Path

import pytest

APP = Path(__file__).resolve().parents[1] / "app"

# domain이 import하면 안 되는 것
FORBIDDEN_IN_DOMAIN = ("fastapi", "pydantic", "starlette", "sqlalchemy", "httpx")
FORBIDDEN_LAYERS_IN_DOMAIN = (".api", ".application", ".infrastructure")


def imported_modules(path: Path) -> list[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    names = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names += [a.name for a in node.names]
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.append(node.module)
    return names


def violations(path: Path) -> list[str]:
    bad = []
    for module in imported_modules(path):
        if module.split(".")[0] in FORBIDDEN_IN_DOMAIN:
            bad.append(module)
        elif module.startswith("app.") and any(
            layer in module for layer in FORBIDDEN_LAYERS_IN_DOMAIN
        ):
            bad.append(module)
    return bad


DOMAIN_FILES = sorted(APP.glob("*/domain/*.py"))


def test_domain_files_exist():
    assert DOMAIN_FILES, "domain 폴더를 찾지 못했다 — 경로가 바뀌었으면 이 검사도 고친다"


@pytest.mark.parametrize("path", DOMAIN_FILES, ids=lambda p: str(p.relative_to(APP)))
def test_domain_does_not_import_web_or_infrastructure(path):
    assert violations(path) == []


def test_checker_catches_forbidden_import(tmp_path):
    """검사가 실제로 잡는지: domain 파일이 fastapi나 api 계층을 import하면 실패해야 한다."""
    bad = tmp_path / "model.py"
    bad.write_text(
        "from fastapi import APIRouter\nfrom app.notice.api.schemas import X\n", encoding="utf-8"
    )
    assert violations(bad) == ["fastapi", "app.notice.api.schemas"]
