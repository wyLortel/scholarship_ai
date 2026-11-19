# 코드 지도 — 무엇이 어디에 있나

> 코드 위치만 안내한다. 규칙은 [BR](01-domain/04-business-rules.md), 판정 정책은 [05-eligibility-policy](01-domain/05-eligibility-policy.md), 수용 기준은 [AC](04-delivery/01-acceptance-tests.md)가 원본이다.

폴더는 먼저 **업무 경계**(ADR-0001: A 공고 · B 판정 · C 준비)로, 그 안은 **계층**으로 나눈다(Package by Feature + Layered). 코드를 찾을 때 두 번만 묻는다: 무슨 업무인가(`eligibility/`) → 어떤 책임인가(`domain/rules.py`).

## 기능별 위치

| 기능 | 백엔드 `backend/app/` | 프론트 `frontend/src/` | 백엔드 테스트 `backend/tests/` | 이슈 · 규칙 |
|---|---|---|---|---|
| A. 공고 목록·버전·근거 | `notice/` | `features/notices/`, 라우트 `app/notices/page.tsx` | `notice/` | #24, #25, #26(상세 API), BR-A05 |
| B. 자격 판정 (Rule Engine) | `eligibility/` (계산은 `domain/rules.py`에서만) | `features/assessment/`, 라우트 `app/notices/[noticeVersionId]/check/` | `eligibility/` | #27, #28, #29, AC-B01, AC-B02, AC-B03, AC-B04, AC-B08, AC-B10 |
| AI 상담(채팅) 데모 | (판정은 `eligibility/`) | `features/chat/`, 라우트 `app/chat/` | — (Storybook `Chat/ChatView`) | #93, AC-B06 |
| 공통 화면 틀(왼쪽 메뉴) | — | `features/navigation/ui/AppShell.tsx` (`/notices`, 조건 확인, `/chat`) | — | #94 |
| C. 신청 준비 (MVP 요약) | `preparation/` (`POST /api/preparation-summaries`, 체크리스트는 `domain/checklist.py`) | `features/preparation/`, 채팅의 '신청 준비하기' | `preparation/` | #33, #34, AC-C05, AC-C07, BR-C04, BR-C05, BR-C07, BR-C08 |
| 공통 | `main.py`(라우터 등록), `config.py`, `health.py` | `lib/api/`(FastAPI 호출·타입), `lib/format.ts`, `shared/components/`(공용 부품), `design-system/`(토큰·CSS), `public/icons/` | `contract.py`, `test_contract_examples.py`, `test_health.py` | #23 계약 |

## 기능 폴더 안의 계층

```text
backend/app/eligibility/
  api/             router.py(엔드포인트), schemas.py(요청·응답 pydantic 모델)
  application/     service.py(흐름 조정)
  domain/          model.py(업무 객체), rules.py(판정 계산)
backend/app/notice/
  api/             router.py, schemas.py
  application/     service.py
  domain/          model.py, repository.py(저장소 계약 Protocol)
  infrastructure/  fixture_loader.py, fixture_repository.py(TEST_ONLY 구현, 나중에 DB 구현이 옆에)
backend/app/preparation/
  api/             router.py, schemas.py
  application/     service.py(판정을 다시 받아 체크리스트·제출 안내를 붙임, 저장 없음)
  domain/          checklist.py(서류 → 체크리스트 규칙), status.py(판정 → 준비 상태)
```

| 계층 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `api/` | HTTP 요청·응답을 계약(`contracts/api-draft.yaml`) 모양으로 바꾼다 | 업무 판단 |
| `application/` | 한 사용 흐름을 조정한다(조회 → 검증 확인 → 계산 호출 → 근거 연결) | 판정 계산 |
| `domain/` | 업무 객체·규칙·저장소 계약. 판정 3값 계산은 `eligibility/domain/rules.py` **한 곳** | FastAPI·pydantic·DB import |
| `infrastructure/` | 저장소 계약의 구현(fixture, 나중에 DB·외부 API) | 판정 |

의존 방향: `api` → `application` → `domain` ← `infrastructure`. `domain`이 웹·pydantic·다른 계층을 import하면 `backend/tests/test_layer_dependencies.py`가 실패한다. 기능 사이에서는 `eligibility`가 `notice`를, `preparation`이 `eligibility`·`notice`를 읽을 수 있고, 반대 방향은 금지한다.

