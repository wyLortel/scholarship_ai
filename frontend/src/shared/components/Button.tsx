import type { ButtonHTMLAttributes } from "react";

import { cx } from "./cx";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** primary: 화면에서 가장 중요한 다음 행동 하나. secondary: 보조 행동. quiet: 글자만. */
  variant?: "primary" | "secondary" | "quiet";
  /** 처리 중이면 누를 수 없고 loadingText를 보여 준다. */
  loading?: boolean;
  loadingText?: string;
  /** 가로 전체 너비 */
  block?: boolean;
};

export function Button({
  variant = "secondary",
  loading = false,
  loadingText = "처리 중…",
  block = false,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("ui-button", `ui-button--${variant}`, block && "ui-button--block", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? loadingText : children}
    </button>
  );
}
