"use client";

import { useActionState } from "react";

import type { AssessState } from "./actions";

import styles from "./assessment.module.css";
import { AssessmentResultView } from "./AssessmentResultView";
import { FACT_INPUTS, UNKNOWN } from "./facts";

type Props = {
  noticeVersionId: string;
  /** 이 공고가 묻는 학생 사실(공고 상세의 studentFactRef, 순서 유지·중복 제거) */
  fields: string[];
  action: (state: AssessState, formData: FormData) => Promise<AssessState>;
};

// 입력만 모아 서버로 보낸다. 자격 계산은 하지 않는다 (UX 계약 "UX에서 계산해서는 안 되는 것").
export function AssessmentForm({ noticeVersionId, fields, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as AssessState);
  const unsupported = fields.filter((f) => !FACT_INPUTS[f]);

  return (
    <div>
      <form action={formAction} className={styles.form}>
        <input type="hidden" name="noticeVersionId" value={noticeVersionId} />
        {fields
          .map((f) => FACT_INPUTS[f])
          .filter((input) => input !== undefined)
          .map((input) => (
            <label key={input.field} className={styles.field}>
              {input.label}
              <input type="hidden" name="field" value={input.field} />
              <select name={input.field} required defaultValue="">
                <option value="" disabled>
                  선택
                </option>
                {input.kind === "integer" ? (
                  input.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                      {input.unit}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="true">{input.yes}</option>
                    <option value="false">{input.no}</option>
                  </>
                )}
                <option value={UNKNOWN}>모름</option>
              </select>
            </label>
          ))}
        {unsupported.length > 0 && (
          <p className={styles.meta}>
            일부 조건은 아직 이 화면에서 입력할 수 없어 &lsquo;확인 필요&rsquo;로 남습니다.
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "확인 중…" : "조건 확인하기"}
        </button>
      </form>
      {state.status === "error" && <p role="alert">{state.message}</p>}
      {state.status === "done" && !pending && <AssessmentResultView result={state.result} />}
    </div>
  );
}
