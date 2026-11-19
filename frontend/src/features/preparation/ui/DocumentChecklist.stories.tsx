import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ChecklistItem } from "@/lib/api/types";

import { DocumentChecklist } from "./DocumentChecklist";

// TEST_ONLY 공고 A의 서류 (examples/api/preparation-summary.prepared.json과 같은 값). 실제 공고가 아니다.
const evidence = (id: string, location: string, quote: string) => ({
  evidenceId: id,
  noticeVersionId: "fixture-notice-a-v1",
  fileId: "fixture-file-a",
  location,
  quote,
  officialUrl: "https://example.org/test-only/fixture-notice-a",
  checkedAt: "2026-11-18T09:00:00+09:00",
  verifiedAt: "2026-11-18T09:00:00+09:00",
});

const enrollment: ChecklistItem = {
  itemId: "doc-enrollment",
  documentName: "재학증명서",
  reason: "지원 자격(재학생) 확인용으로 제출 서류에 명시됨",
  isConditional: false,
  appliesWhen: null,
  issuer: "재학 중인 대학교",
  issuanceGuideUrl: "https://example.org/test-only/issuance/enrollment",
  evidence: evidence("ev-a-doc-enrollment", "본문 4. 제출 서류 (1)", "재학증명서 1부"),
};

const family: ChecklistItem = {
  itemId: "doc-family",
  documentName: "가족관계증명서",
  reason: "소득구간 확인이 필요한 경우 제출하도록 명시됨",
  isConditional: true,
  appliesWhen: "소득구간 확인 서류를 요청받은 경우",
  issuer: null,
  issuanceGuideUrl: null,
  evidence: evidence(
    "ev-a-doc-family",
    "본문 4. 제출 서류 (2)",
    "해당자에 한하여 가족관계증명서 1부",
  ),
};

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
