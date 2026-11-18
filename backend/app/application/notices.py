from app.domain.notice.model import NoticeSummary
from app.domain.notice.repository import NoticeRepository


def list_verified_notices(repo: NoticeRepository) -> list[NoticeSummary]:
    """학생용 공고 목록: VERIFIED만 (BR-A05, FR-B03)."""
    return [n for n in repo.list_notices() if n.is_listable()]
