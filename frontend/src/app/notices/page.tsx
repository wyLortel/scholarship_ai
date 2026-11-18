import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/features/navigation/ui/AppShell";
import { NoticeList } from "@/features/notices/ui/NoticeList";
import { getNotices } from "@/lib/api/server";

export const metadata: Metadata = { title: "공고 목록 | 장학금 통합 지원 AI" };

// 서버 컴포넌트: 요청마다 FastAPI에서 검증된 공고만 받아 표시한다 (#25, BR-A05).
export default async function NoticesPage() {
  const result = await getNotices();

  return (
    <AppShell current="notices">
      <main style={{ maxWidth: 760 }}>
        <h1>장학금 공고</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-small)" }}>
          검증된 공식 공고만 보여줍니다. 지원 가능 여부는 공고를 열어 내 정보로 확인하거나{" "}
          <Link href="/chat">AI 상담</Link>에서 확인하세요.
        </p>
        {result.ok ? (
          <NoticeList notices={result.data} />
        ) : (
          <p role="alert">공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        )}
      </main>
    </AppShell>
  );
}
