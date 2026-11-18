import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { getNotices } from "@/lib/api/server";

import { assessAction } from "./actions";

// 개인 입력·판정 화면: 검색 비노출, 캐시 없음 (ADR-0013).
export const metadata: Metadata = {
  title: "내 정보로 조건 확인 | 장학금 통합 지원 AI",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function CheckPage({
  params,
}: {
  params: Promise<{ noticeVersionId: string }>;
}) {
  const { noticeVersionId } = await params;
  const notices = await getNotices();
  const notice = notices.ok
    ? notices.data.find((n) => n.noticeVersionId === noticeVersionId)
    : null;
  if (!notice) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <p>
        <Link href="/notices">← 공고 목록</Link>
      </p>
      {notice.isTestOnly && <p>TEST_ONLY · 가상 공고</p>}
      <h1>{notice.title}</h1>
      <p>학년과 소득구간을 선택하면 이 공고의 조건과 비교해 결과를 보여드립니다.</p>
      <AssessmentForm noticeVersionId={noticeVersionId} action={assessAction} />
    </main>
  );
}
