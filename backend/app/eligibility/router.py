import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, model_validator

from app.eligibility.model import EligibilityGroup, Fact, ReasonCode, RuleResult
from app.eligibility.service import (
    Assessment,
    NoticeNotFound,
    NoticeNotVerified,
    assess,
)
from app.notice.repository import NoticeRepository
from app.notice.router import get_notice_repository

router = APIRouter()


class StudentFactIn(BaseModel):
    """contracts/api-draft.yaml StudentFact. 모름은 isKnown=false, value=null (BR-B01)."""

    model_config = ConfigDict(extra="forbid")

    field: str
    isKnown: bool
    value: Any = None
    unit: str | None = None
    effectiveAt: datetime | None = None
    source: Literal["STUDENT_PROVIDED", "USER_CONFIRMED"] = "STUDENT_PROVIDED"

    @model_validator(mode="after")
    def _unknown_is_null(self):
        if not self.isKnown and self.value is not None:
            raise ValueError("isKnown=false이면 value는 null이어야 한다 (0/false 금지)")
        return self


class AssessmentRequestIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    noticeVersionId: str
    facts: list[StudentFactIn]


class EvidenceOut(BaseModel):
    evidenceId: str
    noticeVersionId: str
    fileId: str
    location: str
    quote: str
    officialUrl: str | None
    checkedAt: datetime | None
    verifiedAt: datetime | None


class ConditionEvaluationOut(BaseModel):
    conditionId: str
    label: str
    result: RuleResult
    reasonCode: ReasonCode
    evidence: EvidenceOut | None
    missingEvidenceFields: list[Literal["evidence", "noticeVersionId", "checkedAt"]]
    studentFactRef: str | None


class AssessmentResultOut(BaseModel):
    assessmentId: str
    noticeVersionId: str
    eligibilityResult: EligibilityGroup
    evidenceComplete: bool
    details: list[ConditionEvaluationOut]
    assessedAt: datetime
    isStale: bool
    warning: str | None


def get_clock() -> Callable[[], datetime]:
    return lambda: datetime.now(UTC)


def _error(status: int, code: str, message: str, notice_version_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "code": code,
            "message": message,
            "traceId": uuid.uuid4().hex,
            "noticeVersionId": notice_version_id,
        },
    )


def _to_response(a: Assessment) -> AssessmentResultOut:
    details = [
        ConditionEvaluationOut(
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
        for c in a.conditions
    ]
    return AssessmentResultOut(
        assessmentId=uuid.uuid4().hex,
        noticeVersionId=a.notice_version_id,
        eligibilityResult=a.evaluation.group,
        evidenceComplete=a.evidence_complete,
        details=details,
        assessedAt=a.assessed_at,
        isStale=False,
        warning=None,
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
    facts = {f.field: Fact(field=f.field, is_known=f.isKnown, value=f.value) for f in body.facts}
    try:
        return _to_response(assess(repo, body.noticeVersionId, facts, clock()))
    except NoticeNotFound as e:
        return _error(404, "NOTICE_NOT_FOUND", "공고 버전을 찾을 수 없습니다.", e.notice_version_id)
    except NoticeNotVerified as e:
        return _error(
            409,
            "NOTICE_NOT_VERIFIED",
            "아직 검증되지 않은 공고라 판정하지 않습니다.",
            e.notice_version_id,
        )
