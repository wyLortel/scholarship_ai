import { Badge, type IconName } from "@/shared/components";
import { groupLabel, groupTone } from "@/features/assessment/ui/copy";
import type { EligibilityGroup } from "@/lib/api/types";
import type { ResultEntry } from "@/features/results/server/actions";

import { ResultCard } from "./ResultCard";
import styles from "./results.module.css";

const GROUPS: EligibilityGroup[] = ["ELIGIBLE", "NEEDS_REVIEW", "INELIGIBLE"];
// 카드 장식 아이콘(공고 순서대로). 판정과 관계없다.
const ICONS: IconName[] = ["graduation-cap", "location-pin", "sprout", "books", "certificate"];

// 그룹 개수는 받은 응답을 세기만 한다(서버 집계는 #36). '확인 필요'를 숨기지 않는다.
export function ResultList({ entries }: { entries: ResultEntry[] }) {
  if (entries.length === 0) {
    return (
      <p role="status" className={styles.muted}>
        지금 비교할 수 있는 검증된 공고가 없어요.
      </p>
    );
  }
  const count = (g: EligibilityGroup) =>
    entries.filter((e) => e.status === "done" && e.result.eligibilityResult === g).length;
  const failed = entries.filter((e) => e.status === "error").length;

  return (
    <section aria-label="비교 결과">
      <p className={styles.counts} role="status">
        {GROUPS.map((g) => (
          <Badge key={g} tone={groupTone[g]}>
            {groupLabel[g]} {count(g)}
          </Badge>
        ))}
        {failed > 0 && <Badge tone="neutral">확인하지 못함 {failed}</Badge>}
      </p>
      <ul className={styles.list}>
        {entries.map((entry, i) => (
          <li key={entry.notice.noticeVersionId}>
            <ResultCard entry={entry} icon={ICONS[i % ICONS.length]} />
          </li>
        ))}
      </ul>
    </section>
  );
}
