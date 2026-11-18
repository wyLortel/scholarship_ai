# 코드 지도 — 무엇이 어디에 있나

> 코드 위치만 안내한다. 규칙은 [BR](01-domain/04-business-rules.md), 판정 정책은 [05-eligibility-policy](01-domain/05-eligibility-policy.md), 수용 기준은 [AC](04-delivery/01-acceptance-tests.md)가 원본이다.

폴더는 **업무 경계**(ADR-0001: A 공고 · B 판정 · C 준비)로 나눈다. 기능 하나를 열면 그 기능의 모델·규칙·API·저장소가 한곳에 있고, 테스트도 같은 이름의 폴더에 있다.

## 기능별 위치

| 기능 | 백엔드 `backend/app/` | 프론트 `frontend/src/` | 백엔드 테스트 `backend/tests/` | 이슈 · 규칙 |
|---|---|---|---|---|
| A. 공고 목록·버전·근거 | `notice/` | `features/notices/`, 라우트 `app/notices/page.tsx` | `notice/` | #24, #25, BR-A05 |
| B. 자격 판정 (Rule Engine) | `eligibility/` (계산은 `rules.py`에서만) | `features/assessment/`, 라우트 `app/notices/[noticeVersionId]/check/` | `eligibility/` | #27, AC-B03, AC-B08, AC-B10 |
| C. 신청 준비 | `preparation/` (빈 패키지) | — | — | #31 이후 |
| 공통 | `main.py`(라우터 등록), `config.py`, `health.py` | `lib/api/`(FastAPI 호출·타입), `lib/format.ts`, `design-system/` | `contract.py`, `test_contract_examples.py`, `test_health.py` | #23 계약 |

## 기능 폴더 안의 파일 이름 = 역할

| 파일 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `router.py` | HTTP 요청·응답을 계약(`contracts/api-draft.yaml`) 모양으로 바꾼다 | 업무 판단 |
| `service.py` | 한 사용 흐름을 조정한다(조회 → 검증 확인 → 계산 호출 → 근거 연결) | 판정 계산 |
| `model.py` | 업무 객체(불변 dataclass) | FastAPI·저장소 의존 |
| `rules.py` | 업무 결정. 판정 3값 계산은 `eligibility/rules.py` **한 곳** | 입출력 |
| `repository.py` | 저장소 인터페이스(Protocol) | 구현 |
| `fixture_*.py` | TEST_ONLY fixture 기반 저장소 구현 (나중에 DB 구현이 옆에 생긴다) | 판정 |

의존 방향: `router` → `service` → `model`/`rules`. 기능 사이에서는 `eligibility`가 `notice`를 읽을 수 있고, 반대 방향은 금지한다.

## 요청 하나의 길 (판정 예)

```text
화면 app/notices/[noticeVersionId]/check/page.tsx
  → features/assessment/AssessmentForm.tsx (입력만)
  → features/assessment/actions.ts (서버 액션, 계약 형식으로 변환)
  → lib/api/server.ts postAssessment()
  → POST /api/assessments  eligibility/router.py
  → eligibility/service.py assess()  (공고 버전 조회: notice/repository.py)
  → eligibility/rules.py evaluate()  ← 판정은 여기서만
  ← 결과 + 근거 → features/assessment/AssessmentResultView.tsx (표시만)
```

## 새 기능을 추가할 때

1. 업무 경계(A, B, C)를 정하고 그 폴더(`backend/app/<경계>/`)에 위 이름 규칙으로 파일을 둔다.
2. 테스트는 `backend/tests/<경계>/test_*.py`에 두고, 이름에 AC ID를 넣는다(예: `test_AC_B08_...`).
3. 프론트 UI·서버 액션·스토리는 `frontend/src/features/<기능>/`에 두고, `app/`에는 라우트(`page.tsx`)만 둔다.
