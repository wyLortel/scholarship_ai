"""#34 준비 결과 상태와 공식 제출 안내 (09 §4, BR-C04, BR-C07).

준비 요약은 서비스 안의 준비 자료일 뿐이다. 제출 상태(`SUBMITTED`)를 만들지 않고,
같은 요청을 다시 보내도(링크를 누르고 돌아와도) 상태가 바뀌지 않는다.
"""

import json

import pytest
import yaml
from fastapi.testclient import TestClient

from app.main import app
from app.preparation.domain.status import preparation_status
from tests.contract import CONTRACT_FILE, EXAMPLES_DIR, validate
from tests.eligibility.test_assessments_api import request_a


@pytest.fixture
def client():
    return TestClient(app)


def summary(client, year, income, version="fixture-notice-a-v1"):
    response = client.post("/api/preparation-summaries", json=request_a(year, income, version))
    assert response.status_code == 200
    body = response.json()
    validate(body, "PreparationSummary")
    return body


@pytest.mark.parametrize(
    ("group", "status"),
    [
        ("ELIGIBLE", "PREPARED"),
        ("NEEDS_REVIEW", "PREPARED_WITH_OPEN_ITEMS"),
        ("INELIGIBLE", "STOPPED"),
    ],
)
def test_status_follows_rule_engine_group(group, status):
    assert preparation_status(group) == status


def test_AC_C07_eligible_is_prepared_with_official_submission_url(client):
    body = summary(client, 3, 4)

    assert body["preparationStatus"] == "PREPARED"
    assert body["officialSubmissionUrl"] == "https://example.org/test-only/fixture-notice-a/apply"
    assert body["noticeVersionId"] == "fixture-notice-a-v1"


def test_AC_C07_click_does_not_submit(client):
    """링크를 누르고 돌아와 다시 열어도 서비스 상태는 PREPARED 그대로다 (저장·제출 없음)."""
    first = summary(client, 3, 4)
    again = summary(client, 3, 4)

    assert first == again
    assert again["preparationStatus"] == "PREPARED"


def test_BR_C07_contract_has_no_submitted_status():
    spec = yaml.safe_load(CONTRACT_FILE.read_text(encoding="utf-8"))
    enum = spec["components"]["schemas"]["PreparationSummary"]["properties"]["preparationStatus"]

    assert "SUBMITTED" not in enum["enum"]


def test_BR_C04_unknown_income_is_prepared_with_open_items(client):
    body = summary(client, 3, None)

    assert body["eligibilityResult"] == "NEEDS_REVIEW"
    assert body["preparationStatus"] == "PREPARED_WITH_OPEN_ITEMS"
    assert body["openItems"] == [
        {"conditionId": "income", "label": "소득구간 5구간 이하", "reasonCode": "MISSING_FACT"}
    ]
    assert body["checklist"]  # 확인 사항이 있어도 서류 준비는 계속한다


def test_BR_C04_matches_contract_example(client):
    example = json.loads(
        (EXAMPLES_DIR / "preparation-summary.with-open-items.json").read_text(encoding="utf-8")
    )

    assert summary(client, 3, None) == example


def test_BR_C02_ineligible_is_stopped_without_checklist(client):
    body = summary(client, 3, 7)

    assert body["preparationStatus"] == "STOPPED"
    assert body["checklist"] == []
    assert [c["conditionId"] for c in body["failedConditions"]] == ["income"]
    assert body["failedConditions"][0]["evidence"]["quote"]


def test_BR_B09_empty_rule_notice_d_keeps_open_status(client):
    """규칙이 빈 공고 D는 가능이 아니므로 PREPARED가 아니다."""
    body = summary(client, 3, 4, "fixture-notice-d-v1")

    assert body["preparationStatus"] == "PREPARED_WITH_OPEN_ITEMS"
    assert [i["itemId"] for i in body["checklist"]] == ["doc-application"]
