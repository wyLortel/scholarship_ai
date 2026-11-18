"""#28 모름(UNKNOWN)은 FAIL이 아니다 (AC-B01, AC-B02, BR-B01, BR-B03, BR-B04, 05 §3)."""

import itertools

import pytest
from fastapi.testclient import TestClient

from app.eligibility.model import Fact
from app.eligibility.rules import evaluate
from app.main import app
from tests.contract import validate

RULE_A = {
    "and": [
        {"id": "grade", "field": "yearInSchool", "op": ">=", "value": 2},
        {"id": "income", "field": "incomeBracket", "op": "<=", "value": 5},
    ]
}


def facts(**values):
    return {f: Fact(field=f, is_known=v is not None, value=v) for f, v in values.items()}


def results(evaluation):
    return {c.condition_id: (c.result, c.reason_code) for c in evaluation.conditions}


def test_AC_B01_unknown_is_not_fail():
    """Given 공고 A, 3학년·소득 모름 / Then 학년 PASS, 소득 UNKNOWN, 전체 NEEDS_REVIEW."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=3, incomeBracket=None))

    assert results(evaluation) == {
        "grade": ("PASS", "EVALUATED"),
        "income": ("UNKNOWN", "MISSING_FACT"),
    }
    assert evaluation.group == "NEEDS_REVIEW"


def test_AC_B02_fail_and_unknown_is_ineligible():
    """Given 공고 A, 1학년·소득 모름 / Then 학년 FAIL, 소득 UNKNOWN, 전체 INELIGIBLE."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=1, incomeBracket=None))

    assert results(evaluation) == {
        "grade": ("FAIL", "VALUE_MISMATCH"),
        "income": ("UNKNOWN", "MISSING_FACT"),
    }
    assert evaluation.group == "INELIGIBLE"


def test_missing_field_entirely_is_unknown():
    """사실을 아예 보내지 않아도 FAIL/0으로 채우지 않는다."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=3))

    assert results(evaluation)["income"] == ("UNKNOWN", "MISSING_FACT")
    assert evaluation.group == "NEEDS_REVIEW"


# 공고 A에서 각 조건이 PASS/FAIL/UNKNOWN이 되는 입력값
YEAR = {"PASS": 3, "FAIL": 1, "UNKNOWN": None}
INCOME = {"PASS": 4, "FAIL": 7, "UNKNOWN": None}
AND_TABLE = {
    ("PASS", "PASS"): "PASS",
    ("PASS", "FAIL"): "FAIL",
    ("PASS", "UNKNOWN"): "UNKNOWN",
    ("FAIL", "PASS"): "FAIL",
    ("FAIL", "FAIL"): "FAIL",
    ("FAIL", "UNKNOWN"): "FAIL",
    ("UNKNOWN", "PASS"): "UNKNOWN",
    ("UNKNOWN", "FAIL"): "FAIL",
    ("UNKNOWN", "UNKNOWN"): "UNKNOWN",
}
GROUP = {"PASS": "ELIGIBLE", "FAIL": "INELIGIBLE", "UNKNOWN": "NEEDS_REVIEW"}


@pytest.mark.parametrize(("left", "right"), list(itertools.product(YEAR, INCOME)))
def test_and_truth_table(left, right):
    """05 §3 AND 진리표 전 행(3×3). 순서를 바꿔도 같다."""
    evaluation = evaluate(RULE_A, facts(yearInSchool=YEAR[left], incomeBracket=INCOME[right]))

    assert evaluation.aggregate == AND_TABLE[(left, right)]
    assert evaluation.group == GROUP[AND_TABLE[(left, right)]]


def _request(year, income):
    def fact(field, value, unit):
        return {
            "field": field,
            "isKnown": value is not None,
            "value": value,
            "unit": unit,
            "effectiveAt": None,
            "source": "STUDENT_PROVIDED",
        }

    return {
        "noticeVersionId": "fixture-notice-a-v1",
        "facts": [fact("yearInSchool", year, "학년"), fact("incomeBracket", income, "구간")],
    }


@pytest.mark.parametrize(
    ("year", "expected_group", "grade_result"),
    [
        pytest.param(3, "NEEDS_REVIEW", "PASS", id="AC_B01"),
        pytest.param(1, "INELIGIBLE", "FAIL", id="AC_B02"),
    ],
)
def test_api_unknown_income(year, expected_group, grade_result):
    body = TestClient(app).post("/api/assessments", json=_request(year, None)).json()

    validate(body, "AssessmentResult")
    assert body["eligibilityResult"] == expected_group
    details = {d["conditionId"]: d for d in body["details"]}
    assert details["grade"]["result"] == grade_result
    assert details["income"]["result"] == "UNKNOWN"
    assert details["income"]["reasonCode"] == "MISSING_FACT"
