import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { InlineNotice } from "./InlineNotice";

const meta = {
  title: "Shared Components/InlineNotice",
  component: InlineNotice,
  args: { children: "신청서 제출과 증빙 발급은 공식 기관에서 직접 진행해 주세요." },
} satisfies Meta<typeof InlineNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Caution: Story = {
  args: { tone: "caution", children: "현재 공식 공고의 최신 상태를 확인하지 못했습니다." },
};
export const Danger: Story = { args: { tone: "danger", children: "판정 요청에 실패했어요." } };
export const Success: Story = {
  args: { tone: "success", children: "신청에 필요한 자료를 정리했습니다." },
};
