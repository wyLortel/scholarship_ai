import Link from "next/link";

import { Badge, Panel } from "@/design-system";

import { formatDateTime } from "@/lib/format";
import type { NoticeSummary } from "@/lib/api/types";

import styles from "./notices.module.css";

// 서버가 준 공고 요약을 표시만 한다. 자격(가능/불가)을 계산하거나 암시하지 않는다.
export function NoticeCard({ notice }: { notice: NoticeSummary }) {
  const start = formatDateTime(notice.recruitmentStartAt);
  const end = formatDateTime(notice.recruitmentEndAt);
  const checkedAt = formatDateTime(notice.lastCheckedAt);

  return (
    <Panel as="article" compact aria-labelledby={`notice-${notice.noticeId}`}>
      {notice.isTestOnly && (
        <p className={styles.badge}>
          <Badge tone="demo" title="실제 장학금 공고가 아닌 시험용 가상 공고입니다">
            TEST_ONLY · 가상 공고
          </Badge>
        </p>
      )}
      <h2 id={`notice-${notice.noticeId}`} className={styles.title}>
        {notice.title}
      </h2>
      <dl className={styles.meta}>
        <dt>기관</dt>
        <dd>{notice.institution}</dd>
        <dt>모집 기간</dt>
        <dd>{start && end ? `${start} ~ ${end}` : "공식 공고에서 확인 필요"}</dd>
        <dt>마지막 확인</dt>
        <dd>{checkedAt ?? "확인 기록 없음"}</dd>
        <dt>공고 버전</dt>
        <dd>
          <code>{notice.noticeVersionId}</code>
        </dd>
      </dl>
      {notice.officialUrl ? (
        <a
          className={styles.link}
          href={notice.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          공식 원문 보기 <span aria-hidden="true">↗</span>
          <span className={styles.srOnly}> (새 창)</span>
        </a>
      ) : (
        <p className={styles.muted}>공식 원문 링크 없음</p>
      )}
      <p>
        <Link href={`/notices/${encodeURIComponent(notice.noticeVersionId)}/check`}>
          내 정보로 조건 확인하기 →
        </Link>
      </p>
    </Panel>
  );
}
