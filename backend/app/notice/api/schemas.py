"""공고 API 요청·응답 모양 (contracts/api-draft.yaml)."""

from datetime import datetime

from pydantic import BaseModel

from app.notice.domain.model import FreshnessStatus, VerificationStatus


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


class EvidenceResponse(BaseModel):
    evidenceId: str
    noticeVersionId: str
    fileId: str
    location: str
    quote: str
    officialUrl: str | None
    checkedAt: datetime | None
    verifiedAt: datetime | None


class NoticeConditionResponse(BaseModel):
    conditionId: str
    label: str
    evidence: EvidenceResponse
    studentFactRef: str | None


class NoticeDetailResponse(BaseModel):
    notice: NoticeSummaryResponse
    conditions: list[NoticeConditionResponse]
