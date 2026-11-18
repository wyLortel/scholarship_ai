"""판정 유스케이스: 공고 버전을 찾고, 검증 여부를 확인하고, Rule Engine 결과에 근거를 붙인다.

판정 계산은 하지 않는다 — app.eligibility.rules만 계산한다(BR-B02).
"""

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime

from app.eligibility.model import ConditionOutcome, Evaluation, Fact
from app.eligibility.rules import evaluate
from app.notice.model import NoticeCondition, NoticeVersion
from app.notice.repository import NoticeRepository


class NoticeNotFound(Exception):
    def __init__(self, notice_version_id: str):
        self.notice_version_id = notice_version_id


class NoticeNotVerified(Exception):
    """미검증 공고는 판정 대상이 아니다 (BR-A05, #23 정책: 409)."""

    def __init__(self, notice_version_id: str):
        self.notice_version_id = notice_version_id


@dataclass(frozen=True)
class AssessedCondition:
    outcome: ConditionOutcome
    notice_condition: NoticeCondition | None
    missing_evidence_fields: tuple[str, ...]


@dataclass(frozen=True)
class Assessment:
    notice_version_id: str
    evaluation: Evaluation
    conditions: tuple[AssessedCondition, ...]
    evidence_complete: bool
    assessed_at: datetime


def assess(
    repo: NoticeRepository,
    notice_version_id: str,
    facts: Mapping[str, Fact],
    assessed_at: datetime,
) -> Assessment:
    version = repo.get_version(notice_version_id)
    if version is None:
        raise NoticeNotFound(notice_version_id)
    if not version.is_verified:
        raise NoticeNotVerified(notice_version_id)

    # 평가 중 입력이 바뀌지 않도록 사실을 고정한다 (05 §7).
    evaluation = evaluate(version.ruleExpression, dict(facts))
    conditions = tuple(_attach_evidence(version, o) for o in evaluation.conditions)
    complete = bool(conditions) and all(not c.missing_evidence_fields for c in conditions)
    return Assessment(notice_version_id, evaluation, conditions, complete, assessed_at)


def _attach_evidence(version: NoticeVersion, outcome: ConditionOutcome) -> AssessedCondition:
    condition = next((c for c in version.conditions if c.conditionId == outcome.condition_id), None)
    evidence = condition.evidence if condition else None
    missing: list[str] = []
    if evidence is None:
        missing.append("evidence")
    else:
        if evidence.noticeVersionId != version.summary.noticeVersionId:
            missing.append("noticeVersionId")  # 다른 버전의 근거는 무효 (AC-B07)
        if evidence.checkedAt is None:
            missing.append("checkedAt")
    return AssessedCondition(outcome, condition, tuple(missing))
