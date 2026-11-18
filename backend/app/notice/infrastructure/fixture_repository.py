from collections.abc import Mapping
from pathlib import Path
from typing import Any

from app.notice.domain.model import EvidenceRef, NoticeCondition, NoticeSummary, NoticeVersion
from app.notice.infrastructure.fixture_loader import (
    FixtureEvidence,
    FixtureNotice,
    load_fixture_notices,
)


class FixtureNoticeRepository:
    """TEST_ONLY fixture 파일을 NoticeRepository로 제공한다. 실제 공고가 아니다."""

    def __init__(self, path: Path):
        self._path = path

    def list_notices(self) -> list[NoticeSummary]:
        return [_summary(n) for n in load_fixture_notices(self._path)]

    def get_version(self, notice_version_id: str) -> NoticeVersion | None:
        return next(
            (
                _version(n)
                for n in load_fixture_notices(self._path)
                if n.noticeVersionId == notice_version_id
            ),
            None,
        )

    def get_current_version(self, notice_id: str) -> NoticeVersion | None:
        """fixture는 공고마다 버전이 하나라서 그 버전이 현재 버전이다."""
        notices = load_fixture_notices(self._path)
        return next((_version(n) for n in notices if n.noticeId == notice_id), None)


def _version(n: FixtureNotice) -> NoticeVersion:
    fields = dict(_leaf_fields(n.ruleSet.expression))
    return NoticeVersion(
        summary=_summary(n),
        ruleExpression=n.ruleSet.expression,
        conditions=tuple(
            NoticeCondition(
                c.conditionId, c.label, _evidence(c.evidence), fields.get(c.conditionId)
            )
            for c in n.conditions
        ),
    )


def _leaf_fields(node: Any):
    """규칙식 잎의 (조건 ID, 학생 사실 필드). 평가는 하지 않는다."""
    if isinstance(node, Mapping):
        if "id" in node:
            yield node["id"], node.get("field")
            return
        for value in node.values():
            yield from _leaf_fields(value)
    elif isinstance(node, list):
        for value in node:
            yield from _leaf_fields(value)


def _summary(n: FixtureNotice) -> NoticeSummary:
    return NoticeSummary(
        noticeId=n.noticeId,
        noticeVersionId=n.noticeVersionId,
        title=n.title,
        institution=n.institution,
        isTestOnly=n.isTestOnly,
        officialUrl=n.officialUrl,
        sourceVerificationStatus=n.sourceVerificationStatus,
        freshnessStatus=n.freshnessStatus,
        lastCheckedAt=n.lastCheckedAt,
        recruitmentStartAt=n.recruitmentStartAt,
        recruitmentEndAt=n.recruitmentEndAt,
    )


def _evidence(e: FixtureEvidence) -> EvidenceRef:
    return EvidenceRef(
        evidenceId=e.evidenceId,
        noticeVersionId=e.noticeVersionId,
        fileId=e.fileId,
        location=e.location,
        quote=e.quote,
        officialUrl=e.officialUrl,
        checkedAt=e.checkedAt,
        verifiedAt=e.verifiedAt,
    )
