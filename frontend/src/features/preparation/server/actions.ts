"use server";

import { postPreparationSummary } from "@/lib/api/server";
import type { PreparationSummary } from "@/lib/api/types";

import { answersToFacts } from "@/features/assessment/model/facts";

export type PrepareState =
  { status: "done"; summary: PreparationSummary } | { status: "error"; message: string };

// 서버 액션: 같은 답변으로 FastAPI에 준비 요약(체크리스트·공식 제출 안내)을 요청한다.
// 판정·준비 상태는 서버가 정한다. 입력값은 로그에 남기지 않는다 (CLAUDE.md §2-9).
// 학생 증빙 파일은 받지 않는다 (BR-C08).
export async function prepareAnswers(
  noticeVersionId: string,
  answers: { field: string; raw: string }[],
): Promise<PrepareState> {
  const facts = answersToFacts(answers);
  if (!noticeVersionId || facts === null) {
    return { status: "error", message: "답하지 않은 질문이 있어요. 다시 답해 주세요." };
  }
  const response = await postPreparationSummary({ noticeVersionId, facts });
  if (!response.ok) {
    return {
      status: "error",
      message: "준비 자료를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }
  return { status: "done", summary: response.data };
}
