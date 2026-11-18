import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  args: { tone: "positive", children: "충족" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {};
export const Caution: Story = { args: { tone: "caution", children: "확인 필요" } };
export const Negative: Story = { args: { tone: "negative", children: "미충족" } };
export const Neutral: Story = { args: { tone: "neutral", children: "판정 보류" } };
export const Demo: Story = { args: { tone: "demo", children: "TEST_ONLY · 가상 공고" } };
export const Large: Story = { args: { tone: "positive", size: "lg", children: "조건상 가능" } };
