import uuid
from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.config import fixture_notices_file
from app.notice.api.schemas import NoticeDetailResponse, NoticeSummaryResponse
from app.notice.application.service import get_verified_notice, list_verified_notices
from app.notice.domain.repository import NoticeRepository
from app.notice.infrastructure.fixture_repository import FixtureNoticeRepository

router = APIRouter()


def get_notice_repository() -> NoticeRepository:
    return FixtureNoticeRepository(fixture_notices_file())


@router.get("/notices", response_model=list[NoticeSummaryResponse])
def list_notices(repo: Annotated[NoticeRepository, Depends(get_notice_repository)]):
    return list_verified_notices(repo)


@router.get(
    "/notices/{noticeId}",
    response_model=NoticeDetailResponse,
    responses={404: {"description": "없는 공고 또는 미검증 공고"}},
)
def get_notice(noticeId: str, repo: Annotated[NoticeRepository, Depends(get_notice_repository)]):
    version = get_verified_notice(repo, noticeId)
    if version is None:
        return JSONResponse(
            status_code=404,
            content={
                "code": "NOTICE_NOT_FOUND",
                "message": "공고를 찾을 수 없습니다.",
                "traceId": uuid.uuid4().hex,
                "noticeVersionId": None,
            },
        )
    return NoticeDetailResponse(
        notice=NoticeSummaryResponse(**asdict(version.summary)),
        conditions=[asdict(c) for c in version.conditions],
    )
