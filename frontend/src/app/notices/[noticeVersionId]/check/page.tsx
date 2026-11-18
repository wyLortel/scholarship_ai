import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentForm } from "@/features/assessment/ui/AssessmentForm";
import { AppShell } from "@/features/navigation/ui/AppShell";
import { getNotice, getNotices } from "@/lib/api/server";
import { Badge } from "@/shared/components";

import { assessAction } from "@/features/assessment/server/actions";

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
  // 무엇을 물을지는 공고 상세의 조건(studentFactRef)이 정한다. 같은 버전일 때만 쓴다.
  const detail = await getNotice(notice.noticeId);
  if (!detail.ok || detail.data.notice.noticeVersionId !== noticeVersionId) notFound();
  const fields = [
    ...new Set(detail.data.conditions.map((c) => c.studentFactRef).filter((f): f is string => !!f)),
  ];

  return (
    <AppShell current="notices">
      <main style={{ maxWidth: 760 }}>
        <p>
          <Link href="/notices">← 공고 목록</Link>
        </p>
        {notice.isTestOnly && (
          <p>
            <Badge tone="demo">TEST_ONLY · 가상 공고</Badge>
          </p>
        )}
        <h1>{notice.title}</h1>
        <p>
          아래 정보를 선택하면 이 공고의 조건과 비교해 결과를 보여드립니다. 모르는 항목은
          &lsquo;모름&rsquo;을 고르세요.
        </p>
        <AssessmentForm noticeVersionId={noticeVersionId} fields={fields} action={assessAction} />
      </main>
    </AppShell>
  );
}
