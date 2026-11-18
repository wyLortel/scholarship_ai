import type { Metadata } from "next";

import { ChatSession } from "@/features/chat/ui/ChatSession";
import { AppShell } from "@/features/navigation/ui/AppShell";
import type { ChatNotice, ChatQuestion } from "@/features/chat/model/types";
import { getNotice, getNotices } from "@/lib/api/server";
import type { NoticeDetail } from "@/lib/api/types";

// AI 상담(채팅) 데모: 정해진 질문, LLM 미연결(OPEN-19), 로그인·저장 없음(OPEN-18). (#93)
export const metadata: Metadata = {
  title: "AI 상담 | 장학금 통합 지원 AI",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const list = await getNotices();
  const notices: ChatNotice[] = [];
  if (list.ok) {
    // 목록 API는 VERIFIED만 준다. 상세가 같은 버전일 때만 채팅 후보로 쓴다.
    for (const summary of list.data) {
      const detail = await getNotice(summary.noticeId);
      if (detail.ok && detail.data.notice.noticeVersionId === summary.noticeVersionId) {
        notices.push(toChatNotice(detail.data));
      }
    }
  }
  return (
    <AppShell current="chat">
      <ChatSession notices={notices} />
    </AppShell>
  );
}

function toChatNotice(detail: NoticeDetail): ChatNotice {
  const questions = new Map<string, ChatQuestion>();
  for (const c of detail.conditions) {
    if (!c.studentFactRef) continue;
    const q = questions.get(c.studentFactRef);
    if (q) q.conditionLabels.push(c.label);
    else
      questions.set(c.studentFactRef, {
        field: c.studentFactRef,
        conditionLabels: [c.label],
        quote: c.evidence.quote,
        location: c.evidence.location,
      });
  }
  return {
    noticeId: detail.notice.noticeId,
    noticeVersionId: detail.notice.noticeVersionId,
    title: detail.notice.title,
    isTestOnly: detail.notice.isTestOnly,
    questions: [...questions.values()],
  };
}
