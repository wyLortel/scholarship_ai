from pathlib import Path

from app.notice.fixture_loader import (
    FixtureEvidence,
    FixtureNotice,
    load_fixture_notices,
)
from app.notice.model import EvidenceRef, NoticeCondition, NoticeSummary, NoticeVersion


class FixtureNoticeRepository:
    """TEST_ONLY fixture 파일을 NoticeRepository로 제공한다. 실제 공고가 아니다."""

    def __init__(self, path: Path):
        self._path = path

    def list_notices(self) -> list[NoticeSummary]:
        return [_summary(n) for n in load_fixture_notices(self._path)]

    def get_version(self, notice_version_id: str) -> NoticeVersion | None:
        for n in load_fixture_notices(self._path):
            if n.noticeVersionId == notice_version_id:
                return NoticeVersion(
                    summary=_summary(n),
                    ruleExpression=n.ruleSet.expression,
                    conditions=tuple(
                        NoticeCondition(c.conditionId, c.label, _evidence(c.evidence))
                        for c in n.conditions
                    ),
                )
        return None


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
