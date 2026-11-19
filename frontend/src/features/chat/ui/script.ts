import type { AssessmentResult } from "@/lib/api/types";

import { groupMessage, objectParticle } from "@/features/assessment/ui/copy";
import { factName } from "@/features/assessment/model/facts";

import type { ChatNotice, ChatQuestion } from "@/features/chat/model/types";

// 데모용 정해진 대화 문구 (LLM 미연결, OPEN-19).
// 규칙: 결과가 오기 전에는 가능·불가를 말하지 않고, 결과 문장은 API 응답의 카피만 쓴다 (AC-B06).

export const GREETING =
  "안녕하세요! 저는 장학금 AI예요. 확인하고 싶은 장학금을 골라 주시면, 공고 조건에 필요한 정보만 하나씩 여쭤볼게요.";

export function startText(notice: ChatNotice): string {
  if (notice.questions.length === 0) {
    return `${notice.title}의 조건을 확인해 볼게요.`;
  }
  const names = notice.questions.map((q) => factName(q.field)).join(", ");
  return `${notice.title}의 조건을 확인하려면 ${names} 정보가 필요해요. 모르는 항목은 '모름'을 골라도 괜찮아요.`;
}

export function questionText(q: ChatQuestion): string {
  const name = factName(q.field);
  return `${name}${objectParticle(name)} 알려 주세요. 공고의 [${q.conditionLabels.join(", ")}] 조건과 비교해요.`;
}

export const CHECKING_TEXT = "입력한 정보를 공고 조건과 비교하고 있어요…";

export const PREPARING_TEXT = "공고 원문에서 필요한 서류를 정리하고 있어요…";

export const PREPARED_INTRO =
  "신청 준비에 필요한 서류를 공고 원문에서 정리했어요. 발급처와 원문 근거를 함께 확인해 주세요.";

/** 결과 문장: API가 준 판정 그룹과 조건 결과로만 만든다. */
export function resultText(result: AssessmentResult): string {
  return groupMessage(result.eligibilityResult, result.details);
}
