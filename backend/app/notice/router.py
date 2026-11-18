from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.config import fixture_notices_file
from app.notice.fixture_repository import FixtureNoticeRepository
from app.notice.model import FreshnessStatus, VerificationStatus
from app.notice.repository import NoticeRepository
from app.notice.service import list_verified_notices

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
