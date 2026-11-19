import { Badge, InlineNotice } from "@/shared/components";
import type { PreparationSummary } from "@/lib/api/types";
import { unknownReason } from "@/features/assessment/ui/copy";

import { DocumentChecklist } from "./DocumentChecklist";
import { SUBMIT_NOTICE, statusLabel, statusMessage, statusTone } from "./copy";
import styles from "./preparation.module.css";

// 준비 요약 = 서비스 안의 준비 자료. 제출 상태가 아니다 (BR-C07, 09 §4).
// 상태·미확인 항목·제출 링크는 API 값만 보여 준다. 링크를 눌러도 화면 상태는 바뀌지 않는다 (AC-C07).
export function PreparationSummaryView({ summary }: { summary: PreparationSummary }) {
  const { preparationStatus: status, openItems, officialSubmissionUrl } = summary;
  return (
    <div className={styles.summary}>
      <p className={styles.status}>
        <Badge tone={statusTone[status]} size="lg">
          {statusLabel[status]}
        </Badge>
      </p>
      <p className={styles.message}>{statusMessage(status, openItems)}</p>

      {openItems.length > 0 && (
        <section aria-labelledby="open-items">
          <h3 id="open-items" className={styles.title}>
            공식 제출 전에 확인할 항목
          </h3>
          <ul className={styles.openItems}>
            {openItems.map((item) => (
              <li key={item.conditionId}>
                {item.label}
                {unknownReason[item.reasonCode] && (
                  <span className={styles.muted}> · {unknownReason[item.reasonCode]}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {status !== "STOPPED" && <DocumentChecklist items={summary.checklist} />}

      {status !== "STOPPED" && (
        <section aria-labelledby="official-submission" className={styles.submission}>
          <h3 id="official-submission" className={styles.title}>
            공식 제출
          </h3>
          {officialSubmissionUrl ? (
            <a
              className="ui-button ui-button--primary"
              href={officialSubmissionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              공식 사이트에서 직접 제출하기 (새 창)
            </a>
          ) : (
            <p className={styles.detail}>
              <Badge tone="caution">제출 경로 확인 필요</Badge> 공식 공고에서 제출 방법을 확인해
              주세요.
            </p>
          )}
          <InlineNotice tone="caution" className={styles.notice}>
            {SUBMIT_NOTICE}
          </InlineNotice>
        </section>
      )}

      <p className={styles.muted}>
        기준 공고 버전 <code>{summary.noticeVersionId}</code>
      </p>
    </div>
  );
}
