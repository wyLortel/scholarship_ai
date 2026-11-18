import type { ConditionEvaluation, EligibilityGroup, RuleResult } from "@/lib/api/types";

import { factName } from "@/features/assessment/model/facts";

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
  const missing = details
    .filter((d) => d.result === "UNKNOWN" && d.reasonCode === "MISSING_FACT")
    .map((d) => factName(d.studentFactRef));
  if (missing.length > 0) {
    const names = missing.join(", ");
    return `${names}${objectParticle(names)} 입력하지 않아 판단을 마치지 못했습니다. 공고 기준연도 값을 확인해 주세요.`;
  }
  if (details.some((d) => d.reasonCode === "INSTITUTION_CONFIRMATION")) {
    return "이 조건은 공식 기관의 해석이 필요합니다. 저희가 임의로 결정하지 않습니다.";
  }
  return "아직 판단을 마치지 못한 조건이 있습니다. 아래 '확인 필요' 조건을 확인해 주세요.";
}

// UNKNOWN일 때 이유를 함께 보여준다(색상만으로 상태를 전달하지 않음).
export const unknownReason: Partial<Record<ConditionEvaluation["reasonCode"], string>> = {
  MISSING_FACT: "입력하지 않음",
  INSTITUTION_CONFIRMATION: "기관 확인 필요",
  RULE_UNVERIFIED: "조건 검증 전",
  UNSUPPORTED_OPERATOR: "자동 판단 불가",
};

export const resultLabel: Record<RuleResult, string> = {
  PASS: "충족",
  FAIL: "미충족",
  UNKNOWN: "확인 필요",
};

export const resultIcon: Record<RuleResult, string> = { PASS: "✓", FAIL: "✕", UNKNOWN: "?" };

// 받침 있으면 "을", 없으면 "를" (한글이 아니면 "을(를)").
export function objectParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return "을(를)";
  return code % 28 === 0 ? "를" : "을";
}
