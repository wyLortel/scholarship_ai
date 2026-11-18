"""#29 OR 규칙과 괄호 구조 보존 (AC-B04, 05 §3 OR 진리표, 05 §6-5, BR-B08).

TEST_ONLY 공고 B: enrolled AND (income <= 3 OR multiChild).
"""

import itertools

import pytest
from fastapi.testclient import TestClient

from app.eligibility.domain.model import Fact
from app.eligibility.domain.rules import evaluate
from app.main import app
from tests.contract import validate

RULE_B = {
    "and": [
        {"id": "enrolled", "field": "isEnrolled", "op": "==", "value": True},
        {
            "or": [
                {"id": "income", "field": "incomeBracket", "op": "<=", "value": 3},
                {"id": "multiChild", "field": "isMultiChildHousehold", "op": "==", "value": True},
            ]
        },
    ]
}


def facts(**values):
    return {f: Fact(field=f, is_known=v is not None, value=v) for f, v in values.items()}


def evaluate_b(enrolled, income, multi_child):
    return evaluate(
        RULE_B,
        facts(isEnrolled=enrolled, incomeBracket=income, isMultiChildHousehold=multi_child),
    )


def results(evaluation):
    return {c.condition_id: c.result for c in evaluation.conditions}


def test_AC_B04_or_preserved():
    """A=PASS, B=FAIL, C=PASS → PASS. A AND B AND C로 펼쳐 FAIL을 내지 않는다."""
    evaluation = evaluate(
        RULE_B, facts(isEnrolled=True, incomeBracket=7, isMultiChildHousehold=True)
    )

    assert results(evaluation) == {"enrolled": "PASS", "income": "FAIL", "multiChild": "PASS"}
    assert evaluation.aggregate == "PASS"
    assert evaluation.group == "ELIGIBLE"


def test_or_with_unknown_income7():
    """05 §6-5: 소득 7(FAIL) OR 별도 자격 모름 → OR 묶음 UNKNOWN, 전체 확인 필요."""
    evaluation = evaluate(
        RULE_B, facts(isEnrolled=True, incomeBracket=7, isMultiChildHousehold=None)
    )

    assert results(evaluation)["multiChild"] == "UNKNOWN"
    assert evaluation.group == "NEEDS_REVIEW"


INCOME = {"PASS": 2, "FAIL": 7, "UNKNOWN": None}
MULTI = {"PASS": True, "FAIL": False, "UNKNOWN": None}
OR_TABLE = {
    ("PASS", "PASS"): "PASS",
    ("PASS", "FAIL"): "PASS",
    ("PASS", "UNKNOWN"): "PASS",
    ("FAIL", "PASS"): "PASS",
    ("FAIL", "FAIL"): "FAIL",
    ("FAIL", "UNKNOWN"): "UNKNOWN",
    ("UNKNOWN", "PASS"): "PASS",
    ("UNKNOWN", "FAIL"): "UNKNOWN",
    ("UNKNOWN", "UNKNOWN"): "UNKNOWN",
}


@pytest.mark.parametrize(("left", "right"), list(itertools.product(INCOME, MULTI)))
def test_or_truth_table(left, right):
    """05 §3 OR 진리표 전 행. 재학(PASS)과 AND하면 OR 결과가 그대로 전체 결과다."""
    evaluation = evaluate(
        RULE_B,
        facts(isEnrolled=True, incomeBracket=INCOME[left], isMultiChildHousehold=MULTI[right]),
    )

    assert evaluation.aggregate == OR_TABLE[(left, right)]


def test_and_outside_or_still_fails():
    """바깥 AND의 FAIL은 OR이 PASS여도 전체 FAIL (괄호 구조 그대로)."""
    evaluation = evaluate(
        RULE_B, facts(isEnrolled=False, incomeBracket=2, isMultiChildHousehold=True)
    )

    assert evaluation.group == "INELIGIBLE"


def test_nested_or_inside_and_inside_or():
    """임의 깊이 중첩: (x OR (y AND z))."""
    rule = {
        "or": [
            {"id": "x", "field": "x", "op": "==", "value": True},
            {
                "and": [
                    {"id": "y", "field": "y", "op": ">=", "value": 1},
                    {"id": "z", "field": "z", "op": "<=", "value": 5},
                ]
            },
        ]
    }

    assert evaluate(rule, facts(x=False, y=2, z=3)).aggregate == "PASS"
    assert evaluate(rule, facts(x=False, y=0, z=3)).aggregate == "FAIL"
    assert evaluate(rule, facts(x=None, y=0, z=3)).aggregate == "UNKNOWN"


def test_empty_or_is_never_pass():
    """빈 OR을 any([]) == false처럼 FAIL로도, PASS로도 확정하지 않는다."""
    rule = {"and": [{"id": "x", "field": "x", "op": "==", "value": True}, {"or": []}]}

    assert evaluate(rule, facts(x=True)).aggregate == "UNKNOWN"


def test_rule_tree_keeps_and_or_structure():
    """결과에 AND/OR 트리를 그대로 남긴다 — 화면이 OR을 '다음 중 하나'로 묶어 보여준다."""
    evaluation = evaluate(
        RULE_B, facts(isEnrolled=True, incomeBracket=7, isMultiChildHousehold=True)
    )

    tree = evaluation.tree
    assert (tree.kind, tree.result) == ("AND", "PASS")
    enrolled, group = tree.children
    assert (enrolled.kind, enrolled.condition_id, enrolled.result) == (
        "CONDITION",
        "enrolled",
        "PASS",
    )
    assert (group.kind, group.result) == ("OR", "PASS")
    assert [(c.condition_id, c.result) for c in group.children] == [
        ("income", "FAIL"),
        ("multiChild", "PASS"),
    ]


def _fact(field, value):
    return {
        "field": field,
        "isKnown": value is not None,
        "value": value,
        "source": "STUDENT_PROVIDED",
    }


def test_api_notice_b_or_is_eligible_with_rule_tree():
    body = (
        TestClient(app)
        .post(
            "/api/assessments",
            json={
                "noticeVersionId": "fixture-notice-b-v1",
                "facts": [
                    _fact("isEnrolled", True),
                    _fact("incomeBracket", 7),
                    _fact("isMultiChildHousehold", True),
                ],
            },
        )
        .json()
    )

    validate(body, "AssessmentResult")
    assert body["eligibilityResult"] == "ELIGIBLE"
    tree = body["ruleTree"]
    assert tree["type"] == "AND"
    assert tree["children"][1]["type"] == "OR"
    assert [c["conditionId"] for c in tree["children"][1]["children"]] == ["income", "multiChild"]
