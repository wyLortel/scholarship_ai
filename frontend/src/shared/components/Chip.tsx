import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cx } from "./cx";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 고른 상태(aria-pressed). 선택지를 한 번 누르고 끝나는 경우엔 생략. */
  selected?: boolean;
};

// 짧은 선택지 버튼(채팅 답변, 공고 고르기). 여러 개는 <ChipGroup>으로 감싼다.
export function Chip({ selected, type = "button", className, children, ...rest }: ChipProps) {
  return (
    <button type={type} className={cx("ui-chip", className)} aria-pressed={selected} {...rest}>
      {children}
    </button>
  );
}

export function ChipGroup({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("ui-chips", className)} {...rest}>
      {children}
    </div>
  );
}
