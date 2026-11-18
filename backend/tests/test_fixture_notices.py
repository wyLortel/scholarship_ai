"""#24 TEST_ONLY 가상 공고 fixture와 로더.

fixture는 실제 장학금 규정이 아니다(CLAUDE.md §4). 로더는 형식·완결성만 검사하고
판정은 하지 않는다 — 빈 규칙(D)·미검증(C)도 그대로 로드해 판정/목록 쪽이 막게 한다.
"""

from app.infrastructure.fixtures.notice_fixture_loader import load_fixture_notices
from tests.contract import ROOT

FIXTURE_FILE = ROOT / "examples" / "fixture-notices.json"


def notices_by_id():
    return {n.noticeId: n for n in load_fixture_notices(FIXTURE_FILE)}


def test_AC24_1_BR_B06_four_notices_loaded_with_evidence_anchor():
    """Given fixture / When 로더 실행 / Then 4건, 모든 조건에 근거 anchor (BR-B06)."""
    notices = load_fixture_notices(FIXTURE_FILE)
    assert [n.noticeId for n in notices] == [
        "fixture-notice-a",
        "fixture-notice-b",
        "fixture-notice-c",
        "fixture-notice-d",
    ]
    for notice in notices:
        for condition in notice.conditions:
            ev = condition.evidence
            assert ev.quote.strip(), condition.conditionId
            assert ev.location.strip(), condition.conditionId
            assert ev.noticeVersionId == notice.noticeVersionId
            assert ev.checkedAt is not None


def test_AC24_2_all_notices_marked_test_only():
    """실제 공고로 오해되지 않는다 (examples/README)."""
    for notice in load_fixture_notices(FIXTURE_FILE):
        assert notice.isTestOnly is True
        assert notice.title.startswith("[TEST_ONLY]")
        assert notice.institution.startswith("[TEST_ONLY]")
        for url in (notice.officialUrl, notice.officialSubmissionUrl):
            assert url is None or url.startswith("https://example.org/test-only/")


def test_notice_a_is_verified_grade_and_income():
    a = notices_by_id()["fixture-notice-a"]
    assert a.sourceVerificationStatus == "VERIFIED"
    assert a.ruleSet.expression == {
        "and": [
            {"id": "grade", "field": "yearInSchool", "op": ">=", "value": 2},
            {"id": "income", "field": "incomeBracket", "op": "<=", "value": 5},
        ]
    }


def test_notice_b_keeps_or_inside_and_for_AC_B04():
    """OR을 AND로 평탄화하지 않는다 (CLAUDE.md §2-2, AC-B04)."""
    b = notices_by_id()["fixture-notice-b"]
    assert b.sourceVerificationStatus == "VERIFIED"
    top = b.ruleSet.expression["and"]
    assert len(top) == 2
    assert "id" in top[0]
    assert len(top[1]["or"]) == 2


def test_notice_c_is_not_verified_for_BR_A05():
    c = notices_by_id()["fixture-notice-c"]
    assert c.sourceVerificationStatus != "VERIFIED"


def test_notice_d_has_empty_rule_for_AC_B05():
    d = notices_by_id()["fixture-notice-d"]
    assert d.ruleSet.expression == {"and": []}
    assert d.conditions == []


def test_documents_have_reason_and_never_invent_issuer():
    """발급처·안내 URL이 없으면 null(=발급처 확인 필요), 빈 문자열로 채우지 않는다."""
    documents = [d for n in load_fixture_notices(FIXTURE_FILE) for d in n.documents]
    assert documents
    assert any(d.issuer is None for d in documents)
    for d in documents:
        assert d.reason.strip()
        assert d.evidence.quote.strip()
        assert d.issuer != ""
        assert d.issuanceGuideUrl != ""
        if d.isConditional:
            assert d.appliesWhen
