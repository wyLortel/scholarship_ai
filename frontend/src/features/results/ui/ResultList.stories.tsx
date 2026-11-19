import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ResultList } from "./ResultList";
import {
  emptyRuleD,
  eligibleA,
  ineligibleB,
  needsReviewA,
  noticeA,
  noticeB,
  noticeD,
} from "./storyData";

const meta = {
  title: "Results/ResultList",
  component: ResultList,
  args: { entries: [] },
} satisfies Meta<typeof ResultList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 시안 06: 가능·불가·확인 필요 카드와 그룹 개수(응답을 세기만 함) */
export const Mixed: Story = {
  args: {
    entries: [
      { notice: noticeA, status: "done", result: eligibleA },
      { notice: noticeB, status: "done", result: ineligibleB },
      { notice: noticeD, status: "done", result: emptyRuleD },
    ],
  },
};

/** AC-B01: 소득 모름 → 확인 필요 (불가로 바꾸지 않음) */
export const NeedsReview: Story = {
  args: { entries: [{ notice: noticeA, status: "done", result: needsReviewA }] },
};

/** 판정 API 실패: 배지 없이 '확인하지 못함', 다른 공고는 그대로 */
export const OneFailed: Story = {
  args: {
    entries: [
      { notice: noticeA, status: "done", result: eligibleA },
      { notice: noticeB, status: "error", message: "이 공고는 지금 조건을 확인하지 못했어요." },
    ],
  },
};

/** 검증된 공고가 없음 */
export const Empty: Story = {};
