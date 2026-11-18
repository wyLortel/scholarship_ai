import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Panel } from "./Panel";

const meta = {
  title: "Design System/Panel",
  component: Panel,
  args: { children: <p style={{ margin: 0 }}>정보를 묶는 기본 카드예요.</p> },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Soft: Story = { args: { variant: "soft" } };
export const Tinted: Story = { args: { variant: "tinted" } };
export const Compact: Story = { args: { compact: true } };
