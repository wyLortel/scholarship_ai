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
class Evaluation:
    conditions: tuple[ConditionOutcome, ...]
    aggregate: RuleResult
    group: EligibilityGroup
    # 규칙 전체를 평가하지 못한 이유 (빈 규칙 등). 정상 평가면 None.
    reason_code: ReasonCode | None = None
