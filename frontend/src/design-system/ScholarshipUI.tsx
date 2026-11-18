/**
 * Scholarship AI primitive components (starter, not a complete product).
 * Requires React; import ./design-tokens.css and ./components.css
 * once at the application's CSS entry point. Backend/data rules belong elsewhere.
 */
import * as React from "react";

export type EligibilityState = "possible" | "needs-info" | "ineligible" | "pending" | "changed";

export type FactProvenance = "profile" | "student-confirmed" | "source-extracted" | "unverified";

const statusText: Record<EligibilityState, string> = {
  possible: "조건상 가능",
  "needs-info": "확인 필요",
  ineligible: "현재 정보 기준 불가",
  pending: "판정 보류",
  changed: "재판정 필요",
};

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}

export function StatusBadge({ status, label }: { status: EligibilityState; label?: string }) {
  return <span className={`ui-badge ui-badge--${status}`}>{label ?? statusText[status]}</span>;
}

export function DemoBadge() {
  return <span className="ui-badge ui-badge--demo">시연용 가상 데이터</span>;
}

export interface UIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "quiet";
  loading?: boolean;
}

export function UIButton({
  variant = "secondary",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: UIButtonProps) {
  return (
    <button
      type="button"
      className={classNames("ui-button", `ui-button--${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? "처리 중…" : children}
    </button>
  );
}

export function Panel({
  as: Element = "section",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"section"> & { as?: "section" | "article" }) {
  return (
    <Element className={classNames("ui-panel", className)} {...props}>
      {children}
    </Element>
  );
}

export interface ScholarshipSummary {
  id: string;
  title: string;
  organization: string;
  conditionSummary: string;
  sourceVersion: string;
  state: EligibilityState;
  recruitmentStatus: string;
  isDemo: boolean;
}

export function ScholarshipCard({
  data,
  onViewEvidence,
  onAskAI,
}: {
  data: ScholarshipSummary;
  onViewEvidence?: (id: string) => void;
  onAskAI?: (id: string) => void;
}) {
  return (
    <Panel as="article" className="ui-scholarship" aria-label={data.title}>
      <div className="ui-scholarship__top">
        <div>
          <h3 className="ui-h3">{data.title}</h3>
          <div className="ui-muted ui-small">
            {data.organization} · {data.sourceVersion}
          </div>
        </div>
        <StatusBadge status={data.state} />
      </div>
      {data.isDemo && (
        <div>
          <DemoBadge />
        </div>
      )}
      <div className="ui-scholarship__details">
        <div>주요 조건: {data.conditionSummary}</div>
        <div>모집: {data.recruitmentStatus}</div>
      </div>
      <div className="ui-row">
        {onViewEvidence && (
          <UIButton onClick={() => onViewEvidence(data.id)}>자격 근거 보기</UIButton>
        )}
        {onAskAI && (
          <UIButton variant="primary" onClick={() => onAskAI(data.id)}>
            AI에게 추가로 물어보기
          </UIButton>
        )}
      </div>
    </Panel>
  );
}

export interface ConditionComparison {
  id: string;
  sourceCondition: string;
  userFact?: string;
  userFactProvenance?: FactProvenance;
  state: EligibilityState;
}

const provenanceText: Record<FactProvenance, string> = {
  profile: "저장된 프로필",
  "student-confirmed": "학생이 직접 답한 정보",
  "source-extracted": "AI 추출 결과 · 검증 필요",
  unverified: "출처 미확인",
};

export function ConditionList({ items }: { items: ConditionComparison[] }) {
  return (
    <div aria-label="조건별 비교">
      {items.map((item) => (
        <div key={item.id} className="ui-condition">
          <div>
            <div>
              <strong>{item.sourceCondition}</strong>
            </div>
            <p className="ui-condition__source">
              내 정보: {item.userFact ?? "모름 · 확인하지 못함"}
              {item.userFactProvenance ? ` (${provenanceText[item.userFactProvenance]})` : ""}
            </p>
          </div>
          <StatusBadge status={item.state} />
        </div>
      ))}
    </div>
  );
}

export function SourceEvidenceCard({
  clause,
  quote,
  sourceTitle,
  version,
  officialUrl,
  isDemo,
}: {
  clause: string;
  quote: string;
  sourceTitle: string;
  version: string;
  officialUrl?: string;
  isDemo: boolean;
}) {
  return (
    <section className="ui-evidence" aria-label="공고 원문 근거">
      <div className="ui-row ui-row--spread">
        <strong>📚 원문 근거 · {clause}</strong>
        {isDemo && <DemoBadge />}
      </div>
      <blockquote className="ui-evidence__quote">{quote}</blockquote>
      <div className="ui-muted ui-small">
        {sourceTitle} · {version}
      </div>
      {officialUrl ? (
        <a href={officialUrl} target="_blank" rel="noopener noreferrer">
          공식 원문 열기 (새 탭)
        </a>
      ) : (
        <div className="ui-muted ui-small">공식 URL 미등록 · 실제 공고 확인 필요</div>
      )}
    </section>
  );
}

export interface Choice {
  id: string;
  label: string;
  value: string;
}

export function MissingInfoQuestion({
  question,
  why,
  choices,
  onAnswer,
  onUnknown,
  onLater,
}: {
  question: string;
  why: string;
  choices: Choice[];
  onAnswer: (choice: Choice) => void;
  onUnknown: () => void;
  onLater?: () => void;
}) {
  return (
    <section className="ui-chat__bubble" aria-label="추가 확인 질문">
      <strong>{question}</strong>
      <p className="ui-small ui-muted">왜 묻나요? {why}</p>
      <div className="ui-chips">
        {choices.map((choice) => (
          <button
            key={choice.id}
            className="ui-chip"
            type="button"
            onClick={() => onAnswer(choice)}
          >
            {choice.label}
          </button>
        ))}
        <button className="ui-chip" type="button" onClick={onUnknown}>
          아직 몰라요
        </button>
        {onLater && (
          <button className="ui-chip" type="button" onClick={onLater}>
            나중에 답하기
          </button>
        )}
      </div>
    </section>
  );
}

export function ChatMessage({
  role,
  children,
}: {
  role: "assistant" | "user";
  children: React.ReactNode;
}) {
  return (
    <div className={classNames("ui-chat__msg", role === "user" && "ui-chat__msg--user")}>
      {role === "assistant" && (
        <span className="ui-chat__avatar" aria-hidden="true">
          🤖
        </span>
      )}
      <div className="ui-chat__bubble">{children}</div>
    </div>
  );
}

export function ChatComposer({
  onSend,
  sending = false,
  placeholder = "장학금 조건이나 준비 서류에 대해 질문해 보세요",
}: {
  onSend: (text: string) => void | Promise<void>;
  sending?: boolean;
  placeholder?: string;
}) {
  const [text, setText] = React.useState("");
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    await onSend(trimmed);
    setText("");
  }
  return (
    <form className="ui-chat__composer" onSubmit={send}>
      <input
        className="ui-input"
        aria-label="AI에게 메시지 입력"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        disabled={sending}
      />
      <UIButton
        variant="primary"
        type="submit"
        disabled={!text.trim()}
        loading={sending}
        aria-label="메시지 보내기"
      >
        ➤
      </UIButton>
    </form>
  );
}

export function DocumentChecklist({
  items,
}: {
  items: Array<{ id: string; label: string; note: string; checked: boolean }>;
}) {
  return (
    <section aria-label="준비할 서류">
      <h3 className="ui-h3">📋 준비할 서류</h3>
      {items.map((item) => (
        <div className="ui-kv" key={item.id}>
          <div>
            <div>{item.label}</div>
            <div className="ui-muted ui-small">{item.note}</div>
          </div>
          <span className={`ui-badge ui-badge--${item.checked ? "possible" : "needs-info"}`}>
            {item.checked ? "확인됨" : "준비 필요"}
          </span>
        </div>
      ))}
    </section>
  );
}

export function DraftEditor({
  initialText,
  sourceSummary,
  onSave,
}: {
  initialText: string;
  sourceSummary: string;
  onSave: (text: string) => void | Promise<void>;
}) {
  const [text, setText] = React.useState(initialText);
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  async function save() {
    setState("saving");
    try {
      await onSave(text);
      setState("saved");
    } catch {
      setState("error");
    }
  }
  return (
    <Panel as="article" className="ui-stack">
      <div className="ui-row ui-row--spread">
        <h3 className="ui-h3">AI 작성 초안</h3>
        <span className="ui-badge ui-badge--needs-info">제출 전 검토 필수</span>
      </div>
      <div className="ui-banner">
        초안에 반영된 사실: {sourceSummary}. 추가 확인이 필요한 경험·지원 동기는 직접 작성해 주세요.
      </div>
      <label className="ui-field" htmlFor="scholarship-draft">
        <span className="ui-field__label">작성 초안 (직접 수정 가능)</span>
        <textarea
          id="scholarship-draft"
          className="ui-input ui-draft-editor"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setState("idle");
          }}
        />
      </label>
      <div className="ui-row ui-row--spread">
        <span className="ui-small ui-muted" role="status" aria-live="polite">
          {state === "saved" && "초안이 저장되었습니다."}
          {state === "saving" && "저장 중입니다."}
          {state === "error" && "저장에 실패했습니다. 다시 시도해 주세요."}
          {state === "idle" && "AI가 생성한 초안이며 공식 제출이 아닙니다."}
        </span>
        <UIButton variant="primary" onClick={save} loading={state === "saving"}>
          초안 저장
        </UIButton>
      </div>
    </Panel>
  );
}
