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

/** AC-B05: 빈 규칙 공고 D → 보여 줄 조건 없이 '아직 확인 중' + 사유 (가능 금지) */
export const EmptyRule: Story = {
  args: {
    result: {
      ...base,
      noticeVersionId: "fixture-notice-d-v1",
      eligibilityResult: "NEEDS_REVIEW",
      details: [],
      ruleTree: null,
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

// TEST_ONLY 공고 B: 재학 AND (소득 3구간 이하 OR 다자녀)
const bCondition = (
  conditionId: string,
  label: string,
  quote: string,
  result: ConditionEvaluation["result"],
  studentFactRef: string,
): ConditionEvaluation => ({
  conditionId,
  label,
  result,
  reasonCode:
    result === "FAIL" ? "VALUE_MISMATCH" : result === "UNKNOWN" ? "MISSING_FACT" : "EVALUATED",
  evidence: {
    ...evidence(`ev-b-${conditionId}`, "본문 2. 지원 자격", quote),
    noticeVersionId: "fixture-notice-b-v1",
  },
  missingEvidenceFields: [],
  studentFactRef,
});

/** AC-B04: 재학 PASS, 소득 FAIL, 다자녀 PASS → OR 묶음 충족, 전체 가능 (평탄화하면 FAIL이 됨) */
export const OrGroupEligible: Story = {
  args: {
    result: {
      ...base,
      noticeVersionId: "fixture-notice-b-v1",
      eligibilityResult: "ELIGIBLE",
      details: [
        bCondition("enrolled", "재학생", "공고일 현재 재학 중인 학생", "PASS", "isEnrolled"),
        bCondition(
          "income",
          "소득구간 3구간 이하",
          "가. 학자금 지원구간 3구간 이하인 자",
          "FAIL",
          "incomeBracket",
        ),
        bCondition(
          "multiChild",
          "다자녀 가구",
          "나. 다자녀 가구(자녀 3명 이상)의 자녀",
          "PASS",
          "isMultiChildHousehold",
        ),
      ],
      ruleTree: {
        type: "AND",
        result: "PASS",
        children: [
          { type: "CONDITION", result: "PASS", conditionId: "enrolled", children: [] },
          {
            type: "OR",
            result: "PASS",
            children: [
              { type: "CONDITION", result: "FAIL", conditionId: "income", children: [] },
              { type: "CONDITION", result: "PASS", conditionId: "multiChild", children: [] },
            ],
          },
        ],
      },
    },
  },
};
