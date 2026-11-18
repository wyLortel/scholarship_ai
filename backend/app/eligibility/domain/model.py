"""Rule Engine 입력·출력 모델 (05-eligibility-policy §7). FastAPI·저장소를 모른다."""

from dataclasses import dataclass
from typing import Any, Literal

RuleResult = Literal["PASS", "FAIL", "UNKNOWN"]
EligibilityGroup = Literal["ELIGIBLE", "INELIGIBLE", "NEEDS_REVIEW"]
ReasonCode = Literal[
    "EVALUATED",
    "VALUE_MISMATCH",
    "MISSING_FACT",
    "INSTITUTION_CONFIRMATION",
    "RULE_UNVERIFIED",
    "UNSUPPORTED_OPERATOR",
]


@dataclass(frozen=True)
class Fact:
    """학생 사실 한 개. 모름은 is_known=False, value=None (0/False로 바꾸지 않는다, BR-B01)."""

    field: str
    is_known: bool
    value: Any


@dataclass(frozen=True)
class ConditionOutcome:
    condition_id: str
    field: str | None
    result: RuleResult
    reason_code: ReasonCode


@dataclass(frozen=True)
class RuleNode:
    """평가한 규칙 트리 한 노드. 원문의 AND/OR 괄호 구조를 그대로 보존한다 (BR-B08)."""

    kind: Literal["AND", "OR", "CONDITION", "UNSUPPORTED"]
    result: RuleResult
    condition_id: str | None = None
    children: tuple["RuleNode", ...] = ()


@dataclass(frozen=True)
class Evaluation:
    conditions: tuple[ConditionOutcome, ...]
    aggregate: RuleResult
    group: EligibilityGroup
    # 규칙 전체를 평가하지 못한 이유 (빈 규칙 등). 정상 평가면 None.
    reason_code: ReasonCode | None = None
    # 평가한 AND/OR 트리. 규칙을 평가하지 못했으면(빈 규칙) None.
    tree: RuleNode | None = None
