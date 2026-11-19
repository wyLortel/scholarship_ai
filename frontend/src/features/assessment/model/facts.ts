import type { StudentFact } from "@/lib/api/types";

// 입력 화면이 물을 수 있는 학생 사실 목록(표시·입력 형식만). 판정 규칙은 여기 없다.
// 어떤 사실을 물을지는 공고 상세의 conditions[].studentFactRef가 정한다.
export type FactInput =
  | { field: string; label: string; kind: "integer"; unit: string; options: number[] }
  | { field: string; label: string; kind: "boolean"; yes: string; no: string };

export const FACT_INPUTS: Record<string, FactInput> = {
  yearInSchool: {
    field: "yearInSchool",
    label: "학년",
    kind: "integer",
    unit: "학년",
    options: [1, 2, 3, 4, 5, 6],
  },
  incomeBracket: {
    field: "incomeBracket",
    label: "학자금 지원구간(소득구간)",
    kind: "integer",
    unit: "구간",
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  isEnrolled: {
    field: "isEnrolled",
    label: "지금 재학 중인가요?",
    kind: "boolean",
    yes: "재학 중",
    no: "재학 중 아님",
  },
  isMultiChildHousehold: {
    field: "isMultiChildHousehold",
    label: "다자녀 가구인가요?",
    kind: "boolean",
    yes: "예",
    no: "아니오",
  },
};

// 결과 문구에 쓰는 짧은 이름
const FACT_NAMES: Record<string, string> = {
  yearInSchool: "학년",
  incomeBracket: "소득구간",
  isEnrolled: "재학 여부",
  isMultiChildHousehold: "다자녀 가구 여부",
};

export function factName(field: string | null | undefined): string {
  return (field && FACT_NAMES[field]) ?? field ?? "정보";
}

// "모름"은 값 없음(null)으로 보낸다. 0·빈 문자열·false로 바꾸지 않는다 (BR-B01).
export const UNKNOWN = "unknown";

/** 폼 값 하나를 계약 StudentFact로. 선택 안 함이면 null(폼 오류). */
export function toStudentFact(
  input: FactInput,
  raw: FormDataEntryValue | null,
): StudentFact | null {
  const base = { field: input.field, effectiveAt: null, source: "STUDENT_PROVIDED" as const };
  const unit = input.kind === "integer" ? input.unit : null;
  if (raw === UNKNOWN) return { ...base, unit, isKnown: false, value: null };
  if (input.kind === "boolean") {
    if (raw !== "true" && raw !== "false") return null;
    return { ...base, unit, isKnown: true, value: raw === "true" };
  }
  const value = raw === null || raw === "" ? NaN : Number(raw);
  if (!Number.isInteger(value) || !input.options.includes(value)) return null;
  return { ...base, unit, isKnown: true, value };
}

/** 채팅·폼 답변 목록을 계약 StudentFact 목록으로. 하나라도 선택 안 했으면 null. */
export function answersToFacts(
  answers: { field: string; raw: FormDataEntryValue | null }[],
): StudentFact[] | null {
  const facts = answers
    .filter((a) => FACT_INPUTS[a.field] !== undefined)
    .map((a) => toStudentFact(FACT_INPUTS[a.field], a.raw));
  return facts.every((f): f is StudentFact => f !== null) ? facts : null;
}

/** 선택지 목록(값, 표시 문구). 마지막은 항상 모름. */
export function choicesFor(input: FactInput): { value: string; label: string }[] {
  const known =
    input.kind === "integer"
      ? input.options.map((o) => ({ value: String(o), label: `${o}${input.unit}` }))
      : [
          { value: "true", label: input.yes },
          { value: "false", label: input.no },
        ];
  return [...known, { value: UNKNOWN, label: "모름" }];
}

export function answerLabel(input: FactInput, raw: string): string {
  return choicesFor(input).find((c) => c.value === raw)?.label ?? raw;
}
