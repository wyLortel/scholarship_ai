import type { HTMLAttributes } from "react";

import { cx } from "./cx";

export type InlineNoticeProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "info" | "caution" | "danger" | "success";
};

// 화면 안의 안내·경고 문구 (예: "제출은 공식 기관에서 직접 해 주세요").
export function InlineNotice({ tone = "info", className, children, ...rest }: InlineNoticeProps) {
  return (
    <div
      className={cx("ui-banner", tone !== "info" && `ui-banner--${tone}`, className)}
      role={tone === "danger" ? "alert" : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
