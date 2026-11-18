import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { AssessmentResult, ConditionEvaluation } from "@/lib/api/types";

import { ChatView } from "./ChatView";
import { GREETING, questionText, startText } from "./script";
import type { ChatMessage, ChatNotice, ChatQuestion } from "./types";

// TEST_ONLY 공고 A 대화(정해진 질문). 판정 값은 API 응답 예시를 그대로 쓴다 — 실제 판정이 아니다.
const noticeA: ChatNotice = {
  noticeId: "fixture-notice-a",
  noticeVersionId: "fixture-notice-a-v1",
  title: "[TEST_ONLY] 가상 재단 학업장려 장학금",
  isTestOnly: true,
  questions: [
    {
      field: "yearInSchool",
      conditionLabels: ["2학년 이상"],
      quote: "신청일 기준 2학년 이상 재학생",
      location: "본문 2. 지원 자격 (1)",
    },
    {
      field: "incomeBracket",
      conditionLabels: ["소득구간 5구간 이하"],
      quote: "학자금 지원구간(소득구간) 5구간 이하인 자",
      location: "본문 2. 지원 자격 (2)",
    },
  ],
};
const [gradeQ, incomeQ] = noticeA.questions;

const condition = (
  id: "grade" | "income",
  result: ConditionEvaluation["result"],
): ConditionEvaluation => {
  const q = id === "grade" ? gradeQ : incomeQ;
  return {
    conditionId: id,
    label: q.conditionLabels[0],
    result,
    reasonCode:
      result === "FAIL" ? "VALUE_MISMATCH" : result === "UNKNOWN" ? "MISSING_FACT" : "EVALUATED",
    evidence: {
      evidenceId: `ev-a-${id}`,
      noticeVersionId: "fixture-notice-a-v1",
      fileId: "fixture-file-a",
      location: q.location,
      quote: q.quote,
      officialUrl: "https://example.org/test-only/fixture-notice-a",
      checkedAt: "2026-11-18T09:00:00+09:00",
      verifiedAt: "2026-11-18T09:00:00+09:00",
    },
    missingEvidenceFields: [],
    studentFactRef: q.field,
  };
};

const result = (
  group: AssessmentResult["eligibilityResult"],
  grade: ConditionEvaluation["result"],
  income: ConditionEvaluation["result"],
): AssessmentResult => ({
  assessmentId: "story",
  noticeVersionId: "fixture-notice-a-v1",
  eligibilityResult: group,
  evidenceComplete: true,
  details: [condition("grade", grade), condition("income", income)],
  assessedAt: "2026-11-18T12:00:00+09:00",
  isStale: false,
  warning: null,
  ruleTree: null,
});

const bot = (id: string, text: string, context?: ChatQuestion): ChatMessage => ({
  id,
  from: "bot",
  text,
  context,
});
const user = (id: string, text: string): ChatMessage => ({ id, from: "user", text });

const conversation = (year: string, income: string): ChatMessage[] => [
  bot("g", GREETING),
  user("p", noticeA.title),
  bot("s", startText(noticeA)),
  bot("q1", questionText(gradeQ), gradeQ),
  user("a1", year),
  bot("q2", questionText(incomeQ), incomeQ),
  user("a2", income),
];

const used = (year: string, income: string) => [
  { field: "yearInSchool", name: "학년", answer: year },
  { field: "incomeBracket", name: "소득구간", answer: income },
];

const meta = {
  title: "Chat/ChatView",
  component: ChatView,
  parameters: { layout: "fullscreen" },
  args: {
    notices: [noticeA],
    selected: noticeA,
    messages: [],
    phase: { kind: "choosing" },
    usedFacts: [],
  },
} satisfies Meta<typeof ChatView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 첫 상담: 공고 선택 (시안 12) */
export const ChoosingNotice: Story = {
  args: { selected: null, messages: [bot("g", GREETING)] },
};

/** 질문 중: 왜 묻는지 원문 근거와 '모름' 선택지 (시안 05) */
export const Asking: Story = {
  args: {
    messages: conversation("3학년", "").slice(0, 6),
    phase: {
      kind: "asking",
      question: incomeQ,
      choices: [
        { value: "4", label: "4구간" },
        { value: "7", label: "7구간" },
        { value: "unknown", label: "모름" },
      ],
    },
    usedFacts: used("3학년", "").slice(0, 1),
  },
};

/** 확인 중: 결과가 오기 전에는 가능·불가를 말하지 않는다 */
export const Checking: Story = {
  args: {
    messages: conversation("3학년", "4구간"),
    phase: { kind: "checking" },
    usedFacts: used("3학년", "4구간"),
  },
};

/** AC-B03 결과: 조건상 가능 */
export const Eligible: Story = {
  args: {
    messages: conversation("3학년", "4구간"),
    phase: { kind: "done", result: result("ELIGIBLE", "PASS", "PASS") },
    usedFacts: used("3학년", "4구간"),
  },
};

/** AC-B02 결과: 1학년·모름 → 불가 (채팅 문구가 판정을 덮어쓰지 않음) */
export const Ineligible: Story = {
  args: {
    messages: conversation("1학년", "모름"),
    phase: { kind: "done", result: result("INELIGIBLE", "FAIL", "UNKNOWN") },
    usedFacts: used("1학년", "모름"),
  },
};

/** AC-B06 결과: 3학년·모름 → 확인 필요, 채팅 어디에도 '가능' 없음 */
export const NeedsReview: Story = {
  args: {
    messages: conversation("3학년", "모름"),
    phase: { kind: "done", result: result("NEEDS_REVIEW", "PASS", "UNKNOWN") },
    usedFacts: used("3학년", "모름"),
  },
};
