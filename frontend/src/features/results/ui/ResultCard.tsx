"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, Button, Icon, Panel, type IconName } from "@/shared/components";
import { AssessmentResultView } from "@/features/assessment/ui/AssessmentResultView";
import { groupLabel, groupTone } from "@/features/assessment/ui/copy";
import type { ResultEntry } from "@/features/results/server/actions";

import styles from "./results.module.css";

// 공고 하나의 비교 결과. 배지는 이 공고의 판정 응답(eligibilityResult)만 쓴다 (BR-B02).
// 판정을 받지 못한 공고는 배지 없이 '확인하지 못함'을 그대로 보여 준다(숨기지 않음).
export function ResultCard({ entry, icon }: { entry: ResultEntry; icon: IconName }) {
  const { notice } = entry;
  const [open, setOpen] = useState(false);
  const titleId = `result-${notice.noticeId}`;
  return (
    <Panel as="article" aria-labelledby={titleId} className={styles.card}>
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon}>
          <Icon name={icon} size={32} />
        </span>
        <div className={styles.cardTitle}>
          {notice.isTestOnly && <Badge tone="demo">시연용 가상 공고</Badge>}
          <h2 id={titleId}>{notice.title}</h2>
          <p className={styles.muted}>{notice.institution}</p>
        </div>
        {entry.status === "done" ? (
          <Badge tone={groupTone[entry.result.eligibilityResult]} size="lg">
            {groupLabel[entry.result.eligibilityResult]}
          </Badge>
        ) : (
          <Badge tone="neutral">확인하지 못함</Badge>
        )}
      </header>

      {entry.status === "done" ? (
        <p className={styles.conditions}>
          {entry.result.details.length > 0
            ? `주요 조건: ${entry.result.details.map((d) => d.label).join(" · ")}`
            : "이 공고의 조건은 아직 확인 중이에요."}
          <span className={styles.muted}>
            {" "}
            · 공고 버전 <code>{notice.noticeVersionId}</code>
          </span>
        </p>
      ) : (
        <p className={styles.conditions} role="alert">
          {entry.message}
        </p>
      )}

      <div className={styles.actions}>
        {entry.status === "done" && (
          <Button
            aria-expanded={open}
            aria-controls={`${titleId}-evidence`}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "자격 근거 접기" : "자격 근거 보기"}
          </Button>
        )}
        <Link href="/chat" className="ui-button ui-button--primary">
          AI에게 추가로 물어보기 →
        </Link>
      </div>
      {entry.status === "done" && open && (
        <div id={`${titleId}-evidence`}>
          <AssessmentResultView result={entry.result} />
        </div>
      )}
    </Panel>
  );
}
