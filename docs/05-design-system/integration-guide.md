# integration-guide.md — 팀 레포지토리에 붙이는 방법

## 1. 이 저장소에서의 위치
`docs/05-design-system/README.md`의 "폴더 위치" 표를 따른다. 프론트는 Next.js App Router(ADR-0013), CSS Modules + 전역 CSS다.

## 2. 디자인 토큰 사용 (#94에서 적용)
```tsx
// frontend/src/app/layout.tsx
import "@/design-system/design-tokens.css";
import "@/design-system/components.css";
```
```tsx
import { StatusBadge, MissingInfoQuestion } from "@/design-system/ScholarshipUI";
```

## 3. Skill 및 Hook
- Skill: `.claude/skills/scholarship-design-system/SKILL.md` (저장소에 포함).
- 검사 직접 실행: `node tools/check_design_system.mjs`. 색상 직접 지정을 경고한다(종료 코드 1).
- PostToolUse Hook은 **아직 켜지 않았다.** 켜려면 팀 합의 후 `.claude/settings.json`에 병합한다(기존 hook 삭제 금지):
```json
{ "hooks": { "PostToolUse": [ { "matcher": "Edit|Write|MultiEdit",
  "hooks": [ { "type": "command", "command": "node tools/check_design_system.mjs" } ] } ] } }
```
- 커밋 시 검사(#90)와 CI(#35)에 넣을지는 기존 화면의 색상 교체(#94) 후 결정한다.

## 4. 기존 프로젝트에서 별도로 검증할 것
- 프로젝트 프레임워크/빌드 시스템(React, Vite, Next.js 등)
- CSS 체계(Tailwind, CSS Modules, 일반 CSS)와 우선순위 충돌
- TypeScript 경로·React 타입 버전
- 백엔드 판정 상태 enum·공고 버전·사실 출처와 UI 타입 매핑
- 로그인/개인정보처리/공식 사이트 링크의 실제 구현 여부
- 시연용 데이터와 실제 데이터의 완전한 분리

## 5. 코드 품질 검사 범위
이 Hook은 **색상 직접 지정에 대한 경고** 수준이다. 사용성·대비·간격의 일관성·시각 완성도·장학금 판정 정확성을 자동으로 보장하지 않는다. 팀 검토와 브라우저 테스트, 시각 회귀 테스트를 함께 적용한다.

## 6. 새 색상/부품을 추가해야 할 때
1. 중복 여부와 실제 필요를 먼저 검사한다.
2. 대안/트레이드오프(재사용성 vs 복잡도)를 짧게 기록한다.
3. `colors/typography/spacing/components.md`의 대응 명세를 고친다.
4. 토큰 CSS/공통 컴포넌트/예제 화면을 함께 갱신한다.
5. 사용 조건·상태·접근성·도메인 경계를 검증한다.
