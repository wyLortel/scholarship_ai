"""공고 도메인 모델 (A 컨텍스트). FastAPI·저장소 구현을 모른다."""

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal

VerificationStatus = Literal["CANDIDATE", "EXTRACTING", "REVIEW_PENDING", "VERIFIED", "REJECTED"]
FreshnessStatus = Literal["UNCHECKED", "CHECKED_UNCHANGED", "CHECKED_CHANGED", "CHECK_FAILED"]


@dataclass(frozen=True)
class NoticeSummary:
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

    def is_listable(self) -> bool:
        """검증된 공고만 학생에게 보인다. 검증 전·반려는 보류 (BR-A05)."""
        return self.sourceVerificationStatus == "VERIFIED"


@dataclass(frozen=True)
class EvidenceRef:
    """조건의 공식 원문 근거 위치 (BR-B06)."""

    evidenceId: str
    noticeVersionId: str
    fileId: str
    location: str
    quote: str
    officialUrl: str | None
    checkedAt: datetime | None
    verifiedAt: datetime | None


@dataclass(frozen=True)
class NoticeCondition:
    conditionId: str
    label: str
    evidence: EvidenceRef | None


@dataclass(frozen=True)
class NoticeVersion:
    """판정에 쓰는 공고 버전: 요약 + 검증된 규칙 트리 + 조건별 근거."""

    summary: NoticeSummary
    ruleExpression: Mapping[str, Any]
    conditions: tuple[NoticeCondition, ...]

    @property
    def is_verified(self) -> bool:
        return self.summary.sourceVerificationStatus == "VERIFIED"
