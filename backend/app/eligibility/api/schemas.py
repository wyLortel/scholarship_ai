"""판정 API 요청·응답 모양 (contracts/api-draft.yaml, #23)."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, model_validator

from app.eligibility.domain.model import EligibilityGroup, ReasonCode, RuleResult


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
