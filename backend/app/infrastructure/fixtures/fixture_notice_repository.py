from pathlib import Path

from app.domain.notice.model import NoticeSummary
from app.infrastructure.fixtures.notice_fixture_loader import load_fixture_notices


class FixtureNoticeRepository:
    """TEST_ONLY fixture 파일을 NoticeRepository로 제공한다. 실제 공고가 아니다."""

    def __init__(self, path: Path):
        self._path = path

    def list_notices(self) -> list[NoticeSummary]:
        return [
            NoticeSummary(
                noticeId=n.noticeId,
                noticeVersionId=n.noticeVersionId,
                title=n.title,
                institution=n.institution,
                isTestOnly=n.isTestOnly,
                officialUrl=n.officialUrl,
                sourceVerificationStatus=n.sourceVerificationStatus,
                freshnessStatus=n.freshnessStatus,
                lastCheckedAt=n.lastCheckedAt,
                recruitmentStartAt=n.recruitmentStartAt,
                recruitmentEndAt=n.recruitmentEndAt,
            )
            for n in load_fixture_notices(self._path)
        ]
