"""준비 요약 응답 모양 (contracts/api-draft.yaml PreparationSummary). 업로드·제출 필드는 없다."""

from typing import Literal

from pydantic import BaseModel

from app.eligibility.api.schemas import ConditionEvaluationOut, EvidenceOut
from app.eligibility.domain.model import EligibilityGroup, ReasonCode


class ChecklistItemOut(BaseModel):
    itemId: str
    documentName: str
    reason: str
    isConditional: bool
    appliesWhen: str | None
    issuer: str | None
    issuanceGuideUrl: str | None
    evidence: EvidenceOut


class OpenItemOut(BaseModel):
    conditionId: str
    label: str
    reasonCode: ReasonCode


class PreparationSummaryOut(BaseModel):
    noticeId: str
    noticeVersionId: str
    eligibilityResult: EligibilityGroup
    preparationStatus: Literal["PREPARED", "PREPARED_WITH_OPEN_ITEMS", "STOPPED"]
    checklist: list[ChecklistItemOut]
    openItems: list[OpenItemOut]
    failedConditions: list[ConditionEvaluationOut]
    officialSubmissionUrl: str | None
