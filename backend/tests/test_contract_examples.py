"""#23 MVP API 계약: 예제 JSON(TEST_ONLY)이 contracts/api-draft.yaml 스키마와 일치하는지.

FE는 이 예제로 mock 화면을, BE는 같은 스키마로 실제 응답을 맞춘다.
"""

import json
from typing import Any

import pytest

from tests.contract import EXAMPLES_DIR, schema_names, validate

# 예제 파일 → 스키마. 새 예제를 추가하면 여기에도 추가한다.
EXAMPLES = {
    "notices.list.json": "array:NoticeSummary",
    "notice.detail.json": "NoticeDetail",
    "assessment.request.unknown-income.json": "AssessmentRequest",
    "assessment.eligible.json": "AssessmentResult",
    "assessment.ineligible.json": "AssessmentResult",
    "assessment.needs-review.json": "AssessmentResult",
    "preparation-summary.prepared.json": "PreparationSummary",
    "preparation-summary.with-open-items.json": "PreparationSummary",
    "error.notice-not-verified.json": "DomainError",
}


def load(name: str) -> Any:
    return json.loads((EXAMPLES_DIR / name).read_text(encoding="utf-8"))


def walk(node: Any):
    yield node
    if isinstance(node, dict):
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


@pytest.mark.parametrize(("name", "schema"), EXAMPLES.items())
def test_example_matches_contract_schema(name: str, schema: str):
    validate(load(name), schema)


def test_every_example_file_is_checked():
    on_disk = {p.name for p in EXAMPLES_DIR.glob("*.json")}
    assert on_disk == set(EXAMPLES)


def test_mvp_schemas_exist_in_contract():
    required = {
        "NoticeSummary",
        "NoticeDetail",
        "AssessmentRequest",
        "AssessmentResult",
        "PreparationSummary",
        "ReasonCode",
        "DomainError",
    }
    assert required <= schema_names()


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("assessment.eligible.json", "ELIGIBLE"),
        ("assessment.ineligible.json", "INELIGIBLE"),
        ("assessment.needs-review.json", "NEEDS_REVIEW"),
    ],
)
def test_assessment_examples_cover_three_results(name: str, expected: str):
    assert load(name)["eligibilityResult"] == expected


def test_BR_B01_unknown_fact_is_null_not_zero_or_false():
    """모름은 null. 0/false/빈 문자열로 바꾸지 않는다 (BR-B01, AC-B01)."""
    request = load("assessment.request.unknown-income.json")
    income = next(f for f in request["facts"] if f["field"] == "incomeBracket")
    assert income["isKnown"] is False
    assert income["value"] is None

    for name in EXAMPLES:
        for node in walk(load(name)):
            if isinstance(node, dict) and node.get("isKnown") is False:
                assert node.get("value") is None, name


def test_BR_C07_preparation_is_never_submitted():
    """준비 완료 != 공식 접수. 제출 상태·필드가 계약과 예제에 없다 (BR-C07, AC-C07)."""
    for name in EXAMPLES:
        text = (EXAMPLES_DIR / name).read_text(encoding="utf-8")
        assert "SUBMITTED" not in text, name
        assert '"submitted"' not in text, name


def test_example_notices_are_marked_test_only():
    """가상 공고는 실제 장학금 규정이 아니다 (examples/README)."""
    notices = load("notices.list.json") + [load("notice.detail.json")["notice"]]
    assert notices
    assert all(n["isTestOnly"] is True for n in notices)
