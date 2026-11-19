from collections.abc import Callable
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends

from app.eligibility.api.router import condition_out, domain_error, facts_in, get_clock
from app.eligibility.api.schemas import AssessmentRequestIn, EvidenceOut
from app.eligibility.application.service import NoticeNotFound, NoticeNotVerified
from app.notice.api.router import get_notice_repository
from app.notice.domain.repository import NoticeRepository
from app.preparation.api.schemas import ChecklistItemOut, OpenItemOut, PreparationSummaryOut
from app.preparation.application.service import PreparationSummary, summarize

router = APIRouter()


def _to_response(s: PreparationSummary) -> PreparationSummaryOut:
    return PreparationSummaryOut(
        noticeId=s.notice_id,
        noticeVersionId=s.notice_version_id,
        eligibilityResult=s.eligibility,
        preparationStatus=s.status,
        checklist=[
            ChecklistItemOut(
                itemId=d.itemId,
                documentName=d.documentName,
                reason=d.reason,
                isConditional=d.isConditional,
                appliesWhen=d.appliesWhen,
                issuer=d.issuer,
                issuanceGuideUrl=d.issuanceGuideUrl,
                evidence=EvidenceOut(**vars(d.evidence)),
            )
            for d in s.checklist
        ],
        openItems=[
            OpenItemOut(
                conditionId=c.outcome.condition_id,
                label=condition_out(c).label,
                reasonCode=c.outcome.reason_code,
            )
            for c in s.open_items
        ],
        failedConditions=[condition_out(c) for c in s.failed_conditions],
        officialSubmissionUrl=s.official_submission_url,
    )


@router.post(
    "/preparation-summaries",
    response_model=PreparationSummaryOut,
    responses={404: {"description": "공고 버전 없음"}, 409: {"description": "미검증 공고"}},
)
def post_preparation_summary(
    body: AssessmentRequestIn,
    repo: Annotated[NoticeRepository, Depends(get_notice_repository)],
    clock: Annotated[Callable[[], datetime], Depends(get_clock)],
):
    """MVP 준비 요약. 준비 건을 저장하지 않고, 제출하지 않는다 (BR-C07, BR-C08)."""
    try:
        return _to_response(summarize(repo, body.noticeVersionId, facts_in(body), clock()))
    except (NoticeNotFound, NoticeNotVerified) as e:
        return domain_error(e)
