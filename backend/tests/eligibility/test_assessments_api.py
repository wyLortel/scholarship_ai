"""#27 POST /api/assessments — 공고 버전 + 학생 사실 → 조건별 판정 (#23 계약).

TEST_ONLY 공고 A(fixture-notice-a-v1): grade >= 2 AND income <= 5. C는 미검증.
"""

from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient

from app.eligibility.router import get_clock
from app.main import app
from tests.contract import validate

FIXED_NOW = datetime(2026, 11, 18, 12, 0, tzinfo=UTC)


@pytest.fixture
def client():
    app.dependency_overrides[get_clock] = lambda: lambda: FIXED_NOW
    yield TestClient(app)
    app.dependency_overrides.clear()


def request_a(year, income, version="fixture-notice-a-v1"):
    def fact(field, value, unit):
        return {
            "field": field,
            "isKnown": value is not None,
            "value": value,
            "unit": unit,
            "effectiveAt": None,
            "source": "STUDENT_PROVIDED",
        }

    return {
        "noticeVersionId": version,
        "facts": [fact("yearInSchool", year, "학년"), fact("incomeBracket", income, "구간")],
    }


def by_id(body):
    return {d["conditionId"]: d for d in body["details"]}


def test_AC_B03_eligible_with_condition_evidence(client):
    response = client.post("/api/assessments", json=request_a(3, 4))

    assert response.status_code == 200
    body = response.json()
    validate(body, "AssessmentResult")
    assert body["eligibilityResult"] == "ELIGIBLE"
    assert body["noticeVersionId"] == "fixture-notice-a-v1"
    details = by_id(body)
    assert {k: d["result"] for k, d in details.items()} == {"grade": "PASS", "income": "PASS"}
    assert details["grade"]["label"] == "2학년 이상"
    assert details["grade"]["evidence"]["quote"] == "신청일 기준 2학년 이상 재학생"
    assert details["grade"]["studentFactRef"] == "yearInSchool"
    assert body["evidenceComplete"] is True
    assert all(d["missingEvidenceFields"] == [] for d in body["details"])


def test_AC_B08_ineligible_shows_failed_income(client):
    body = client.post("/api/assessments", json=request_a(3, 7)).json()

    validate(body, "AssessmentResult")
    assert body["eligibilityResult"] == "INELIGIBLE"
    income = by_id(body)["income"]
    assert income["result"] == "FAIL"
    assert income["reasonCode"] == "VALUE_MISMATCH"
    assert income["evidence"]["quote"] == "학자금 지원구간(소득구간) 5구간 이하인 자"


def test_AC_B10_same_request_same_structured_result(client):
    first = client.post("/api/assessments", json=request_a(3, 7)).json()
    second = client.post("/api/assessments", json=request_a(3, 7)).json()

    for key in (
        "eligibilityResult",
        "details",
        "noticeVersionId",
        "assessedAt",
        "evidenceComplete",
    ):
        assert first[key] == second[key]


def test_BR_A05_unverified_notice_returns_409(client):
    response = client.post("/api/assessments", json=request_a(3, 4, "fixture-notice-c-v1"))

    assert response.status_code == 409
    body = response.json()
    validate(body, "DomainError")
    assert body["code"] == "NOTICE_NOT_VERIFIED"
    assert body["noticeVersionId"] == "fixture-notice-c-v1"


def test_unknown_notice_version_returns_404(client):
    response = client.post("/api/assessments", json=request_a(3, 4, "no-such-version"))

    assert response.status_code == 404
    validate(response.json(), "DomainError")
    assert response.json()["code"] == "NOTICE_NOT_FOUND"


def test_BR_B01_unknown_fact_must_have_null_value(client):
    """모름인데 값이 있으면 거부한다(0/false로 섞지 않음)."""
    body = request_a(3, None)
    body["facts"][1]["value"] = 0

    assert client.post("/api/assessments", json=body).status_code == 422


def test_BR_B09_empty_rule_notice_d_is_needs_review(client):
    """빈 규칙 공고 D는 200 NEEDS_REVIEW, 가능 금지 (#23 정책). 화면 문구는 #30."""
    body = client.post("/api/assessments", json=request_a(3, 4, "fixture-notice-d-v1")).json()

    validate(body, "AssessmentResult")
    assert body["eligibilityResult"] == "NEEDS_REVIEW"
