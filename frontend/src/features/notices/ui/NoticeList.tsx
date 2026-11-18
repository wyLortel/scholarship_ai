import type { NoticeSummary } from "@/lib/api/types";

import { NoticeCard } from "./NoticeCard";
import styles from "./notices.module.css";

// 목록 필터(VERIFIED만)는 서버(BR-A05)가 한다. 여기서는 받은 순서대로 표시만 한다.
export function NoticeList({ notices }: { notices: NoticeSummary[] }) {
  if (notices.length === 0) {
    return (
      <p role="status" className={styles.empty}>
        지금 확인된 공고가 없습니다.
      </p>
    );
  }
  return (
    <ul className={styles.list}>
      {notices.map((notice) => (
        <li key={notice.noticeVersionId}>
          <NoticeCard notice={notice} />
        </li>
      ))}
    </ul>
  );
}
