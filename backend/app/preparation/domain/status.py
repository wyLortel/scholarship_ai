"""준비 요약 상태 (09 §4, 계약 /preparation-summaries). FastAPI·저장소를 모른다.

판정은 Rule Engine 결과를 그대로 받는다 — 여기서 다시 계산하지 않는다 (BR-B02).
`SUBMITTED` 같은 제출 상태는 없다 — 공식 제출은 학생이 직접 한다 (BR-C07).
"""

from typing import Literal

from app.eligibility.domain.model import EligibilityGroup

PreparationStatus = Literal["PREPARED", "PREPARED_WITH_OPEN_ITEMS", "STOPPED"]

_STATUS: dict[EligibilityGroup, PreparationStatus] = {
    "ELIGIBLE": "PREPARED",
    # UNKNOWN은 자동 불가가 아니다. 확인 사항을 붙여 준비한다 (BR-C04, OPEN-16 임시 행동).
    "NEEDS_REVIEW": "PREPARED_WITH_OPEN_ITEMS",
    # 확정 불가면 준비하지 않는다 (BR-C02).
    "INELIGIBLE": "STOPPED",
}


def preparation_status(group: EligibilityGroup) -> PreparationStatus:
    return _STATUS[group]
