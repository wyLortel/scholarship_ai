import Link from "next/link";

import { Icon, type IconName } from "@/shared/components";

import styles from "./navigation.module.css";

export type NavKey = "home" | "chat" | "notices";

const ITEMS: { key: NavKey; href: string; label: string; icon: IconName }[] = [
  { key: "home", href: "/", label: "홈", icon: "graduation-cap" },
  { key: "chat", href: "/chat", label: "AI와 장학금 찾기", icon: "chat-bubble" },
  { key: "notices", href: "/notices", label: "장학금 공고 목록", icon: "search" },
];

// 공통 화면 틀: 왼쪽 메뉴 + 본문. 좁은 화면에서는 메뉴가 위쪽 가로줄이 된다.
export function AppShell({ current, children }: { current: NavKey; children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.side} aria-label="메뉴">
        <p className={styles.brand}>
          <Icon name="graduation-cap" size={32} /> 장학금 AI
        </p>
        <ul>
          {ITEMS.map((item) => (
            <li key={item.key}>
              <Link href={item.href} aria-current={item.key === current ? "page" : undefined}>
                <Icon name={item.icon} size={24} /> {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.notice}>
          <Icon name="shield" size={20} />
          신청서 제출은 학생이 공식 기관 사이트에서 직접 진행해요.
        </p>
      </nav>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
