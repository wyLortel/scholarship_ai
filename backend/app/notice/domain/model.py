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
    # 이 조건이 비교하는 학생 사실 필드. 입력 화면이 무엇을 물을지 고르는 데만 쓴다.
    studentFactRef: str | None = None


@dataclass(frozen=True)
class NoticeDocument:
    """공고 원문에 적힌 제출 서류 요구 한 건 (09 §2). 학생 증빙 파일이 아니다 (BR-C08)."""

    itemId: str
    documentName: str
    reason: str
    isConditional: bool
    appliesWhen: str | None
    # 없으면 None(=발급처 확인 필요). 창작하지 않는다.
    issuer: str | None
    issuanceGuideUrl: str | None
    evidence: EvidenceRef


@dataclass(frozen=True)
class NoticeVersion:
    """판정·준비에 쓰는 공고 버전: 요약 + 검증된 규칙 트리 + 조건별 근거 + 제출 서류."""

    summary: NoticeSummary
    ruleExpression: Mapping[str, Any]
    conditions: tuple[NoticeCondition, ...]
    documents: tuple[NoticeDocument, ...] = ()
    # 학생이 직접 제출하는 공식 경로 (BR-C07). 서비스는 제출하지 않는다.
    officialSubmissionUrl: str | None = None

    @property
    def is_verified(self) -> bool:
        return self.summary.sourceVerificationStatus == "VERIFIED"
