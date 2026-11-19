import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PreparationSummaryView } from "./PreparationSummaryView";
import { openItemsSummary, preparedSummary } from "./storyData";

const meta = {
  title: "Preparation/PreparationSummaryView",
  component: PreparationSummaryView,
  args: { summary: preparedSummary },
} satisfies Meta<typeof PreparationSummaryView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** AC-C07: PREPARED + 공식 제출 링크(새 창). 제출이 끝났다는 문구 없음 */
export const Prepared: Story = {};

/** BR-C04: 소득 모름 → PREPARED_WITH_OPEN_ITEMS, 미확인 항목을 계속 보여 줌 */
export const WithOpenItems: Story = { args: { summary: openItemsSummary } };

/** 규칙이 빈 공고 D: 미확인 조건 이름 없이 '아직 확인 중' */
export const EmptyRuleNotice: Story = {
  args: { summary: { ...openItemsSummary, openItems: [] } },
};

/** 공식 제출 URL이 없는 공고: 링크를 만들어 내지 않음 */
export const NoSubmissionUrl: Story = {
  args: { summary: { ...preparedSummary, officialSubmissionUrl: null } },
};
