import { Badge, InlineNotice } from "@/shared/components";
import type { ChecklistItem } from "@/lib/api/types";

import styles from "./preparation.module.css";

// 공고 원문에 적힌 제출 서류와 발급 안내를 보여 준다 (09 §2, AC-C05).
// - 발급처·안내 링크는 API 값만. 없으면 "발급처 확인 필요" (만들어 내지 않음).
// - 조건부 서류는 "해당하는 경우"로 표시해 모든 학생에게 요구하지 않는다.
// - 파일 입력·업로드 버튼이 없다 (BR-C08).
export function DocumentChecklist({ items }: { items: ChecklistItem[] }) {
  return (
    <section aria-labelledby="document-checklist">
      <h3 id="document-checklist" className={styles.title}>
        준비해야 할 서류
      </h3>
      {items.length === 0 ? (
        <p className={styles.muted}>
          이 공고에서 확인된 제출 서류가 없어요. 공식 공고를 확인해 주세요.
        </p>
      ) : (
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.itemId} className={styles.item}>
              <p className={styles.name}>
                {item.documentName}
                {item.isConditional && <Badge tone="neutral">해당하는 경우</Badge>}
              </p>
              {item.isConditional && item.appliesWhen && (
                <p className={styles.detail}>{item.appliesWhen}에만 필요해요.</p>
              )}
              <p className={styles.detail}>
                발급처: {item.issuer ?? <Badge tone="caution">발급처 확인 필요</Badge>}
                {item.issuanceGuideUrl && (
                  <>
                    {" · "}
                    <a href={item.issuanceGuideUrl} target="_blank" rel="noopener noreferrer">
                      발급 안내 보기 (새 창)
                    </a>
                  </>
                )}
              </p>
              <p className={styles.quote}>
                왜 필요한가요? 원문: <q>{item.evidence.quote}</q> ({item.evidence.location})
              </p>
            </li>
          ))}
        </ul>
      )}
      <InlineNotice className={styles.notice}>
        증빙서류 파일을 이곳에 올리지 않아요. 서류는 발급처에서 직접 발급받아 준비해 주세요.
      </InlineNotice>
    </section>
  );
}
