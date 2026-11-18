from typing import Annotated

from fastapi import APIRouter, Depends

from app.config import fixture_notices_file
from app.notice.api.schemas import NoticeSummaryResponse
from app.notice.application.service import list_verified_notices
from app.notice.domain.repository import NoticeRepository
from app.notice.infrastructure.fixture_repository import FixtureNoticeRepository

router = APIRouter()


def get_notice_repository() -> NoticeRepository:
    return FixtureNoticeRepository(fixture_notices_file())


@router.get("/notices", response_model=list[NoticeSummaryResponse])
def list_notices(repo: Annotated[NoticeRepository, Depends(get_notice_repository)]):
    return list_verified_notices(repo)
