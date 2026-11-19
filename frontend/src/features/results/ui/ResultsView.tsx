"use client";

import { useActionState } from "react";

import { Badge, Button, Icon, InlineNotice, Panel, SelectField } from "@/shared/components";
import { choicesFor, FACT_INPUTS } from "@/features/assessment/model/facts";
import type { CompareState } from "@/features/results/server/actions";

import { ResultList } from "./ResultList";
import styles from "./results.module.css";

type Props = {
  /** 검증된 공고들이 묻는 학생 사실(공고 상세의 studentFactRef 합집합, 순서 유지) */
  fields: string[];
  noticeCount: number;
  action: (state: CompareState, formData: FormData) => Promise<CompareState>;
};

// 추천 결과(시안 06): 오른쪽에서 내 정보를 고르면 공고마다 판정 API 결과를 받아 보여 준다.
// 입력은 이 화면 상태에만 있다(저장·URL 없음). 판정은 계산하지 않는다.
export function ResultsView({ fields, noticeCount, action }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as CompareState);
  const inputs = fields.map((f) => FACT_INPUTS[f]).filter((i) => i !== undefined);
  const chosen = state.status === "idle" ? {} : state.answers;

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <Panel variant="tinted" className={styles.hero}>
          <div>
            <Badge tone="demo">시연용 가상 공고로 비교한 결과</Badge>
            <h1>내 정보로 비교한 장학금</h1>
            <p className={styles.muted}>
              공고마다 조건이 달라요. 더 물어볼 것이 있으면 AI 상담에서 이어서 확인해요.
            </p>
          </div>
          <Icon name="mascot-robot" size={96} />
        </Panel>

        {state.status === "done" && !pending ? (
          <ResultList entries={state.entries} />
        ) : (
          <p role="status" className={styles.muted}>
            {pending
              ? "공고마다 조건을 비교하고 있어요…"
              : `검증된 공고 ${noticeCount}건이 있어요. 오른쪽에서 내 정보를 고르고 비교해 보세요.`}
          </p>
        )}
        {state.status === "error" && <InlineNotice tone="danger">{state.message}</InlineNotice>}
      </div>

      <Panel as="aside" className={styles.side} aria-labelledby="my-facts">
        <h2 id="my-facts">지금 비교에 사용할 내 정보</h2>
        <form action={formAction} className={styles.form}>
          {inputs.map((input) => (
            <div key={input.field}>
              <input type="hidden" name="field" value={input.field} />
              <SelectField
                label={input.label}
                name={input.field}
                required
                options={choicesFor(input)}
                // 액션 뒤 폼이 비워지므로 방금 고른 값을 다시 채운다(저장 아님).
                key={`${input.field}-${chosen[input.field] ?? ""}`}
                defaultValue={chosen[input.field] ?? ""}
              />
            </div>
          ))}
          <Button type="submit" variant="primary" block loading={pending} loadingText="비교 중…">
            {state.status === "done" ? "이 정보로 다시 비교하기" : "공고와 비교하기"}
          </Button>
        </form>
        <p className={styles.muted}>
          이 화면에서만 쓰고 저장하지 않아요. 모르면 &lsquo;모름&rsquo;을 고르세요.
        </p>
        <InlineNotice>
          &lsquo;조건상 가능&rsquo;은 선발 확정이 아니에요. 근거와 모집 상태는 공식 공고에서 확인해
          주세요.
        </InlineNotice>
      </Panel>
    </div>
  );
}
