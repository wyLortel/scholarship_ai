import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { AssessmentResult, ConditionEvaluation, EvidenceRef } from "@/lib/api/types";

import { AssessmentResultView } from "./AssessmentResultView";

// TEST_ONLY 공고 A 응답 예시(examples/api/assessment.*.json과 같은 모양). 실제 판정이 아니다.
const evidence = (id: string, location: string, quote: string): EvidenceRef => ({
  evidenceId: id,
  noticeVersionId: "fixture-notice-a-v1",
  fileId: "fixture-file-a",
  location,
  quote,
  officialUrl: "https://example.org/test-only/fixture-notice-a",
  checkedAt: "2026-11-18T09:00:00+09:00",
  verifiedAt: "2026-11-18T09:00:00+09:00",
});

const grade = (result: ConditionEvaluation["result"]): ConditionEvaluation => ({
  conditionId: "grade",
  label: "2학년 이상",
  result,
  reasonCode: result === "FAIL" ? "VALUE_MISMATCH" : "EVALUATED",
  evidence: evidence("ev-a-grade", "본문 2. 지원 자격 (1)", "신청일 기준 2학년 이상 재학생"),
  missingEvidenceFields: [],
  studentFactRef: "yearInSchool",
});

const income = (result: ConditionEvaluation["result"]): ConditionEvaluation => ({
  conditionId: "income",
  label: "소득구간 5구간 이하",
  result,
  reasonCode:
    result === "FAIL" ? "VALUE_MISMATCH" : result === "UNKNOWN" ? "MISSING_FACT" : "EVALUATED",
  evidence: evidence(
    "ev-a-income",
    "본문 2. 지원 자격 (2)",
    "학자금 지원구간(소득구간) 5구간 이하인 자",
  ),
  missingEvidenceFields: [],
  studentFactRef: "incomeBracket",
});

const base: Omit<AssessmentResult, "eligibilityResult" | "details"> = {
  assessmentId: "story",
  noticeVersionId: "fixture-notice-a-v1",
  evidenceComplete: true,
  assessedAt: "2026-11-18T12:00:00+09:00",
  isStale: false,
  warning: null,
};

const meta = {
  title: "Assessment/AssessmentResultView",
  component: AssessmentResultView,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AssessmentResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** AC-B03: 3학년·소득 4 → 모두 충족, "선정은 기관" 문구 */
export const Eligible: Story = {
  args: {
    result: { ...base, eligibilityResult: "ELIGIBLE", details: [grade("PASS"), income("PASS")] },
  },
};

/** AC-B08: 3학년·소득 7 → 소득 미충족, 실패 조건 이름과 원문 근거 */
export const Ineligible: Story = {
  args: {
    result: { ...base, eligibilityResult: "INELIGIBLE", details: [grade("PASS"), income("FAIL")] },
  },
};

/** AC-B01: 3학년·소득 모름 → 소득 UNKNOWN(입력하지 않음), 전체 확인 필요 */
export const NeedsReview: Story = {
  args: {
    result: {
      ...base,
      eligibilityResult: "NEEDS_REVIEW",
      details: [grade("PASS"), income("UNKNOWN")],
    },
  },
};

/** AC-B02: 1학년·소득 모름 → 학년 FAIL이 있어 전체 불가, 소득은 모름 그대로 */
export const FailWithUnknown: Story = {
  args: {
    result: {
      ...base,
      eligibilityResult: "INELIGIBLE",
      details: [grade("FAIL"), income("UNKNOWN")],
    },
  },
};
