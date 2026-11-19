"""MVP 준비 요약 유스케이스: 판정을 다시 받고, 체크리스트와 공식 제출 안내를 붙인다.

준비 건을 만들거나 저장하지 않는다 (계약 x-mvp). 판정 계산은 Rule Engine만 한다 (BR-B02).
"""

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime

from app.eligibility.application.service import AssessedCondition, NoticeNotFound, assess
from app.eligibility.domain.model import EligibilityGroup, Fact
from app.notice.domain.model import NoticeDocument
from app.notice.domain.repository import NoticeRepository
from app.preparation.domain.checklist import build_checklist
from app.preparation.domain.status import PreparationStatus, preparation_status


@dataclass(frozen=True)
class PreparationSummary:
    notice_id: str
    notice_version_id: str
    eligibility: EligibilityGroup
    status: PreparationStatus
    checklist: tuple[NoticeDocument, ...]
    open_items: tuple[AssessedCondition, ...]
    failed_conditions: tuple[AssessedCondition, ...]
    official_submission_url: str | None


def summarize(
    repo: NoticeRepository,
    notice_version_id: str,
    facts: Mapping[str, Fact],
    now: datetime,
) -> PreparationSummary:
    """공고가 없거나 미검증이면 assess가 예외를 낸다 (NoticeNotFound, NoticeNotVerified)."""
    assessment = assess(repo, notice_version_id, facts, now)
    version = repo.get_version(notice_version_id)
    if version is None:  # assess가 이미 확인했지만 저장소가 바뀐 경우를 막는다
        raise NoticeNotFound(notice_version_id)

    group = assessment.evaluation.group
    status = preparation_status(group)
    conditions = assessment.conditions
    return PreparationSummary(
        notice_id=version.summary.noticeId,
        notice_version_id=notice_version_id,
        eligibility=group,
        status=status,
        checklist=()
        if status == "STOPPED"
        else build_checklist(notice_version_id, version.documents),
        open_items=tuple(c for c in conditions if c.outcome.result == "UNKNOWN"),
        failed_conditions=tuple(c for c in conditions if c.outcome.result == "FAIL"),
        official_submission_url=version.officialSubmissionUrl,
    )
