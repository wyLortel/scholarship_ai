import type { AssessmentResult } from "@/lib/api/types";

import styles from "./assessment.module.css";
import { groupLabel, groupMessage, resultIcon, resultLabel } from "./copy";

// Rule Engine 응답을 표시만 한다. 결과를 다시 계산하거나 바꾸지 않는다 (BR-B02, UX 계약).
export function AssessmentResultView({ result }: { result: AssessmentResult }) {
  const group = result.eligibilityResult;
  return (
    <section className={styles.result} aria-live="polite" aria-labelledby="assessment-result">
      <p className={`${styles.groupBadge} ${styles[group]}`} id="assessment-result">
        {groupLabel[group]}
      </p>
      <p className={styles.message}>{groupMessage(group, result.details)}</p>
      <ul className={styles.conditions}>
        {result.details.map((d) => (
          <li key={d.conditionId} className={styles.condition}>
            <span className={`${styles.resultTag} ${styles[d.result]}`}>
              <span aria-hidden="true">{resultIcon[d.result]}</span> {resultLabel[d.result]}
            </span>
            <span className={styles.conditionLabel}>{d.label}</span>
            {d.evidence && <q className={styles.quote}>{d.evidence.quote}</q>}
          </li>
        ))}
      </ul>
      <p className={styles.meta}>
        공고 버전 <code>{result.noticeVersionId}</code>
      </p>
    </section>
  );
}
