import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { noticeA, noticeB, noticeD } from "@/features/results/ui/storyData";

import { HomeView } from "./HomeView";

const meta = {
  title: "Home/HomeView",
  component: HomeView,
  parameters: { layout: "fullscreen" },
  args: { notices: [noticeA, noticeB, noticeD], noticesOk: true },
} satisfies Meta<typeof HomeView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 시안 01: 검증된 공고 카드에 판정 배지 없음 (판정 응답이 없으므로) */
export const Default: Story = {};

/** 검증된 공고가 없음 */
export const NoNotices: Story = { args: { notices: [] } };

/** 공고 API 실패 */
export const LoadError: Story = { args: { notices: [], noticesOk: false } };
