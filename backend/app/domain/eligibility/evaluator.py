"""Rule Engine: 검증된 규칙 트리와 학생 사실로 조건별 3값과 최종 판정을 계산한다.

판정 계산은 이 모듈 한 곳에만 있다(BR-B02, ADR-0002). 같은 입력이면 같은 결과(AC-B10).
지원: 비교 잎(>=, <=, ==), AND 노드(3값 진리표, 05 §3).
지원하지 않는 구조(OR 등)는 추측하지 않고 UNKNOWN/UNSUPPORTED_OPERATOR로 둔다 — OR는 #29.
"""

from collections.abc import Mapping
from numbers import Real
from typing import Any

from app.domain.eligibility.model import (
    ConditionOutcome,
    EligibilityGroup,
    Evaluation,
    Fact,
    RuleResult,
)

_GROUP: dict[RuleResult, EligibilityGroup] = {
    "PASS": "ELIGIBLE",
    "FAIL": "INELIGIBLE",
    "UNKNOWN": "NEEDS_REVIEW",
}


def evaluate(expression: Mapping[str, Any], facts: Mapping[str, Fact]) -> Evaluation:
    if expression == {"and": []}:
        # 빈 규칙을 PASS로 만들지 않는다 (BR-B09, 05 §4 빈 배열 금지).
        return Evaluation((), "UNKNOWN", "NEEDS_REVIEW", reason_code="RULE_UNVERIFIED")

    outcomes: list[ConditionOutcome] = []
    aggregate = _eval_node(expression, dict(facts), outcomes)
    return Evaluation(tuple(outcomes), aggregate, _GROUP[aggregate])


def _eval_node(node: Any, facts: dict[str, Fact], out: list[ConditionOutcome]) -> RuleResult:
    if isinstance(node, Mapping) and set(node) == {"and"} and isinstance(node["and"], list):
        if not node["and"]:
            return "UNKNOWN"  # 중첩된 빈 AND도 PASS로 보지 않는다
        return _and([_eval_node(child, facts, out) for child in node["and"]])
    if isinstance(node, Mapping) and "op" in node and "id" in node:
        return _eval_leaf(node, facts, out)
    return _unsupported(node, out)


def _and(results: list[RuleResult]) -> RuleResult:
    """필수조건 AND: FAIL 하나라도 있으면 FAIL, 없고 UNKNOWN이 있으면 UNKNOWN, 아니면 PASS."""
    if "FAIL" in results:
        return "FAIL"
    if "UNKNOWN" in results:
        return "UNKNOWN"
    return "PASS"


def _eval_leaf(leaf: Mapping[str, Any], facts: dict[str, Fact], out: list) -> RuleResult:
    condition_id, field = leaf["id"], leaf.get("field")
    compare = _COMPARATORS.get(leaf["op"])
    if compare is None or field is None:
        out.append(ConditionOutcome(condition_id, field, "UNKNOWN", "UNSUPPORTED_OPERATOR"))
        return "UNKNOWN"

    fact = facts.get(field)
    if fact is None or not fact.is_known or fact.value is None:
        out.append(ConditionOutcome(condition_id, field, "UNKNOWN", "MISSING_FACT"))
        return "UNKNOWN"

    matched = compare(fact.value, leaf.get("value"))
    if matched is None:  # 비교할 수 없는 타입 — 추측하지 않는다
        out.append(ConditionOutcome(condition_id, field, "UNKNOWN", "UNSUPPORTED_OPERATOR"))
        return "UNKNOWN"
    result: RuleResult = "PASS" if matched else "FAIL"
    reason = "EVALUATED" if matched else "VALUE_MISMATCH"
    out.append(ConditionOutcome(condition_id, field, result, reason))
    return result


def _unsupported(node: Any, out: list[ConditionOutcome]) -> RuleResult:
    """평가할 수 없는 노드 아래의 모든 조건을 UNKNOWN/UNSUPPORTED_OPERATOR로 기록한다."""
    for leaf in _leaves(node):
        out.append(
            ConditionOutcome(leaf["id"], leaf.get("field"), "UNKNOWN", "UNSUPPORTED_OPERATOR")
        )
    return "UNKNOWN"


def _leaves(node: Any):
    if isinstance(node, Mapping):
        if "id" in node:
            yield node
            return
        for value in node.values():
            yield from _leaves(value)
    elif isinstance(node, list):
        for value in node:
            yield from _leaves(value)


def _is_number(value: Any) -> bool:
    return isinstance(value, Real) and not isinstance(value, bool)


def _ordered(check):
    def compare(actual: Any, expected: Any) -> bool | None:
        if not (_is_number(actual) and _is_number(expected)):
            return None
        return check(actual, expected)

    return compare


def _equals(actual: Any, expected: Any) -> bool | None:
    if type(actual) is not type(expected) and not (_is_number(actual) and _is_number(expected)):
        return None
    return actual == expected


_COMPARATORS = {
    ">=": _ordered(lambda a, b: a >= b),
    "<=": _ordered(lambda a, b: a <= b),
    "==": _equals,
}
