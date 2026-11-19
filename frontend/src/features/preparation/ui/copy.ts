import type { BadgeTone } from "@/shared/components";
import type { OpenItem, PreparationSummary } from "@/lib/api/types";

// 준비 결과 문구 (UX 계약 §문구, 09 §4). 상태는 서버가 준 preparationStatus만 쓴다.
// 제출·접수가 끝났다는 말은 쓰지 않는다 — 공식 제출은 학생이 직접 한다 (BR-C07).
type Status = PreparationSummary["preparationStatus"];

export const statusLabel: Record<Status, string> = {
  PREPARED: "자료 준비 완료 · 제출 전",
  PREPARED_WITH_OPEN_ITEMS: "자료 준비 · 확인 필요 남음",
  STOPPED: "준비 중단",
};

export const statusTone: Record<Status, BadgeTone> = {
  PREPARED: "positive",
  PREPARED_WITH_OPEN_ITEMS: "caution",
  STOPPED: "negative",
};

export function statusMessage(status: Status, openItems: OpenItem[]): string {
  if (status === "PREPARED") {
    return "신청에 필요한 자료를 정리했습니다. 제출과 증빙 발급은 공식 기관에서 직접 진행해 주세요.";
  }
  if (status === "PREPARED_WITH_OPEN_ITEMS") {
    const labels = openItems.map((i) => i.label).join(", ");
    return labels
      ? `자료는 준비되었지만 [${labels}]은 공식 제출 전 확인이 필요합니다.`
      : "자료는 준비되었지만 이 공고의 조건은 아직 확인 중이라 공식 제출 전 확인이 필요합니다.";
  }
  return "현재 정보로는 이 공고의 조건을 충족하지 않아 신청 준비를 진행하지 않았어요.";
}

export const SUBMIT_NOTICE =
  "이 서비스는 신청서를 제출하지 않아요. 아래 링크를 눌러도 제출된 것이 아니며, 공식 사이트에서 직접 제출해 주세요.";
