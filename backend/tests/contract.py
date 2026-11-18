"""계약 테스트 도우미: contracts/api-draft.yaml(OpenAPI 3.0)의 스키마로 JSON을 검사한다.

- OpenAPI 3.0의 `nullable: true`를 JSON Schema의 null 허용으로 바꾼다.
- `properties`가 있는 객체는 계약에 없는 필드를 허용하지 않는다(FE·BE 필드 이름 일치 확인).
- 로컬(repo/backend/tests)과 컨테이너(/app/tests + /contracts, /examples 마운트) 모두에서
  parents[2]가 contracts/·examples/의 부모가 된다.
"""

from functools import cache
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
CONTRACT_FILE = ROOT / "contracts" / "api-draft.yaml"
EXAMPLES_DIR = ROOT / "examples" / "api"

_REF_PREFIX = "#/components/schemas/"


def _convert(node: Any) -> Any:
    if isinstance(node, list):
        return [_convert(v) for v in node]
    if not isinstance(node, dict):
        return node
    out = {k: _convert(v) for k, v in node.items() if k not in ("nullable", "example")}
    if "$ref" in out:
        out["$ref"] = out["$ref"].replace(_REF_PREFIX, "#/$defs/")
    if "properties" in out and "additionalProperties" not in out:
        out["additionalProperties"] = False
    if node.get("nullable"):
        return {"anyOf": [out, {"type": "null"}]}
    return out


@cache
def _defs() -> dict[str, Any]:
    spec = yaml.safe_load(CONTRACT_FILE.read_text(encoding="utf-8"))
    return {name: _convert(s) for name, s in spec["components"]["schemas"].items()}


def schema_names() -> set[str]:
    return set(_defs())


def validate(data: Any, schema: str) -> None:
    """schema 예: "AssessmentResult" 또는 배열이면 "array:NoticeSummary". 어긋나면 예외."""
    if schema.startswith("array:"):
        root = {"type": "array", "items": {"$ref": f"#/$defs/{schema.removeprefix('array:')}"}}
    else:
        root = {"$ref": f"#/$defs/{schema}"}
    Draft202012Validator({"$defs": _defs(), **root}).validate(data)
