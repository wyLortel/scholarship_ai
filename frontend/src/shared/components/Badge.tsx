import type { HTMLAttributes } from "react";

import { cx } from "./cx";

/**
 * 색조만 정한다. 어떤 판정이 어떤 색조인지는 부품이 모른다 — 기능 쪽에서 정한다
 * (예: features/assessment/ui/copy.ts 의 groupTone). 색만으로 뜻을 전하지 않도록 글자를 꼭 넣는다.
 */
export type BadgeTone = "positive" | "caution" | "negative" | "neutral" | "demo";

const TONE_CLASS: Record<BadgeTone, string> = {
  positive: "ui-badge--possible",
  caution: "ui-badge--needs-info",
  negative: "ui-badge--ineligible",
  neutral: "ui-badge--pending",
  demo: "ui-badge--demo",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone: BadgeTone;
  /** lg: 판정 결과처럼 화면의 결론 표시 */
  size?: "md" | "lg";
};

export function Badge({ tone, size = "md", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx("ui-badge", TONE_CLASS[tone], size === "lg" && "ui-badge--lg", className)}
      {...rest}
    >
      {children}
    </span>
  );
}
