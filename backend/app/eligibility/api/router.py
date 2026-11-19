import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.eligibility.api.schemas import (
    AssessmentRequestIn,
    AssessmentResultOut,
    ConditionEvaluationOut,
    EvidenceOut,
    RuleNodeOut,
)
from app.eligibility.application.service import (
    AssessedCondition,
    Assessment,
    NoticeNotFound,
    NoticeNotVerified,
    assess,
)
from app.eligibility.domain.model import Fact, RuleNode
from app.notice.api.router import get_notice_repository
from app.notice.domain.repository import NoticeRepository

router = APIRouter()


def get_clock() -> Callable[[], datetime]:
    return lambda: datetime.now(UTC)


def error_response(status: int, code: str, message: str, notice_version_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "code": code,
            "message": message,
            "traceId": uuid.uuid4().hex,
            "noticeVersionId": notice_version_id,
        },
    )


def condition_out(c: AssessedCondition) -> ConditionEvaluationOut:
    return ConditionEvaluationOut(
        conditionId=c.outcome.condition_id,
        label=c.notice_condition.label if c.notice_condition else c.outcome.condition_id,
        result=c.outcome.result,
        reasonCode=c.outcome.reason_code,
        evidence=(
            EvidenceOut(**vars(c.notice_condition.evidence))
            if c.notice_condition and c.notice_condition.evidence
            else None
        ),
        missingEvidenceFields=list(c.missing_evidence_fields),
        studentFactRef=c.outcome.field,
    )


def facts_in(body: AssessmentRequestIn) -> dict[str, Fact]:
    return {f.field: Fact(field=f.field, is_known=f.isKnown, value=f.value) for f in body.facts}


def domain_error(e: NoticeNotFound | NoticeNotVerified) -> JSONResponse:
    if isinstance(e, NoticeNotFound):
        return error_response(
            404, "NOTICE_NOT_FOUND", "공고 버전을 찾을 수 없습니다.", e.notice_version_id
        )
    return error_response(
        409,
        "NOTICE_NOT_VERIFIED",
        "아직 검증되지 않은 공고라 판정하지 않습니다.",
        e.notice_version_id,
    )


def _to_response(a: Assessment) -> AssessmentResultOut:
    details = [condition_out(c) for c in a.conditions]
    return AssessmentResultOut(
        assessmentId=uuid.uuid4().hex,
        noticeVersionId=a.notice_version_id,
        eligibilityResult=a.evaluation.group,
        evidenceComplete=a.evidence_complete,
        details=details,
        assessedAt=a.assessed_at,
        isStale=False,
        warning=None,
        ruleTree=_tree(a.evaluation.tree) if a.evaluation.tree else None,
    )


def _tree(node: RuleNode) -> RuleNodeOut:
    return RuleNodeOut(
        type=node.kind,
        result=node.result,
        conditionId=node.condition_id,
        children=[_tree(c) for c in node.children],
    )


@router.post(
    "/assessments",
    response_model=AssessmentResultOut,
    responses={404: {"description": "공고 버전 없음"}, 409: {"description": "미검증 공고"}},
)
def post_assessment(
    body: AssessmentRequestIn,
    repo: Annotated[NoticeRepository, Depends(get_notice_repository)],
    clock: Annotated[Callable[[], datetime], Depends(get_clock)],
):
    try:
        return _to_response(assess(repo, body.noticeVersionId, facts_in(body), clock()))
    except (NoticeNotFound, NoticeNotVerified) as e:
        return domain_error(e)
