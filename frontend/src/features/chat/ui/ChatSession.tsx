"use client";

import { useState, useTransition } from "react";

import { assessAnswers } from "@/features/assessment/server/actions";
import { FACT_INPUTS, answerLabel, choicesFor, factName } from "@/features/assessment/model/facts";
import { prepareAnswers } from "@/features/preparation/server/actions";

import { ChatView } from "./ChatView";
import { GREETING, questionText, startText } from "./script";
import type {
  ChatChoice,
  ChatMessage,
  ChatNotice,
  ChatPhase,
  ChatQuestion,
  UsedFact,
} from "@/features/chat/model/types";

type Answer = { field: string; raw: string };

const greeting: ChatMessage = { id: "greeting", from: "bot", text: GREETING };

// 정해진 순서로 묻고, 답이 모이면 서버 액션 → FastAPI(Rule Engine)로 판정한다.
// 입력값은 이 화면 상태에만 있고 저장·로그하지 않는다 (CLAUDE.md §2-9).
export function ChatSession({ notices }: { notices: ChatNotice[] }) {
  const [selected, setSelected] = useState<ChatNotice | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<ChatPhase>({ kind: "choosing" });
  const [, startTransition] = useTransition();
  const askable = (n: ChatNotice) => n.questions.filter((q) => FACT_INPUTS[q.field]);

  function ask(q: ChatQuestion, extra: ChatMessage[]) {
    setMessages((m) => [
      ...m,
      ...extra,
      { id: `q-${q.field}-${m.length}`, from: "bot", text: questionText(q), context: q },
    ]);
    setPhase({ kind: "asking", question: q, choices: choicesFor(FACT_INPUTS[q.field]) });
  }

  function check(notice: ChatNotice, all: Answer[]) {
    setPhase({ kind: "checking" });
    startTransition(async () => {
      const state = await assessAnswers(notice.noticeVersionId, all);
      setPhase(
        state.status === "done"
          ? { kind: "done", result: state.result }
          : {
              kind: "error",
              message: state.status === "error" ? state.message : "다시 시도해 주세요.",
            },
      );
    });
  }

  // 같은 답변으로 준비 요약을 받는다. 준비 상태·체크리스트는 서버가 정한다.
  function prepare() {
    if (!selected || phase.kind !== "done") return;
    const { result } = phase;
    setMessages((m) => [...m, { id: `prep-${Date.now()}`, from: "user", text: "신청 준비하기" }]);
    setPhase({ kind: "done", result, preparation: { status: "loading" } });
    startTransition(async () => {
      const state = await prepareAnswers(selected.noticeVersionId, answers);
      setPhase({ kind: "done", result, preparation: state });
    });
  }

  function begin(notice: ChatNotice, extra: ChatMessage[]) {
    setSelected(notice);
    setAnswers([]);
    const intro: ChatMessage = { id: `start-${Date.now()}`, from: "bot", text: startText(notice) };
    const [first] = askable(notice);
    if (first) ask(first, [...extra, intro]);
    else {
      setMessages((m) => [...m, ...extra, intro]);
      check(notice, []);
    }
  }

  function onSelectNotice(notice: ChatNotice) {
    begin(notice, [{ id: `pick-${Date.now()}`, from: "user", text: notice.title }]);
  }

  function onAnswer(choice: ChatChoice) {
    if (!selected || phase.kind !== "asking") return;
    const next = [...answers, { field: phase.question.field, raw: choice.value }];
    setAnswers(next);
    const reply: ChatMessage = { id: `a-${Date.now()}`, from: "user", text: choice.label };
    const remaining = askable(selected).find((q) => !next.some((a) => a.field === q.field));
    if (remaining) ask(remaining, [reply]);
    else {
      setMessages((m) => [...m, reply]);
      check(selected, next);
    }
  }

  const usedFacts: UsedFact[] = answers.map((a) => ({
    field: a.field,
    name: factName(a.field),
    answer: answerLabel(FACT_INPUTS[a.field], a.raw),
  }));

  return (
    <ChatView
      notices={notices}
      selected={selected}
      messages={messages}
      phase={phase}
      usedFacts={usedFacts}
      onSelectNotice={onSelectNotice}
      onAnswer={onAnswer}
      onPrepare={prepare}
      onRestart={() =>
        selected &&
        begin(selected, [{ id: `re-${Date.now()}`, from: "user", text: "다시 답할게요" }])
      }
      onChooseAnother={() => {
        setSelected(null);
        setAnswers([]);
        setMessages((m) => [
          ...m,
          { id: `another-${Date.now()}`, from: "bot", text: "확인할 장학금을 다시 골라 주세요." },
        ]);
        setPhase({ kind: "choosing" });
      }}
    />
  );
}
