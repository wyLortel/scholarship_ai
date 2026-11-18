import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";

const meta = {
  title: "Design System/Button",
  component: Button,
  args: { children: "조건 확인하기" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary", children: "다시 답하기" } };
export const Quiet: Story = { args: { variant: "quiet", children: "원문 보기" } };
export const Loading: Story = {
  args: { variant: "primary", loading: true, loadingText: "확인 중…" },
};
export const Disabled: Story = { args: { variant: "primary", disabled: true } };
export const Block: Story = { args: { variant: "primary", block: true } };
