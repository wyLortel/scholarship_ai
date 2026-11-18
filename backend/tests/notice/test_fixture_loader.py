"""#24 TEST_ONLY 가상 공고 fixture와 로더.

fixture는 실제 장학금 규정이 아니다(CLAUDE.md §4). 로더는 형식·완결성만 검사하고
판정은 하지 않는다 — 빈 규칙(D)·미검증(C)도 그대로 로드해 판정/목록 쪽이 막게 한다.
"""

import json

import pytest

from app.notice.infrastructure.fixture_loader import FixtureError, load_fixture_notices
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


def _set(path, value):
    def mutate(data):
        node = data
        for key in path[:-1]:
            node = node[key]
        node[path[-1]] = value

    return mutate


def _drop(path):
    def mutate(data):
        node = data
        for key in path[:-1]:
            node = node[key]
        del node[path[-1]]

    return mutate


A = ("notices", 0)
A_EV = (*A, "conditions", 0, "evidence")


@pytest.mark.parametrize(
    "mutate",
    [
        pytest.param(_drop((*A_EV, "quote")), id="missing-quote"),
        pytest.param(_set((*A_EV, "quote"), "  "), id="blank-quote"),
        pytest.param(_drop((*A_EV, "checkedAt")), id="missing-checkedAt"),
        pytest.param(
            _set((*A_EV, "noticeVersionId"), "fixture-notice-a-v2"), id="version-mismatch"
        ),
        pytest.param(_drop((*A, "conditions", 0, "evidence")), id="missing-evidence"),
        pytest.param(_set((*A, "isTestOnly"), False), id="not-test-only"),
        pytest.param(_set((*A, "title"), "가상 재단 학업장려 장학금"), id="title-without-marker"),
        pytest.param(_set((*A, "officialUrl"), "https://www.kosaf.go.kr/"), id="real-domain-url"),
        pytest.param(_set((*A, "extra"), "x"), id="unknown-field"),
        pytest.param(_drop((*A, "documents")), id="missing-documents"),
        pytest.param(_set((*A, "documents", 0, "issuer"), ""), id="blank-issuer"),
        pytest.param(
            _set((*A, "documents", 1, "appliesWhen"), None), id="conditional-without-when"
        ),
        pytest.param(
            _set((*A, "ruleSet", "expression"), {"and": []}), id="rule-condition-mismatch"
        ),
        pytest.param(
            _set(("notices", 1, "noticeId"), "fixture-notice-a"), id="duplicate-notice-id"
        ),
        pytest.param(_set(("type",), "REAL_NOTICES"), id="file-not-test-only"),
    ],
)
def test_loader_rejects_incomplete_or_non_test_fixture(tmp_path, mutate):
    data = json.loads(FIXTURE_FILE.read_text(encoding="utf-8"))
    mutate(data)
    broken = tmp_path / "broken.json"
    broken.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    with pytest.raises(FixtureError):
        load_fixture_notices(broken)


def test_loader_rejects_missing_file(tmp_path):
    with pytest.raises(FixtureError):
        load_fixture_notices(tmp_path / "none.json")


def _api_example(name):
    return json.loads((ROOT / "examples" / "api" / name).read_text(encoding="utf-8"))


def test_fixture_matches_contract_examples():
    """#23 mock 예제와 같은 공고 ID·문구를 써서 화면·판정이 같은 데이터를 본다."""
    notices = notices_by_id()
    for summary in _api_example("notices.list.json"):
        notice = notices[summary["noticeId"]]
        assert notice.noticeVersionId == summary["noticeVersionId"]
        assert notice.title == summary["title"]
        assert notice.sourceVerificationStatus == summary["sourceVerificationStatus"]

    detail = _api_example("notice.detail.json")
    a = notices[detail["notice"]["noticeId"]]
    assert [(c.conditionId, c.label, c.evidence.quote) for c in a.conditions] == [
        (c["conditionId"], c["label"], c["evidence"]["quote"]) for c in detail["conditions"]
    ]

    summary = _api_example("preparation-summary.prepared.json")
    assert {d.itemId for d in a.documents} == {i["itemId"] for i in summary["checklist"]}
    assert a.officialSubmissionUrl == summary["officialSubmissionUrl"]


def test_fixture_notice_a_is_the_eligibility_cases_notice():
    """기존 판정 케이스(AC-B01, AC-B02, AC-B03, AC-B08)가 공고 A의 규칙을 그대로 쓴다."""
    cases = json.loads((ROOT / "examples" / "eligibility-cases.json").read_text(encoding="utf-8"))
    a = notices_by_id()["fixture-notice-a"]
    assert cases["noticeVersionId"] == a.noticeVersionId
    assert cases["ruleSet"]["expression"] == a.ruleSet.expression
