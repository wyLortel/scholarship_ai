"""공고 도메인 모델 (A 컨텍스트). FastAPI·저장소 구현을 모른다."""

from dataclasses import dataclass
from datetime import datetime
from typing import Literal

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
