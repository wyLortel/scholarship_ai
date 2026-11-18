from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.application.notices import list_verified_notices
from app.config import fixture_notices_file
from app.domain.notice.model import FreshnessStatus, VerificationStatus
from app.domain.notice.repository import NoticeRepository
from app.infrastructure.fixtures.fixture_notice_repository import FixtureNoticeRepository

router = APIRouter()


class NoticeSummaryResponse(BaseModel):
    """contracts/api-draft.yaml NoticeSummary와 같은 필드."""

    noticeId: str
    noticeVersionId: str
    title: str
    institution: str
    isTestOnly: bool
    officialUrl: str | None
    sourceVerificationStatus: VerificationStatus
    freshnessStatus: FreshnessStatus
    lastCheckedAt: datetime | None
    recruitmentStartAt: datetime | None
    recruitmentEndAt: datetime | None


def get_notice_repository() -> NoticeRepository:
    return FixtureNoticeRepository(fixture_notices_file())


@router.get("/notices", response_model=list[NoticeSummaryResponse])
def list_notices(repo: Annotated[NoticeRepository, Depends(get_notice_repository)]):
    return list_verified_notices(repo)
