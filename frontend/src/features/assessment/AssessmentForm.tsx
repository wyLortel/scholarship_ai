"use client";

import { useActionState } from "react";

import type { AssessState } from "./actions";

import styles from "./assessment.module.css";
import { AssessmentResultView } from "./AssessmentResultView";

// "모름"은 값 없음(null)으로 보낸다. 0·빈 문자열·false로 바꾸지 않는다 (BR-B01).
const UNKNOWN = "unknown";
const YEARS = [1, 2, 3, 4, 5, 6];
const INCOME_BRACKETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Props = {
  noticeVersionId: string;
  action: (state: AssessState, formData: FormData) => Promise<AssessState>;
};

// 입력만 모아 서버로 보낸다. 자격 계산은 하지 않는다 (UX 계약 "UX에서 계산해서는 안 되는 것").
export function AssessmentForm({ noticeVersionId, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as AssessState);

  return (
    <div>
      <form action={formAction} className={styles.form}>
        <input type="hidden" name="noticeVersionId" value={noticeVersionId} />
        <label className={styles.field}>
          학년
          <select name="yearInSchool" required defaultValue="">
            <option value="" disabled>
              선택
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}학년
              </option>
            ))}
            <option value={UNKNOWN}>모름</option>
          </select>
        </label>
        <label className={styles.field}>
          학자금 지원구간(소득구간)
          <select name="incomeBracket" required defaultValue="">
            <option value="" disabled>
              선택
            </option>
            {INCOME_BRACKETS.map((b) => (
              <option key={b} value={b}>
                {b}구간
              </option>
            ))}
            <option value={UNKNOWN}>모름</option>
          </select>
        </label>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "확인 중…" : "조건 확인하기"}
        </button>
      </form>
      {state.status === "error" && <p role="alert">{state.message}</p>}
      {state.status === "done" && !pending && <AssessmentResultView result={state.result} />}
    </div>
  );
}
