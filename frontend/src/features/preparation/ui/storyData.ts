import type { ChecklistItem, PreparationSummary } from "@/lib/api/types";

// Storybook 전용 TEST_ONLY 예시 (examples/api/preparation-summary.*.json과 같은 값). 실제 공고가 아니다.
const evidence = (id: string, location: string, quote: string) => ({
  evidenceId: id,
  noticeVersionId: "fixture-notice-a-v1",
  fileId: "fixture-file-a",
  location,
  quote,
  officialUrl: "https://example.org/test-only/fixture-notice-a",
  checkedAt: "2026-11-18T09:00:00+09:00",
  verifiedAt: "2026-11-18T09:00:00+09:00",
});

export const enrollment: ChecklistItem = {
  itemId: "doc-enrollment",
  documentName: "재학증명서",
  reason: "지원 자격(재학생) 확인용으로 제출 서류에 명시됨",
  isConditional: false,
  appliesWhen: null,
  issuer: "재학 중인 대학교",
  issuanceGuideUrl: "https://example.org/test-only/issuance/enrollment",
  evidence: evidence("ev-a-doc-enrollment", "본문 4. 제출 서류 (1)", "재학증명서 1부"),
};

export const family: ChecklistItem = {
  itemId: "doc-family",
  documentName: "가족관계증명서",
  reason: "소득구간 확인이 필요한 경우 제출하도록 명시됨",
  isConditional: true,
  appliesWhen: "소득구간 확인 서류를 요청받은 경우",
  issuer: null,
  issuanceGuideUrl: null,
  evidence: evidence(
    "ev-a-doc-family",
    "본문 4. 제출 서류 (2)",
    "해당자에 한하여 가족관계증명서 1부",
  ),
};

export const preparedSummary: PreparationSummary = {
  noticeId: "fixture-notice-a",
  noticeVersionId: "fixture-notice-a-v1",
  eligibilityResult: "ELIGIBLE",
  preparationStatus: "PREPARED",
  checklist: [enrollment, family],
  openItems: [],
  failedConditions: [],
  officialSubmissionUrl: "https://example.org/test-only/fixture-notice-a/apply",
};

export const openItemsSummary: PreparationSummary = {
  ...preparedSummary,
  eligibilityResult: "NEEDS_REVIEW",
  preparationStatus: "PREPARED_WITH_OPEN_ITEMS",
  openItems: [{ conditionId: "income", label: "소득구간 5구간 이하", reasonCode: "MISSING_FACT" }],
};
