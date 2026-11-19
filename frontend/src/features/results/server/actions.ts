"use server";

import { getNotices, postAssessment } from "@/lib/api/server";
import type { AssessmentResult, NoticeSummary } from "@/lib/api/types";

import { answersToFacts } from "@/features/assessment/model/facts";

/** 공고 하나의 비교 결과. 판정 실패를 숨기지 않고 따로 보여 준다. */
export type ResultEntry =
  | { notice: NoticeSummary; status: "done"; result: AssessmentResult }
  | { notice: NoticeSummary; status: "error"; message: string };

export type CompareState =
  | { status: "idle" }
  | { status: "done"; entries: ResultEntry[]; answers: Answers }
  | { status: "error"; message: string; answers: Answers };

/** 학생이 고른 값(필드 → 선택값). 폼에 다시 채우는 데만 쓰고 저장하지 않는다. */
export type Answers = Record<string, string>;

// 서버 액션: 같은 사실로 검증된 공고(목록 API = VERIFIED만, BR-A05)를 공고마다 판정 API에 보낸다.
// 판정·그룹은 서버(Rule Engine) 응답 그대로. 일괄 평가·그룹 집계 API는 #36.
// 입력값은 로그·URL·저장소에 남기지 않는다 (CLAUDE.md §2-9).
export async function compareAction(
  _prev: CompareState,
  formData: FormData,
): Promise<CompareState> {
  const answers = formData
    .getAll("field")
    .map(String)
    .map((field) => ({ field, raw: formData.get(field) }));
  const chosen: Answers = Object.fromEntries(answers.map((a) => [a.field, String(a.raw ?? "")]));
  const facts = answersToFacts(answers);
  if (facts === null) {
    return {
      status: "error",
      message: "모든 항목을 선택해 주세요. 모르면 '모름'을 고르세요.",
      answers: chosen,
    };
  }

  const list = await getNotices();
  if (!list.ok) {
    return {
      status: "error",
      message: "공고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
      answers: chosen,
    };
  }

  const entries = await Promise.all(
    list.data.map(async (notice): Promise<ResultEntry> => {
      const response = await postAssessment({ noticeVersionId: notice.noticeVersionId, facts });
      return response.ok
        ? { notice, status: "done", result: response.data }
        : { notice, status: "error", message: "이 공고는 지금 조건을 확인하지 못했어요." };
    }),
  );
  return { status: "done", entries, answers: chosen };
}
