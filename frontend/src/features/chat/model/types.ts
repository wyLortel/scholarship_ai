import type { AssessmentResult, PreparationSummary } from "@/lib/api/types";

/** 결과 다음 '신청 준비하기'의 진행 상태. 준비 요약은 API 응답 그대로 (제출 아님). */
export type ChatPreparation =
  | { status: "loading" }
  | { status: "done"; summary: PreparationSummary }
  | { status: "error"; message: string };

/** 채팅에서 고를 수 있는 공고(검증된 공고 상세에서 만든다). */
export type ChatNotice = {
  noticeId: string;
  noticeVersionId: string;
  title: string;
  isTestOnly: boolean;
  /** 물어볼 학생 사실과, 그 사실을 쓰는 조건·원문 근거 (왜 묻는지 보여 주기 위해) */
  questions: ChatQuestion[];
};

export type ChatQuestion = {
  field: string;
  conditionLabels: string[];
  quote: string;
  location: string;
};

export type ChatChoice = { value: string; label: string };

export type ChatMessage =
  | { id: string; from: "bot"; text: string; context?: ChatQuestion }
  | { id: string; from: "user"; text: string };

export type ChatPhase =
  | { kind: "choosing" }
  | { kind: "asking"; question: ChatQuestion; choices: ChatChoice[] }
  | { kind: "checking" }
  | { kind: "done"; result: AssessmentResult; preparation?: ChatPreparation }
  | { kind: "error"; message: string };

/** 오른쪽 패널의 "지금 쓰는 내 정보" 한 줄 */
export type UsedFact = { field: string; name: string; answer: string };
