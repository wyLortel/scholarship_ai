import { Badge, Button, Chip, ChipGroup, Icon, Panel } from "@/shared/components";
import { AssessmentResultView } from "@/features/assessment/ui/AssessmentResultView";
import { groupLabel, groupTone } from "@/features/assessment/ui/copy";

import styles from "./chat.module.css";
import { CHECKING_TEXT, resultText } from "./script";
import type {
  ChatChoice,
  ChatMessage,
  ChatNotice,
  ChatPhase,
  UsedFact,
} from "@/features/chat/model/types";

type Props = {
  notices: ChatNotice[];
  selected: ChatNotice | null;
  messages: ChatMessage[];
  phase: ChatPhase;
  usedFacts: UsedFact[];
  onSelectNotice?: (notice: ChatNotice) => void;
  onAnswer?: (choice: ChatChoice) => void;
  onRestart?: () => void;
  onChooseAnother?: () => void;
};

// 표시 전용: 대화와 패널을 그린다. 판정은 phase.result(API 응답)만 보여 준다 (AC-B06).
export function ChatView(props: Props) {
  const { notices, selected, messages, phase, usedFacts } = props;
  return (
    <div className={styles.layout}>
      <Panel className={styles.chat} aria-label="AI 상담">
        <header className={styles.chatHeader}>
          <Icon name="mascot-robot" size={56} />
          <div>
            <Badge tone="demo">시연용 · 정해진 질문 (AI 문장 생성 미연결)</Badge>
            <h1>{selected ? `${selected.title} · AI 상담` : "AI에게 장학금에 관해 물어보세요"}</h1>
          </div>
        </header>

        <ol className={styles.messages}>
          {messages.map((m) => (
            <li key={m.id} className={m.from === "bot" ? styles.bot : styles.user}>
              <p>{m.text}</p>
              {m.from === "bot" && m.context && (
                <p className={styles.why}>
                  왜 묻나요? 원문: <q>{m.context.quote}</q> ({m.context.location})
                </p>
              )}
            </li>
          ))}
          {phase.kind === "checking" && (
            <li className={styles.bot} role="status">
              <p>{CHECKING_TEXT}</p>
            </li>
          )}
          {phase.kind === "done" && (
            <li className={styles.bot}>
              <p className={styles.resultBadge}>
                <Badge tone={groupTone[phase.result.eligibilityResult]} size="lg">
                  {groupLabel[phase.result.eligibilityResult]}
                </Badge>
              </p>
              <p>{resultText(phase.result)}</p>
              <p className={styles.why}>조건별 결과와 원문 근거는 오른쪽 패널에서 볼 수 있어요.</p>
            </li>
          )}
          {phase.kind === "error" && (
            <li className={styles.bot} role="alert">
              <p>{phase.message}</p>
            </li>
          )}
        </ol>

        <ChipGroup className={styles.choices}>
          {phase.kind === "choosing" &&
            notices.map((n) => (
              <Chip key={n.noticeId} onClick={() => props.onSelectNotice?.(n)}>
                {n.title}
              </Chip>
            ))}
          {phase.kind === "asking" &&
            phase.choices.map((c) => (
              <Chip key={c.value} onClick={() => props.onAnswer?.(c)}>
                {c.label}
              </Chip>
            ))}
          {(phase.kind === "done" || phase.kind === "error") && (
            <>
              <Button onClick={props.onRestart}>다시 답하기</Button>
              <Button onClick={props.onChooseAnother}>다른 장학금 확인하기</Button>
            </>
          )}
        </ChipGroup>

        <form className={styles.input} aria-label="자유 입력 (준비 중)">
          <input
            className="ui-input"
            disabled
            placeholder="시연에서는 위 선택지로 답해 주세요. 자유 입력은 준비 중이에요."
          />
          <Button variant="primary" disabled aria-label="보내기 (준비 중)">
            ➤
          </Button>
        </form>
      </Panel>

      <Panel as="aside" className={styles.panel} aria-label="현재 장학금 요약">
        <h2>AI가 활용하는 내 정보</h2>
        {usedFacts.length === 0 ? (
          <p className={styles.muted}>아직 입력한 정보가 없어요.</p>
        ) : (
          <dl className={styles.facts}>
            {usedFacts.map((f) => (
              <div key={f.field}>
                <dt>{f.name}</dt>
                <dd>{f.answer}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className={styles.muted}>이 대화에서만 쓰고 저장하지 않아요.</p>

        {phase.kind === "done" && (
          <>
            <h2>조건별 비교</h2>
            <AssessmentResultView result={phase.result} />
          </>
        )}
      </Panel>
    </div>
  );
}
