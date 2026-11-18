"""#25 학생이 검증된 공고 목록을 본다 (ST-01, BR-A05).

TEST_ONLY fixture(#24): A·B·D = VERIFIED, C = REVIEW_PENDING.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.notice.api.router import get_notice_repository
from app.notice.application.service import list_verified_notices
from app.notice.domain.model import NoticeSummary
from tests.contract import validate

client = TestClient(app)


def summary(notice_id: str, status: str) -> NoticeSummary:
    return NoticeSummary(
        noticeId=notice_id,
        noticeVersionId=f"{notice_id}-v1",
        title=f"[TEST_ONLY] {notice_id}",
        institution="[TEST_ONLY] 가상 기관",
        isTestOnly=True,
        officialUrl=None,
        sourceVerificationStatus=status,
        freshnessStatus="UNCHECKED",
        lastCheckedAt=None,
        recruitmentStartAt=None,
        recruitmentEndAt=None,
    )


class FakeRepository:
    def __init__(self, notices):
        self.notices = notices

    def list_notices(self):
        return self.notices


def test_AC25_1_BR_A05_unverified_notice_is_not_listed():
    """Given A·B·D VERIFIED, C 미검증 / When 목록 / Then C는 없다."""
    response = client.get("/api/notices")

    assert response.status_code == 200
    ids = [n["noticeId"] for n in response.json()]
    assert ids == ["fixture-notice-a", "fixture-notice-b", "fixture-notice-d"]


def test_AC25_1_list_shows_title_institution_link_period_checked_at():
    body = client.get("/api/notices").json()

    validate(body, "array:NoticeSummary")
    for notice in body:
        assert notice["title"]
        assert notice["institution"]
        assert notice["officialUrl"].startswith("https://example.org/test-only/")
        assert notice["recruitmentStartAt"] and notice["recruitmentEndAt"]
        assert notice["lastCheckedAt"]
        assert notice["noticeVersionId"]


def test_AC25_2_test_only_notices_are_flagged():
    body = client.get("/api/notices").json()

    assert body
    assert all(n["isTestOnly"] is True for n in body)


def test_BR_A05_only_verified_status_is_listed():
    """검증 전·중·반려 상태는 모두 목록에서 빠진다."""
    repo = FakeRepository(
        [
            summary(f"n-{status.lower()}", status)
            for status in ("CANDIDATE", "EXTRACTING", "REVIEW_PENDING", "VERIFIED", "REJECTED")
        ]
    )

    assert [n.noticeId for n in list_verified_notices(repo)] == ["n-verified"]


def test_empty_list_returns_empty_array():
    app.dependency_overrides[get_notice_repository] = lambda: FakeRepository([])
    try:
        response = client.get("/api/notices")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == []
