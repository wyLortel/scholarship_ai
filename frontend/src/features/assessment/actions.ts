"use server";

import { postAssessment } from "@/lib/api/server";
import type { AssessmentResult, StudentFact } from "@/lib/api/types";

export type AssessState =
  | { status: "idle" }
  | { status: "done"; result: AssessmentResult }
  | { status: "error"; message: string };

// 서버 액션: 입력값을 계약 형식으로 바꿔 FastAPI(Rule Engine)에 보낸다.
// 학년·소득은 로그에 남기지 않는다(CLAUDE.md §2-9). 판정 계산은 하지 않는다.
export async function assessAction(_prev: AssessState, formData: FormData): Promise<AssessState> {
  const noticeVersionId = String(formData.get("noticeVersionId") ?? "");
  const facts: (StudentFact | null)[] = [
    numberFact("yearInSchool", formData.get("yearInSchool"), "학년"),
    numberFact("incomeBracket", formData.get("incomeBracket"), "구간"),
  ];
  if (!noticeVersionId || facts.some((f) => f === null)) {
    return {
      status: "error",
      message: "학년과 소득구간을 선택해 주세요. 모르면 '모름'을 고르세요.",
    };
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

// 선택 안 함 → null(폼 오류), "unknown" → 모름(isKnown=false, value=null), 정수 → 값.
function numberFact(
  field: string,
  raw: FormDataEntryValue | null,
  unit: string,
): StudentFact | null {
  const base = { field, unit, effectiveAt: null, source: "STUDENT_PROVIDED" as const };
  if (raw === "unknown") return { ...base, isKnown: false, value: null };
  const value = raw === null || raw === "" ? NaN : Number(raw);
  if (!Number.isInteger(value)) return null;
  return { ...base, isKnown: true, value };
}
