import Image from "next/image";

import { cx } from "./cx";

// 파일은 frontend/public/icons/<name>.png (512px). 새 아이콘은 여기 이름을 추가한다.
export const ICON_NAMES = [
  "mascot-robot",
  "graduation-cap",
  "chat-bubble",
  "search",
  "shield",
  "bell",
  "folder",
  "certificate",
  "document-edit",
  "books",
  "sprout",
  "location-pin",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export type IconProps = {
  name: IconName;
  /** 화면 크기(px). 기본 24 */
  size?: number;
  /** 뜻을 전하는 아이콘이면 설명을, 글자 옆 꾸밈이면 생략(빈 alt). */
  alt?: string;
  className?: string;
};

export function Icon({ name, size = 24, alt = "", className }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.png`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={cx("ui-icon", className)}
    />
  );
}
