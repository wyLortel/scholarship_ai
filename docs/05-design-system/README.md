# 장학금 AI — 디자인 시스템 (v0.1)

> 소스: 사용자가 제공한 17개 장학금 AI UI 시안(01–17)과 「5장. 디자인 시스템 구축」(11p) 강의자료.
> 성격: **시안 분석 기반 초기 디자인 시스템**. Figma 원본 토큰이 아니라 PNG를 보고 복원한 값이다. 실제 개발 전 팀이 검수·확정한다.

> **문서 우선순위:** 이 폴더는 **화면을 어떻게 보이게 할지**(토큰·부품·화면 조합)를 정한다. 무엇을 반드시 보여줘야 하는지는 [UX 정보 계약](../02-product/03-UX-contract.md), 판정·업무 규칙은 [`docs/01-domain`](../01-domain/04-business-rules.md)이 원본이다. 충돌하면 그 문서가 우선하고, 이 폴더를 고친다.

## 먼저 읽기
1. [`design.md`](design.md): 제품의 디자인 방향과 변경 원칙.
2. [`colors.md`](colors.md), [`typography.md`](typography.md), [`spacing.md`](spacing.md), [`components.md`](components.md): 토큰·부품 명세.
3. [`domain-ux-rules.md`](domain-ux-rules.md): 판정 상태·근거·AI 초안을 화면에 표시하는 규칙(API 값과의 대응표 포함).
4. [`screen-map.md`](screen-map.md): 17개 화면 → 부품 연결표. 이슈·데모 범위는 [`screens/README.md`](../../screens/README.md).
5. [`features/`](features/): 기능별 화면 조합 규격.

## 폴더 위치

| 무엇 | 위치 |
|---|---|
| 디자인 문서 | `docs/05-design-system/` (이 폴더) |
| 화면 시안 이미지 | [`screens/`](../../screens/README.md) (키트의 `references/`와 같은 이미지라 하나만 둔다) |
| 토큰·공통 CSS | `frontend/src/design-system/design-tokens.css`, `frontend/src/design-system/components.css` |
| React 부품 | `frontend/src/design-system/ScholarshipUI.tsx` |
| 정적 부품 카탈로그 | [`ui-catalog.html`](ui-catalog.html) (브라우저로 바로 열기) |
| Claude Code Skill | `.claude/skills/scholarship-design-system/SKILL.md` |
| 색상 직접 지정 검사 | `node tools/check_design_system.mjs` (경고만, 디자인 품질 증명 아님) |

아직 화면에 연결하지 않았다. 토큰·부품 적용과 기존 `notices` 화면의 색상 교체는 #94에서 한다.

## 추천 적용 순서
1. 시안과 본 문서의 UI 규칙을 팀이 승인한다.
2. 토큰 → 공통 UI 부품 → 1개 핵심 흐름(프로필→추천→추가질문→초안)을 구현한다.
3. 디자인 토큰의 하드코딩을 검사하고, 브라우저에서 시각·접근성 테스트한다.
4. 컴포넌트/토큰 변경은 문서와 코드가 함께 변경되도록 PR 규칙을 둔다.

## 반드시 지킬 제품 경계
- **조건상 가능** ≠ 장학금 선정/지급 확정.
- **확인 필요** ≠ 불가. 미확인 사실은 마음대로 채우지 않는다.
- AI가 작성한 문서는 **초안**이며 학생이 검토하고 공식 기관 사이트에서 직접 신청한다.
- 가상의 A/B/C 공고, MOCK 원문, 가상의 자격 상태는 **시연용 데이터**이다. 실제 공고처럼 표시하지 않는다.
- 관리자 원문 승인과 개인의 신청 자격 판정은 별개 절차이다.

## 강의 PDF 반영 범위
- p.4: 이미지 하나만으로는 일관된 UI를 만들기 어려워 문서화가 필요함.
- p.5–6: `design.md`는 시각 명세·컴포넌트·상태를 기록하고, TDD 테스트와 구별함.
- p.7: `colors`·`typography`·`spacing`·`components` 4종 분할.
- p.8–10: `Skill`·`PostToolUse` 및 기타 Hook 수명주기.
- p.11: 설계 문서 생성→분할→Skill→Hook 실습.

이 키트에 포함된 접근성 수치, 토큰값, 제품 도메인 설계는 시안에서 추출하거나 개발을 위해 **추가 제안한 값**이며, 강의 PDF의 원문 내용인 것처럼 다루지 않는다.
