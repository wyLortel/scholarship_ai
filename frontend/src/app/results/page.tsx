import type { Metadata } from "next";

import { AppShell } from "@/features/navigation/ui/AppShell";
import { compareAction } from "@/features/results/server/actions";
import { ResultsView } from "@/features/results/ui/ResultsView";
import { getNotice, getNotices } from "@/lib/api/server";

// 추천 결과(시안 06, #94): 개인 입력·판정 화면이라 검색 비노출, 캐시 없음 (ADR-0013).
export const metadata: Metadata = {
  title: "장학금 추천 결과 | 장학금 통합 지원 AI",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const list = await getNotices();
  const notices = list.ok ? list.data : [];
  // 무엇을 물을지는 검증된 공고 상세의 조건(studentFactRef)이 정한다. 같은 버전일 때만 쓴다.
  const fields: string[] = [];
  for (const notice of notices) {
    const detail = await getNotice(notice.noticeId);
    if (!detail.ok || detail.data.notice.noticeVersionId !== notice.noticeVersionId) continue;
    for (const c of detail.data.conditions) {
      if (c.studentFactRef && !fields.includes(c.studentFactRef)) fields.push(c.studentFactRef);
    }
  }

  return (
    <AppShell current="results">
      {list.ok ? (
        <ResultsView fields={fields} noticeCount={notices.length} action={compareAction} />
      ) : (
        <p role="alert">공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      )}
    </AppShell>
  );
}
