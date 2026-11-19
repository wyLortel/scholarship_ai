"""#33 체크리스트 규칙 (09 §2, BR-C05, BR-C08): 검증된 공고 버전의 서류 요구 → 체크리스트 항목.

가짜 발급처·URL을 만들지 않고, 다른 버전 근거의 서류는 보여 주지 않는다.
"""

from dataclasses import replace
from datetime import UTC, datetime

from app.notice.domain.model import EvidenceRef, NoticeDocument
from app.preparation.domain.checklist import build_checklist

VERSION = "v1"
CHECKED = datetime(2026, 11, 18, 0, 0, tzinfo=UTC)


def evidence(version=VERSION, verified_at=CHECKED):
    return EvidenceRef(
        evidenceId="ev-1",
        noticeVersionId=version,
        fileId="file-1",
        location="본문 4. 제출 서류 (1)",
        quote="재학증명서 1부",
        officialUrl="https://example.org/test-only/notice",
        checkedAt=CHECKED,
        verifiedAt=verified_at,
    )


def document(**changes):
    base = NoticeDocument(
        itemId="doc-enrollment",
        documentName="재학증명서",
        reason="제출 서류에 명시됨",
        isConditional=False,
        appliesWhen=None,
        issuer="재학 중인 대학교",
        issuanceGuideUrl="https://example.org/test-only/issuance",
        evidence=evidence(),
    )
    return replace(base, **changes)


def test_AC_C05_document_becomes_item_with_evidence():
    [item] = build_checklist(VERSION, (document(),))

    assert item.documentName == "재학증명서"
    assert item.evidence.quote == "재학증명서 1부"
    assert item.issuer == "재학 중인 대학교"
    assert item.issuanceGuideUrl == "https://example.org/test-only/issuance"


def test_09_2_missing_issuer_stays_null_not_invented():
    [item] = build_checklist(VERSION, (document(issuer=None, issuanceGuideUrl=None),))

    assert item.issuer is None
    assert item.issuanceGuideUrl is None


def test_09_2_guide_url_only_when_evidence_is_verified():
    """검증되지 않은 근거의 발급 안내 URL은 보여 주지 않는다 (공식 안내 URL은 검증된 경우만)."""
    [item] = build_checklist(VERSION, (document(evidence=evidence(verified_at=None)),))

    assert item.issuanceGuideUrl is None
    assert item.documentName == "재학증명서"


def test_09_2_conditional_document_keeps_applies_when():
    """조건부 서류를 모든 학생에게 무조건 요구하지 않는다."""
    [item] = build_checklist(
        VERSION, (document(isConditional=True, appliesWhen="다자녀 가구로 신청하는 경우"),)
    )

    assert item.isConditional is True
    assert item.appliesWhen == "다자녀 가구로 신청하는 경우"


def test_BR_B06_document_from_other_version_is_not_shown():
    """다른 공고 버전의 근거로 만든 서류는 이 버전의 체크리스트에 넣지 않는다."""
    assert build_checklist(VERSION, (document(evidence=evidence(version="v0")),)) == ()


def test_order_follows_notice():
    docs = (document(itemId="b"), document(itemId="a"))

    assert [i.itemId for i in build_checklist(VERSION, docs)] == ["b", "a"]