**코드가 없는 계층 폴더는 만들지 않는다**(예: `eligibility/infrastructure/` 없음).

## 프론트 기능 폴더 안의 역할

```text
frontend/src/features/assessment/
  ui/      AssessmentForm, AssessmentResultView(+stories), assessment.module.css, copy.ts(화면 문구)
  server/  actions.ts ("use server" 서버 액션 → lib/api/server.ts)
  model/   facts.ts (입력 항목 정의, 폼 값 → 계약 StudentFact 변환)
frontend/src/features/chat/
  ui/      ChatSession(상태·서버 액션 호출), ChatView(+stories), chat.module.css, script.ts(정해진 대화 문구)
  model/   types.ts
frontend/src/features/notices/
  ui/      NoticeCard, NoticeList(+stories), notices.module.css
frontend/src/features/preparation/
  ui/      DocumentChecklist, PreparationSummaryView(+stories), copy.ts(준비 상태 문구), preparation.module.css (업로드 입력 없음)
  server/  actions.ts (같은 답변 → POST /api/preparation-summaries)
```

| 폴더 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `ui/` | 화면·사용자 입력·문구. 스토리는 컴포넌트 옆에 둔다 | 판정 계산, FastAPI 직접 호출 |
| `server/` | 서버에서만 도는 코드(서버 액션). 입력을 계약 형식으로 바꿔 `lib/api/server.ts`로 보낸다 | 판정 계산, 입력값 로그 |
| `model/` | 기능이 쓰는 데이터 모양·변환(입력 항목, 타입) | 화면, 판정 규칙 |

백엔드와 업무 단위는 맞추되(`notices` ↔ `notice`, `assessment`·`chat` ↔ `eligibility`, `preparation` ↔ `preparation`), 안쪽은 프론트 특성에 맞춰 세 가지로만 나눈다. 코드가 없는 폴더는 만들지 않는다.

## 공용 부품 (Shared Components)

```text
frontend/src/shared/components/   Button, Chip(+ChipGroup), SelectField, Badge, Panel, InlineNotice, Icon (+stories)
                                  import { Button, Badge } from "@/shared/components"
frontend/src/design-system/       design-tokens.css, components.css(ui-* 클래스) — layout.tsx에서 전역 import
frontend/public/icons/<name>.png  아이콘 12장(512px). 주소는 /icons/<name>.png, 코드에서는 <Icon name="..." />
```

- 여러 기능에서 자주 쓰는 모양만 여기 둔다. 한 기능에서만 쓰면 그 기능의 `ui/`에 둔다.
- 공용 부품은 **판정을 모른다.** `Badge`는 색조(`positive`·`caution`·`negative`·`neutral`·`demo`)만 받고, 판정 → 색조는 기능 쪽(`features/assessment/ui/copy.ts`의 `groupTone`·`resultTone`)이 정한다. 색만으로 뜻을 전하지 않게 글자를 같이 넣는다.
- Storybook에서는 `Shared Components/…`로 본다.
- 새 아이콘은 `public/icons/`에 넣고 `Icon.tsx`의 `ICON_NAMES`에 이름을 추가한다.

## 요청 하나의 길 (판정 예)

```text
화면 app/notices/[noticeVersionId]/check/page.tsx
  → features/assessment/ui/AssessmentForm.tsx (입력만)
  → features/assessment/server/actions.ts (서버 액션, model/facts.ts로 계약 형식 변환)
  → lib/api/server.ts postAssessment()
  → POST /api/assessments  eligibility/api/router.py (+ schemas.py)
  → eligibility/application/service.py assess()  (공고 버전 조회: notice/domain/repository.py)
  → eligibility/domain/rules.py evaluate()  ← 판정은 여기서만
  ← 결과 + 근거 → features/assessment/ui/AssessmentResultView.tsx (표시만)
```

## 새 기능을 추가할 때

1. 업무 경계(A, B, C)를 정하고 `backend/app/<경계>/<계층>/`에 파일을 둔다. 필요한 계층 폴더만 만든다.
2. 테스트는 `backend/tests/<경계>/test_*.py`에 두고, 이름에 AC ID를 넣는다(예: `test_AC_B08_...`).
3. 프론트는 `frontend/src/features/<기능>/{ui,server,model}/`에 두고(필요한 폴더만), `app/`에는 라우트(`page.tsx`)만 둔다.
