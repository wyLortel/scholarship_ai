from typing import Protocol

from app.domain.notice.model import NoticeSummary


class NoticeRepository(Protocol):
    """공고 조회 계약. MVP 구현은 TEST_ONLY fixture(#24), 이후 DB로 교체한다."""

    def list_notices(self) -> list[NoticeSummary]: ...
