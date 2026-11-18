from app.notice.domain.model import NoticeSummary, NoticeVersion
from app.notice.domain.repository import NoticeRepository


def list_verified_notices(repo: NoticeRepository) -> list[NoticeSummary]:
    """학생용 공고 목록: VERIFIED만 (BR-A05, FR-B03)."""
    return [n for n in repo.list_notices() if n.is_listable()]


def get_verified_notice(repo: NoticeRepository, notice_id: str) -> NoticeVersion | None:
    """학생용 공고 상세. 미검증 공고는 목록처럼 상세도 없는 것으로 다룬다 (BR-A05)."""
    version = repo.get_current_version(notice_id)
    if version is None or not version.is_verified:
        return None
    return version
