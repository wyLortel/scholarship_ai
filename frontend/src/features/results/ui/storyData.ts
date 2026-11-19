import type { AssessmentResult, ConditionEvaluation, NoticeSummary } from "@/lib/api/types";

// Storybook 전용 TEST_ONLY 예시 (examples/fixture-notices.json의 공고 A, B, D). 실제 공고가 아니다.
const notice = (id: string, title: string, institution: string): NoticeSummary => ({
  noticeId: `fixture-notice-${id}`,
  noticeVersionId: `fixture-notice-${id}-v1`,
  title,
  institution,
  isTestOnly: true,
  officialUrl: `https://example.org/test-only/fixture-notice-${id}`,
  sourceVerificationStatus: "VERIFIED",
  freshnessStatus: "CHECKED_UNCHANGED",
  lastCheckedAt: "2026-11-18T09:00:00+09:00",
  recruitmentStartAt: "2026-12-01T00:00:00+09:00",
  recruitmentEndAt: "2026-12-31T18:00:00+09:00",
});

export const noticeA = notice(
  "a",
  "[TEST_ONLY] 가상 재단 학업장려 장학금",
  "[TEST_ONLY] 가상 장학재단",
);
export const noticeB = notice(
  "b",
  "[TEST_ONLY] 가상 지역인재 장학금 (대안 자격)",
  "[TEST_ONLY] 가상 지역재단",
);
export const noticeD = notice(
  "d",
  "[TEST_ONLY] 가상 특별 장학금 (규칙 없음)",
  "[TEST_ONLY] 가상 복지재단",
);

const detail = (
  n: NoticeSummary,
  conditionId: string,
  label: string,
  result: ConditionEvaluation["result"],
  field: string,
): ConditionEvaluation => ({
  conditionId,
  label,
  result,
  reasonCode:
    result === "FAIL" ? "VALUE_MISMATCH" : result === "UNKNOWN" ? "MISSING_FACT" : "EVALUATED",
  evidence: {
    evidenceId: `ev-${conditionId}`,
    noticeVersionId: n.noticeVersionId,
    fileId: "fixture-file",
    location: "본문 2. 지원 자격",
    quote: label,
    officialUrl: n.officialUrl,
    checkedAt: "2026-11-18T09:00:00+09:00",
    verifiedAt: "2026-11-18T09:00:00+09:00",
  },
  missingEvidenceFields: [],
  studentFactRef: field,
});

export const result = (
  n: NoticeSummary,
  group: AssessmentResult["eligibilityResult"],
  details: ConditionEvaluation[],
): AssessmentResult => ({
  assessmentId: `story-${n.noticeId}`,
  noticeVersionId: n.noticeVersionId,
  eligibilityResult: group,
  evidenceComplete: details.length > 0,
  details,
  assessedAt: "2026-11-19T12:00:00+09:00",
  isStale: false,
  warning: null,
  ruleTree: null,
});

/** 3학년·소득 4·재학 중·다자녀 모름 → A 가능, B 가능(OR 소득), D 확인 필요(규칙 없음) */
export const eligibleA = result(noticeA, "ELIGIBLE", [
  detail(noticeA, "grade", "2학년 이상", "PASS", "yearInSchool"),
  detail(noticeA, "income", "소득구간 5구간 이하", "PASS", "incomeBracket"),
]);

export const needsReviewA = result(noticeA, "NEEDS_REVIEW", [
  detail(noticeA, "grade", "2학년 이상", "PASS", "yearInSchool"),
  detail(noticeA, "income", "소득구간 5구간 이하", "UNKNOWN", "incomeBracket"),
]);

export const ineligibleB = result(noticeB, "INELIGIBLE", [
  detail(noticeB, "enrolled", "재학생", "FAIL", "isEnrolled"),
  detail(noticeB, "income", "소득구간 3구간 이하", "PASS", "incomeBracket"),
]);

export const emptyRuleD = result(noticeD, "NEEDS_REVIEW", []);
