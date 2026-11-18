import type { Metadata } from "next";
import "@/design-system/design-tokens.css";
import "@/design-system/components.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "장학금 통합 지원 AI",
  description: "공식 장학금 공고의 조건을 내 정보와 비교하고 신청을 준비합니다.",
  // MVP는 TEST_ONLY 가상 공고만 있으므로 검색 노출 금지. 검증된 실제 공고 공개 시 페이지별로 연다. (ADR-0013)
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
