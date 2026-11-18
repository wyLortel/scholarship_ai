import type { ConditionEvaluation, EligibilityGroup, RuleResult } from "@/lib/api/types";

// UX 계약(docs/02-product/03-UX-contract.md)의 의사결정 순간별 카피. 판정 값은 서버가 준 것만 쓴다.
export const groupLabel: Record<EligibilityGroup, string> = {
  ELIGIBLE: "조건상 가능",
  INELIGIBLE: "현재 정보 기준 불가",
  NEEDS_REVIEW: "확인 필요",
};

export function groupMessage(group: EligibilityGroup, details: ConditionEvaluation[]): string {
  if (group === "ELIGIBLE") {
    return "입력한 정보와 확인된 공고 조건에서는 지원 요건을 충족합니다. 실제 선정은 해당 기관이 판단합니다.";
  }
  if (group === "INELIGIBLE") {
    const failed = details.filter((d) => d.result === "FAIL").map((d) => d.label);
    return `이 공고의 [${failed.join(", ")}] 조건이 입력 정보와 맞지 않습니다. 아래 공식 원문 근거를 확인해 주세요.`;
  }
  return "아직 판단을 마치지 못한 조건이 있습니다. 아래 '확인 필요' 조건을 확인해 주세요.";
}

export const resultLabel: Record<RuleResult, string> = {
  PASS: "충족",
  FAIL: "미충족",
  UNKNOWN: "확인 필요",
};

export const resultIcon: Record<RuleResult, string> = { PASS: "✓", FAIL: "✕", UNKNOWN: "?" };
