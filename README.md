# Scholarship AI — Claude가 바로 참고하는 업무·제품·설계 기준서

> 버전 `2026-11-18-rebuild-2` | 상태: **팀 검토용 실행 가능 초안**. 문서가 존재한다는 것은 기능 구현 완료를 뜻하지 않는다.
>
> 대상: 장학금 통합 지원 AI / 팀 4조 귀택부. 원본 업무 A. 수집·검증 / B. 판정·추천 / C. 신청 준비의 **의미를 바꾸지 않고** 설명하고 설계한다.

## 시작하기

1. Claude Code·Codex 등 AI 도구는 [`CLAUDE.md`](CLAUDE.md)(또는 [`AGENTS.md`](AGENTS.md))부터 읽는다. 작업 종류별로 읽을 문서 2~4개가 표로 정리돼 있다.
2. 작업 시작·완료 체크리스트와 보고 양식은 [`docs/04-delivery/workflow.md`](docs/04-delivery/workflow.md).
3. 개발 중 도메인 규칙의 빈틈을 발견하면 코드로 결정하지 말고 [`docs/00-governance/03-open-decisions.md`](docs/00-governance/03-open-decisions.md)에 기록한다.
4. 문서나 ID를 고쳤으면 `python3 tools/check_pack.py`로 링크·ID 정의·FR↔AC 연결을 검사한다.

## 로컬 실행 (Docker)

필요한 것: Docker + Docker Compose. 비밀값은 `.env`에 두고 커밋하지 않는다(`.env.example` 참고).

```bash
docker compose up --build              # 프론트 http://localhost:3000, 백엔드 http://localhost:8000
curl http://localhost:8000/api/health  # {"status":"ok"}
curl http://localhost:3000/api/health  # Next.js가 /api를 백엔드로 전달(rewrites)

docker compose run --rm backend pytest                                # 백엔드 테스트
docker compose run --rm backend sh -c "ruff check . && ruff format --check ."  # 백엔드 린트·포맷 검사
docker compose run --rm frontend sh -c "npm run lint && npm run build"         # 프론트 린트·타입 검사·빌드
```

- 백엔드 코드는 `backend/app/`에 있다. 자격 판정 계산은 `backend/app/domain/eligibility/` 한 곳에서만 한다.
- 프론트 코드는 `frontend/src/`에 있다(Next.js App Router + TypeScript, [ADR-0013](docs/03-architecture/adr/0013-nextjs-app-router-frontend.md)). 서버 컴포넌트가 기본이며, 서버 컴포넌트를 포함해 프론트는 판정 결과를 표시만 하고 자격을 계산하지 않는다. FastAPI 서버 호출은 `frontend/src/lib/api/server.ts`(서버 전용).
- 의존성을 바꾸면 이미지를 다시 빌드한다: `docker compose build`.

## 무엇이 어느 문서의 유일한 책임인가? (Single Source of Truth)

