"""#27 Rule Engine — 규칙 트리(AND·비교) 평가와 최종 판정 변환 (05-eligibility-policy §3·§4·§7).

TEST_ONLY 공고 A: grade(yearInSchool >= 2) AND income(incomeBracket <= 5).
판정은 이 모듈 한 곳에서만 계산한다(BR-B02, ADR-0002).
"""

import pytest
from app.domain.eligibility.evaluator import evaluate
from app.domain.eligibility.model import Fact

RULE_A = {
    "and": [
        {"id": "grade", "field": "yearInSchool", "op": ">=", "value": 2},
        {"id": "income", "field": "incomeBracket", "op": "<=", "value": 5},
    ]
}


def facts(**values):
    return {
        field: Fact(field=field, is_known=value is not None, value=value)
        for field, value in values.items()
    }


def results(evaluation):
    return {c.condition_id: c.result for c in evaluation.conditions}


def test_AC_B03_all_pass_is_eligible():
    """Given 공고 A, 3학년·소득 4 / Then 학년 PASS, 소득 PASS, 전체 ELIGIBLE."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=3, incomeBracket=4))

    assert results(evaluation) == {"grade": "PASS", "income": "PASS"}
    assert evaluation.aggregate == "PASS"
    assert evaluation.group == "ELIGIBLE"


def test_AC_B08_income_fail_is_ineligible():
    """Given 공고 A, 3학년·소득 7 / Then 학년 PASS, 소득 FAIL, 전체 INELIGIBLE (BR-B03)."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=3, incomeBracket=7))

    assert results(evaluation) == {"grade": "PASS", "income": "FAIL"}
    assert evaluation.group == "INELIGIBLE"
    income = next(c for c in evaluation.conditions if c.condition_id == "income")
    assert income.reason_code == "VALUE_MISMATCH"


def test_AC_B10_same_input_same_result():
    """같은 규칙·사실이면 조건별 결과와 전체 그룹이 같다. 입력도 바뀌지 않는다."""
    student = facts(yearInSchool=3, incomeBracket=7)
    snapshot = dict(student)

    first = evaluate(RULE_A, student)
    second = evaluate(RULE_A, student)

    assert first == second
    assert student == snapshot


@pytest.mark.parametrize(
    ("year", "income", "expected"),
    [
        (2, 5, {"grade": "PASS", "income": "PASS"}),  # 경계값 포함 (>=, <=)
        (1, 5, {"grade": "FAIL", "income": "PASS"}),
        (2, 6, {"grade": "PASS", "income": "FAIL"}),
    ],
)
def test_comparison_boundaries(year, income, expected):
    assert results(evaluate(RULE_A, facts(yearInSchool=year, incomeBracket=income))) == expected


def test_equality_operator():
    rule = {"and": [{"id": "enrolled", "field": "isEnrolled", "op": "==", "value": True}]}

    assert evaluate(rule, facts(isEnrolled=True)).group == "ELIGIBLE"
    assert evaluate(rule, facts(isEnrolled=False)).group == "INELIGIBLE"


def test_condition_order_follows_rule_tree():
    evaluation = evaluate(RULE_A, facts(yearInSchool=3, incomeBracket=4))

    assert [c.condition_id for c in evaluation.conditions] == ["grade", "income"]
    assert [c.field for c in evaluation.conditions] == ["yearInSchool", "incomeBracket"]


# --- 안전 가드: 아래 동작의 화면·수용 테스트는 #28(모름), #29(OR), #30(빈 규칙)에서 확장한다.


def test_guard_missing_fact_is_unknown_never_fail():
    """사실이 없으면 FAIL/0으로 바꾸지 않는다 (BR-B01)."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=3, incomeBracket=None))

    income = next(c for c in evaluation.conditions if c.condition_id == "income")
    assert income.result == "UNKNOWN"
    assert income.reason_code == "MISSING_FACT"
    assert evaluation.group != "ELIGIBLE"


def test_guard_empty_rule_is_never_eligible():
    """빈 AND를 every([]) == true처럼 PASS로 만들지 않는다 (BR-B09)."""
    evaluation = evaluate({"and": []}, facts())

    assert evaluation.group == "NEEDS_REVIEW"
    assert evaluation.reason_code == "RULE_UNVERIFIED"


@pytest.mark.parametrize(
    "rule",
    [
        pytest.param(
            {"and": [{"id": "x", "field": "f", "op": "!=", "value": 1}]}, id="unknown-operator"
        ),
        pytest.param({"or": [{"id": "x", "field": "f", "op": ">=", "value": 1}]}, id="or-node"),
        pytest.param({"not": {"id": "x"}}, id="unknown-node"),
    ],
)
def test_guard_unsupported_rule_is_needs_review(rule):
    """지원하지 않는 구조는 추측해서 평가하지 않는다. 가능 금지."""
    evaluation = evaluate(rule, facts(f=5))

    assert evaluation.group == "NEEDS_REVIEW"
    assert all(c.result == "UNKNOWN" for c in evaluation.conditions)
    assert all(c.reason_code == "UNSUPPORTED_OPERATOR" for c in evaluation.conditions)
