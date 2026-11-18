import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SelectField } from "./SelectField";

const meta = {
  title: "Shared Components/SelectField",
  component: SelectField,
  args: {
    label: "학년",
    name: "yearInSchool",
    options: [
      { value: "1", label: "1학년" },
      { value: "2", label: "2학년" },
      { value: "3", label: "3학년" },
      { value: "UNKNOWN", label: "모름" },
    ],
  },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "공고 기준 학기의 학년을 골라 주세요." } };
export const WithError: Story = { args: { error: "학년을 골라 주세요." } };
export const Disabled: Story = { args: { disabled: true } };
