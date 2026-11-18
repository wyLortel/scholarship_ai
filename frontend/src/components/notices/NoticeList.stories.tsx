import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { NoticeSummary } from "@/lib/api/types";

import { NoticeList } from "./NoticeList";

// TEST_ONLY 가상 공고(#24 fixture와 같은 값). 실제 장학금 공고가 아니다.
const base: NoticeSummary = {
  noticeId: "fixture-notice-a",
  noticeVersionId: "fixture-notice-a-v1",
  title: "[TEST_ONLY] 가상 재단 학업장려 장학금",
  institution: "[TEST_ONLY] 가상 장학재단",
  isTestOnly: true,
  officialUrl: "https://example.org/test-only/fixture-notice-a",
  sourceVerificationStatus: "VERIFIED",
  freshnessStatus: "CHECKED_UNCHANGED",
  lastCheckedAt: "2026-11-18T09:00:00+09:00",
  recruitmentStartAt: "2026-12-01T00:00:00+09:00",
  recruitmentEndAt: "2026-12-31T18:00:00+09:00",
};

const verifiedNotices: NoticeSummary[] = [
  base,
  {
    ...base,
    noticeId: "fixture-notice-b",
    noticeVersionId: "fixture-notice-b-v1",
    title: "[TEST_ONLY] 가상 지역인재 장학금 (대안 자격)",
    institution: "[TEST_ONLY] 가상 지역재단",
    officialUrl: "https://example.org/test-only/fixture-notice-b",
  },
  {
    ...base,
    noticeId: "fixture-notice-d",
    noticeVersionId: "fixture-notice-d-v1",
    title: "[TEST_ONLY] 가상 특별 장학금 (규칙 없음)",
    institution: "[TEST_ONLY] 가상 복지재단",
    officialUrl: "https://example.org/test-only/fixture-notice-d",
  },
];

const meta = {
  title: "Notices/NoticeList",
  component: NoticeList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof NoticeList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** AC #25-1·2: 서버가 준 VERIFIED 공고 A·B·D. 모두 TEST_ONLY 배지. */
export const VerifiedTestOnly: Story = { args: { notices: verifiedNotices } };

/** 빈 목록 문구 */
export const Empty: Story = { args: { notices: [] } };

/** 값이 비어 있을 때: 추측해서 채우지 않고 "확인 필요"로 표시 */
export const MissingFields: Story = {
  args: {
    notices: [
      {
        ...base,
        officialUrl: null,
        lastCheckedAt: null,
        recruitmentStartAt: null,
        recruitmentEndAt: null,
      },
    ],
  },
};

/** 실제(검증된) 공고라면 TEST_ONLY 배지가 없다 — 배지가 데이터에 따라 바뀌는지 확인 */
export const NotTestOnly: Story = {
  args: {
    notices: [
      {
        ...base,
        isTestOnly: false,
        title: "검증된 공고 예시 (배지 없음 확인용)",
        institution: "예시 기관",
      },
    ],
  },
};
