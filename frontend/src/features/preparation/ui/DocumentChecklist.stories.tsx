import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DocumentChecklist } from "./DocumentChecklist";
import { enrollment, family } from "./storyData";

const meta = {
  title: "Preparation/DocumentChecklist",
  component: DocumentChecklist,
  args: { items: [enrollment, family] },
} satisfies Meta<typeof DocumentChecklist>;

export default meta;
type Story = StoryObj<typeof meta>;

/** AC-C05: 서류명·원문 근거·발급 안내, 업로드 없음. 발급처 없는 서류는 '발급처 확인 필요' */
export const NoticeA: Story = {};

/** 서류 요구가 확인되지 않은 공고 */
export const Empty: Story = { args: { items: [] } };
