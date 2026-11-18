from typing import Protocol

from app.notice.domain.model import NoticeSummary, NoticeVersion


class NoticeRepository(Protocol):
    """공고 조회 계약. MVP 구현은 TEST_ONLY fixture(#24), 이후 DB로 교체한다."""

    def list_notices(self) -> list[NoticeSummary]: ...

    def get_version(self, notice_version_id: str) -> NoticeVersion | None: ...
