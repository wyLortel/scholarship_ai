import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Chip, ChipGroup } from "./Chip";

const meta = {
  title: "Shared Components/Chip",
  component: Chip,
  args: { children: "3학년" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Group: Story = {
  render: () => (
    <ChipGroup>
      <Chip>1학년</Chip>
      <Chip>2학년</Chip>
      <Chip selected>3학년</Chip>
      <Chip>모름</Chip>
    </ChipGroup>
  ),
};
