---
name: scholarship-design-system
description: 장학금 AI의 기존 UI 시안과 디자인 시스템 계약을 따라 화면을 만들거나 수정할 때 사용한다.
---

# 장학금 AI 디자인 시스템 Skill

## 활성화 조건
사용자가 장학금 AI 웹 화면·컴포넌트·레이아웃·스타일·반응형·초안·채팅·상태 표시를 만들거나 바꾸라고 할 때 아래 순서를 지킨다.

## 0. 확인할 파일 (필요한 것부터)
1. `docs/05-design-system/design.md` — 원칙/페이지 구조.
2. `docs/05-design-system/colors.md`, `typography.md`, `spacing.md`, `components.md` — 토큰/부품 계약.
3. `docs/05-design-system/domain-ux-rules.md` — 자격 상태와 근거의 제품 불변조건.
4. 해당 기능 `docs/05-design-system/features/<feature>.md` — 화면별 조합.
5. `docs/05-design-system/screen-map.md`와 `screens/XX_*.png` — 시각 참조. 데모 범위는 `screens/README.md`.
6. 무엇을 반드시 보여줘야 하는지는 `docs/02-product/03-UX-contract.md`가 원본(충돌 시 우선).

## 1. 구현 전 답할 질문
- 이 화면에서 사용자가 **반드시 해결해야 하는 과업**은 무엇인가?
- 기존 부품 조합으로 해결 가능한가? 새 부품을 만든다면 **왜** 필요한가?
- 조건과 사실의 출처가 확인되었는가? **모름**을 잘못 '불가' 처리하지 않는가?
- 로딩/오류/빈 상태/미확인/모바일 상태에서 무엇을 보여주는가?

## 2. 구현 규칙
- 토큰은 `frontend/src/design-system/design-tokens.css`에, 공통 스타일은 `frontend/src/design-system/components.css`에 둔다.
- 인라인 색상/임의 색상은 금지; `var(--color-...)` 사용. 새 토큰이 필요하면 문서와 CSS를 같이 업데이트.
- `StatusBadge`, `EligibilityConditionRow`, `SourceEvidenceCard`, `MissingInfoQuestion`, `DraftEditor`는 도메인 상태가 있는 공통 부품으로 사용.
- 인증은 홈과 별도 페이지. 채팅은 데스크톱 3열/모바일 1열.
- 시연 공고의 '가상' 표시를 제거하지 않는다.
- AI가 불확실한 사실을 임의 생성하거나 초안을 제출 완료로 표현하지 않는다.
- 서버 판정 결과를 UI에서 새로 계산하거나 덮어쓰지 않는다.

## 3. 작업 완료 보고
- 어떤 컴포넌트를 재사용/신규 생성했는지.
- 적용한 토큰과 상태를 어떻게 선택했는지.
- 모바일/키보드/에러/정보 미확인 상태 확인 여부.
- `node tools/check_design_system.mjs` 실행 결과. 경고가 있으면 원인과 예외 승인 사유.

## 4. 문서 충돌
팀의 PRD·정식 도메인 요구사항이 디자인 시안과 충돌하면 조용히 우회하지 말고 변경 위치를 지목하고 결정 필요 사항을 보고한다.
