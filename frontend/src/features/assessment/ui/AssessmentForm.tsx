"use client";

import { useActionState } from "react";

import { Button, InlineNotice, SelectField } from "@/design-system";
import type { AssessState } from "@/features/assessment/server/actions";

import styles from "./assessment.module.css";
import { AssessmentResultView } from "./AssessmentResultView";
import { choicesFor, FACT_INPUTS } from "@/features/assessment/model/facts";

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
            <div key={input.field}>
              <input type="hidden" name="field" value={input.field} />
              <SelectField
                label={input.label}
                name={input.field}
                required
                options={choicesFor(input)}
              />
            </div>
          ))}
        {unsupported.length > 0 && (
          <p className={styles.meta}>
            일부 조건은 아직 이 화면에서 입력할 수 없어 &lsquo;확인 필요&rsquo;로 남습니다.
          </p>
        )}
        <Button type="submit" variant="primary" block loading={pending} loadingText="확인 중…">
          조건 확인하기
        </Button>
      </form>
      {state.status === "error" && <InlineNotice tone="danger">{state.message}</InlineNotice>}
      {state.status === "done" && !pending && <AssessmentResultView result={state.result} />}
    </div>
  );
}
