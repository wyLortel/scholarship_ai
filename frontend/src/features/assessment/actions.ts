"use server";

import { postAssessment } from "@/lib/api/server";
import type { AssessmentResult, StudentFact } from "@/lib/api/types";

import { FACT_INPUTS, toStudentFact } from "./facts";

export type AssessState =
  | { status: "idle" }
  | { status: "done"; result: AssessmentResult }
  | { status: "error"; message: string };

// 서버 액션: 입력값을 계약 형식으로 바꿔 FastAPI(Rule Engine)에 보낸다.
// 입력값(학년·소득 등)은 로그에 남기지 않는다(CLAUDE.md §2-9). 판정 계산은 하지 않는다.
export async function assessAction(_prev: AssessState, formData: FormData): Promise<AssessState> {
  const noticeVersionId = String(formData.get("noticeVersionId") ?? "");
  const fields = formData.getAll("field").map(String);
  const inputs = fields.map((f) => FACT_INPUTS[f]).filter((i) => i !== undefined);
  const facts = inputs.map((input) => toStudentFact(input, formData.get(input.field)));

  if (!noticeVersionId || facts.some((f) => f === null)) {
    return { status: "error", message: "모든 항목을 선택해 주세요. 모르면 '모름'을 고르세요." };
  }

  const response = await postAssessment({
    noticeVersionId,
    facts: facts.filter((f): f is StudentFact => f !== null),
  });
  if (!response.ok) {
    return { status: "error", message: "조건을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  return { status: "done", result: response.data };
}
