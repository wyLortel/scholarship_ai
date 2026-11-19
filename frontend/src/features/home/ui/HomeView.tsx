import Link from "next/link";

import { Badge, Icon, Panel, type IconName } from "@/shared/components";
import { NoticeCard } from "@/features/notices/ui/NoticeCard";
import type { NoticeSummary } from "@/lib/api/types";

import styles from "./home.module.css";

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "search", title: "장학금 찾기", text: "검증된 공식 공고만 보여 줘요" },
  { icon: "certificate", title: "조건별 판단", text: "가능 · 확인 필요 · 불가" },
  { icon: "chat-bubble", title: "AI와 대화", text: "필요한 질문만 하나씩" },
  { icon: "document-edit", title: "신청 준비", text: "서류 안내와 공식 제출 경로" },
];

const STEPS: { title: string; text: string; icon: IconName }[] = [
  {
    title: "필요한 정보만 골라요",
    text: "공고 조건에 필요한 것만 물어요. 모르는 항목은 '모름'으로 둘 수 있어요.",
    icon: "graduation-cap",
  },
  {
    title: "장학금별 조건을 AI와 대화하며 확인해요",
    text: "조건마다 공식 원문 근거를 함께 보여 줘요.",
    icon: "chat-bubble",
  },
  {
    title: "서류 안내와 공식 제출 경로를 받아요",
    text: "서류는 직접 발급받고, 제출은 공식 사이트에서 직접 해요.",
    icon: "document-edit",
  },
];

// 홈(시안 01). 공고 카드에는 판정 배지가 없다 — 판정 응답이 없는 공고이기 때문이다 (UX 계약 홈 행).
// 공고 목록은 서버가 검증된 것만 준다 (BR-A05).
export function HomeView({ notices, noticesOk }: { notices: NoticeSummary[]; noticesOk: boolean }) {
  return (
    <main className={styles.home}>
      <Panel variant="tinted" className={styles.hero}>
        <div>
          <Badge tone="demo">친근하지만 정확한 장학금 AI 도우미</Badge>
          <h1>
            나에게 맞는 장학금,
            <br />
            AI와 대화하며 찾아요.
          </h1>
          <p className={styles.lead}>
            공고마다 다른 자격 조건과 서류를 AI가 하나씩 물어보며 안내해요. 결과에는 공식 원문
            근거가 함께 붙어요.
          </p>
          <p className={styles.cta}>
            <Link href="/chat" className="ui-button ui-button--primary">
              AI와 장학금 찾기 →
            </Link>
            <Link href="/results" className="ui-button ui-button--secondary">
              내 정보로 한 번에 비교하기
            </Link>
          </p>
          <ul className={styles.checks}>
            <li>✓ 공식 출처 구분</li>
            <li>✓ 조건별 근거 설명</li>
            <li>✓ 서류·제출 경로 안내</li>
          </ul>
        </div>
        <Icon name="mascot-robot" size={160} className={styles.mascot} />
      </Panel>

      <ul className={styles.features}>
        {FEATURES.map((f) => (
          <li key={f.title}>
            <Panel compact className={styles.feature}>
              <Icon name={f.icon} size={40} />
              <div>
                <strong>{f.title}</strong>
                <p className={styles.muted}>{f.text}</p>
              </div>
            </Panel>
          </li>
        ))}
      </ul>

      <section aria-labelledby="how">
        <h2 id="how">장학금 AI는 이렇게 도와드려요</h2>
        <p className={styles.muted}>장학금마다 다른 조건을 고정된 폼에 억지로 맞추지 않아요.</p>
        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Panel variant="soft" className={styles.step}>
                <Badge tone="neutral">{i + 1}단계</Badge>
                <strong>{s.title}</strong>
                <p className={styles.muted}>{s.text}</p>
                <Icon name={s.icon} size={48} className={styles.stepIcon} />
              </Panel>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="notices">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="notices">이런 장학금을 살펴볼 수 있어요</h2>
            <p className={styles.muted}>
              자격 판정은 내 정보를 고른 뒤에 볼 수 있어요. 아래 카드에는 아직 판정이 없어요.
            </p>
          </div>
          <Badge tone="demo">모두 시연용 가상 공고</Badge>
        </div>
        {!noticesOk ? (
          <p role="alert">공고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        ) : notices.length === 0 ? (
          <p role="status" className={styles.muted}>
            지금 확인된 공고가 없습니다.
          </p>
        ) : (
          <ul className={styles.notices}>
            {notices.map((n) => (
              <li key={n.noticeVersionId}>
                <NoticeCard notice={n} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Panel variant="tinted" className={styles.trust}>
        <div>
          <p className={styles.trustLabel}>✓ 믿을 수 있는 정보 안내</p>
          <h2>AI가 멋대로 자격을 확정하지 않아요.</h2>
          <p className={styles.muted}>
            공식 공고 조건과 입력한 사실을 비교하고, 판단 근거를 보여 줘요. 정보가 부족하면
            &lsquo;확인 필요&rsquo;로 남겨 둬요.
          </p>
        </div>
        <Icon name="shield" size={80} />
      </Panel>

      <div className={styles.bottom}>
        <Panel>
          <h2>안내</h2>
          <ul className={styles.bullets}>
            <li>최종 신청은 공식 사이트에서 직접 진행해야 해요.</li>
            <li>이 화면의 장학금은 모두 시연용 가상 공고예요.</li>
          </ul>
        </Panel>
        <Panel>
          <h2>자주 묻는 질문</h2>
          <dl className={styles.faq}>
            <dt>신청서를 자동으로 제출해 주나요?</dt>
            <dd>아니요, 공식 사이트에서 직접 제출해야 해요.</dd>
            <dt>소득구간을 모르면요?</dt>
            <dd>&lsquo;확인 필요&rsquo;로 남겨 둘 수 있어요. 불가로 처리하지 않아요.</dd>
          </dl>
        </Panel>
      </div>
    </main>
  );
}