| 책임/질문 | 유일 기준 문서 |
|---|---|
| 근거와 확실성(사실/가정/미확인), 누가 결정하는가 (EV) | [`00-governance/01-evidence.md`](docs/00-governance/01-evidence.md) |
| 미결정·충돌 문제 (OPEN) | [`00-governance/03-open-decisions.md`](docs/00-governance/03-open-decisions.md) |
| 현재 업무(AS-IS)와 미래 업무 A/B/C · D1~D4 | [`01-domain/02-to-be.md`](docs/01-domain/02-to-be.md) |
| 용어의 의미 | [`01-domain/03-glossary.md`](docs/01-domain/03-glossary.md) |
| 업무 불변식 (BR) | [`01-domain/04-business-rules.md`](docs/01-domain/04-business-rules.md) |
| Rule Engine 진리표·AND/OR | [`01-domain/05-eligibility-policy.md`](docs/01-domain/05-eligibility-policy.md) |
| 상태·전이 | [`01-domain/06-state-machines.md`](docs/01-domain/06-state-machines.md) |
| 업무 객체·데이터 소유권 | [`01-domain/07-domain-model.md`](docs/01-domain/07-domain-model.md) |
| 공고 공식성·버전·근거 | [`01-domain/08-notice-governance.md`](docs/01-domain/08-notice-governance.md) |
| 신청 준비·질문·초안 | [`01-domain/09-application-preparation.md`](docs/01-domain/09-application-preparation.md) |
| 제품 범위 (FR·NFR), 유저 스토리 (ST·OP), 구현 순서 (S0~S5) | [`02-product/01-PRD.md`](docs/02-product/01-PRD.md) |
| 화면에 보여야 할 의미 | [`02-product/03-UX-contract.md`](docs/02-product/03-UX-contract.md) |
| v7 목표 아키텍처, 컴포넌트 책임, 장애 시나리오 | [`03-architecture/01-architecture-v7.md`](docs/03-architecture/01-architecture-v7.md) |
| AI 그래프 노드 입출력 | [`03-architecture/04-agent-workflow-contract.md`](docs/03-architecture/04-agent-workflow-contract.md) |
| 기술 선택의 이유·대안 (ADR, 결정 이력) | [`03-architecture/adr/`](docs/03-architecture/adr/README.md) |
| 수용 테스트 (AC)와 FR↔AC 연결 | [`04-delivery/01-acceptance-tests.md`](docs/04-delivery/01-acceptance-tests.md) |
| 작업 시작·완료·변경 절차 | [`04-delivery/workflow.md`](docs/04-delivery/workflow.md) |
| API 제안 계약 (DRAFT) | [`contracts/`](contracts/README.md) |
| 테스트용 가상 데이터 | [`examples/`](examples/README.md) |
| 런타임 AI 프롬프트 계약 | [`prompts/`](prompts/README.md) |

다른 문서는 위 원본의 내용을 다시 쓰지 않고 ID와 링크로만 인용한다.

## 업무 지도의 최단 경로

```text
학생(검색어·조건을 이해하기 어려움)
      ↓
A. 등록된 공식 공고 수집 → 신규/변경/변경없음 → 원문·버전 저장 → 조건 추출
                                  ↓
                       원문 근거 검증 → (실패) 관리자 검토
                                  ↓ (검증 통과)
B. 학생 사실 + 검증된 조건 → Rule Engine(조건별 PASS/FAIL/UNKNOWN)
                                  ↓
                 지원 가능 / 지원 불가 / 확인 필요 (+ 근거·버전·시점)
                                  ↓
C. 신청 준비 직전 최신성 재확인 → 서류 체크리스트·발급 방법 → 사실 기반 초안
              ↕ (필요하면 질문/중단/재개)             ↓
                     학생이 확인·다운로드 → 외부 공식 사이트에 직접 제출

별도: 신규·변경 공고 중 검증된 대상 → 가능 학생 판정 → 알림함/푸시(구현 단계 별도)
```

## 설계 원본 자료

- `reference/team-business-brief.md` — 팀이 직접 정의한 A/B/C·D1~D4·알림·범위 제외의 **원래 의도 스냅샷**. **원본 미확보 — OPEN-17.**
- [`reference/architecture-v7.html`](reference/architecture-v7.html) — v7 아키텍처 원본 보존.

## 이 패키지가 **하지 않은 일**

- 학과 GitHub 실제 저장소 코드와 현재 환경을 열어 확인하거나 테스트를 실행한 것은 아니다.
- 실제 공공데이터 API/기관 공고의 개별 자격 규칙을 검증한 것이 아니다.
- 시험용 예시의 수치·학생·공고·학년·소득구간은 실존 장학금 조건이 아니다.
- 교수님이 정량적으로 요구한 최대 동시사용자, RPS, SLA, 예산은 제공된 자료에 숫자가 없다.
- 설계 v7에 적힌 `구현 완료 로컬 랩`은 **설계 문서의 진술**이며 코드/데모 독립 검증은 별도다.

**핵심 방침:** 문서를 늘리는 것보다 **한 규칙의 주인을 하나로 정하고, 누가 언제 그 규칙을 사용하며 어떻게 깨졌는지 시험할지 연결**한다.
