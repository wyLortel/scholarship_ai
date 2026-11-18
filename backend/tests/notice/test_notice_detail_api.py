"""GET /api/notices/{noticeId} — 공고 원문 조건·근거·물을 사실 (#26 API 부분, #29 입력 화면용)."""

from fastapi.testclient import TestClient

from app.main import app
from tests.contract import validate

client = TestClient(app)


def test_notice_b_detail_lists_conditions_with_fact_refs():
    response = client.get("/api/notices/fixture-notice-b")

    assert response.status_code == 200
    body = response.json()
    validate(body, "NoticeDetail")
    assert body["notice"]["noticeVersionId"] == "fixture-notice-b-v1"
    assert [(c["conditionId"], c["studentFactRef"]) for c in body["conditions"]] == [
        ("enrolled", "isEnrolled"),
        ("income", "incomeBracket"),
        ("multiChild", "isMultiChildHousehold"),
    ]
    assert all(c["evidence"]["quote"] for c in body["conditions"])


def test_BR_A05_unverified_notice_detail_is_hidden():
    """미검증 공고(C)는 목록처럼 상세도 공개하지 않는다."""
    assert client.get("/api/notices/fixture-notice-c").status_code == 404


def test_unknown_notice_is_404():
    response = client.get("/api/notices/no-such-notice")

    assert response.status_code == 404
    validate(response.json(), "DomainError")
