import type { HTMLAttributes } from "react";

import { cx } from "./cx";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "aside" | "div";
  /** soft: 안쪽 묶음, tinted: 강조 배경 */
  variant?: "default" | "soft" | "tinted";
  compact?: boolean;
};

// 정보를 묶는 기본 카드.
export function Panel({
  as: Element = "section",
  variant = "default",
  compact = false,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Element
      className={cx(
        "ui-panel",
        variant !== "default" && `ui-panel--${variant}`,
        compact && "ui-panel--compact",
        className,
      )}
      {...rest}
    >
      {children}
    </Element>
  );
}
