# Scholarship AI — Claude가 바로 참고하는 업무·제품·설계 기준서

> 버전 `2026-11-18-rebuild-2` | 상태: **팀 검토용 실행 가능 초안**. 문서가 존재한다는 것은 기능 구현 완료를 뜻하지 않는다.
>
> 대상: 장학금 통합 지원 AI / 팀 4조 귀택부. 원본 업무 A. 수집·검증 / B. 판정·추천 / C. 신청 준비의 **의미를 바꾸지 않고** 설명하고 설계한다.

## 이 패키지를 쓰는 가장 빠른 방법

1. **저장소 루트에** `CLAUDE.md`, `AGENTS.md`, `docs/`, `contracts/`, `examples/`를 복사한다. `reference/`는 원본 근거 참고용이다.
2. Claude Code 작업 시작 시 `CLAUDE.md`의 필독·작업별 경로를 따라간다. **각 문서가 자기 책임 한 가지만 수행**하므로 전체 텍스트를 계속 복붙할 필요가 없다.
3. 새 작업은 `docs/04-delivery/03-task-template.md`에 업무 ID, 원문 근거, 수용 테스트를 적고 시작한다. 개발 중 도메인 규칙 발견 시 즉시 코드로 결정하지 말고 `docs/00-governance/03-open-decisions.md`에 기록한다.
4. 실제 코드 구조·테스트 명령·일정은 **저장소를 검사한 뒤에만** 확정한다. 이 문서 묶음은 현재 저장소를 직접 실행한 기록이 아니다.

## 무엇이 어느 문서의 유일한 책임인가? (Single Source of Truth)

| 책임/질문 | 유일 기준 문서 | 다른 문서가 할 일 |
|---|---|---|
| 근거와 확실성(사실/가정/미확인) | [`00/evidence.md`](docs/00-governance/01-evidence.md) | 근거 ID만 인용 |
| 결정이 필요하거나 충돌하는 문제 | [`00/open-decisions.md`](docs/00-governance/03-open-decisions.md) | 승인 전 임의 확정 금지 |
| 사람의 업무는 원래 어떻게 흘렀는가 | [`01/as-is.md`](docs/01-domain/01-as-is.md) | 제품 기능/기술을 끼워 넣지 않음 |
| 미래 업무 A/B/C · D1~D4 | [`01/to-be.md`](docs/01-domain/02-to-be.md) | 행위자, 행동, 정보만 기록 |
| 주요 업무 용어의 의미 | [`01/glossary.md`](docs/01-domain/03-glossary.md) | 용어 정의 복제 금지 |
| **업무 불변식 BR-001~** | [`01/business-rules.md`](docs/01-domain/04-business-rules.md) | 판정기·UI·프롬프트가 링크 |
| Rule Engine 진리표·OR/AND | [`01/eligibility-policy.md`](docs/01-domain/05-eligibility-policy.md) | 계산은 여기만 정의 |
| 상태/이벤트 전이 | [`01/state-machines.md`](docs/01-domain/06-state-machines.md) | 단순한 단일 status 금지 |
| 업무 객체·데이터 소유권 | [`01/domain-model.md`](docs/01-domain/07-domain-model.md) | DB 테이블 설계와 구분 |
| **어떤 제품을 만들고 안 만드는가** | [`02/PRD.md`](docs/02-product/01-PRD.md) | 기술 선택을 상세화하지 않음 |
| 업무 스토리·수용 기준 | [`02/user-stories.md`](docs/02-product/02-user-stories.md) | 수용 테스트로 검증 |
| 사용자 화면의 정보와 UX | [`02/UX-contract.md`](docs/02-product/03-UX-contract.md) | 비즈니스 계산을 중복 구현하지 않음 |
| 기술 목표 v7 & 로컬/미검증 구분 | [`03/architecture.md`](docs/03-architecture/01-architecture-v7.md) | 구현 완료 표시 금지 |
| 실행 책임과 외부 연동 | [`03/ownership.md`](docs/03-architecture/02-component-ownership.md) | 도메인 업무와 인프라 혼동 금지 |
| **왜** 이 구조인지/무엇을 포기했는지 | [`03/adr/`](docs/03-architecture/adr/README.md) | 변경 시 새 ADR로 대체 |
| HTTP/API 전달 값의 제안 계약 | [`contracts/`](contracts/) | **검토 전 DRAFT**를 코드 확정으로 간주하지 않음 |
| 검증 사례 / 유효·거부·재개 | [`04/acceptance-tests.md`](docs/04-delivery/01-acceptance-tests.md) | 코드 테스트 실행 결과 별도 |
| 팀의 DoD와 변경 프로세스 | [`04/dod.md`](docs/04-delivery/02-dod.md) | AI가 완료를 선언하는 기준 |

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

## Claude 작업 시작용 복사 프롬프트

> 이 저장소의 `CLAUDE.md`를 먼저 읽고 지키세요. 지금 작업할 업무는 [업무 ID/유저 스토리 ID]입니다. 구현 전 관련 도메인 스토리, BR 규칙, 판정 정책, 상태머신, 해당 ADR과 계약을 순서대로 확인하세요. 먼저 `확인된 사실 / 설계상 가정 / 미결정`을 구분하고, 영향받는 파일과 테스트를 짧게 제시하세요. 업무 규칙을 임의로 확정하거나 기존 테스트를 약화하지 마세요. 구현 후 실행한 검사만 사실대로 보고하세요.

## 설계 입력과 런타임 프롬프트

- `reference/team-business-brief.md` — 팀이 직접 정의한 A/B/C·D1~D4·알림·범위 제외의 **원래 의도 스냅샷**. **원본 미확보 — OPEN-17.**
- [`reference/architecture-v7.html`](reference/architecture-v7.html) — v7 아키텍처 원본 보존.
- [`prompts/`](prompts/README.md) — 공고 추출/검증/판정 설명/초안 **AI 역할별** 프롬프트 계약. 판정은 LLM이 아니라 Rule Engine.

## 이 패키지가 **하지 않은 일**

- 학과 GitHub 실제 저장소 코드와 현재 환경을 열어 확인하거나 테스트를 실행한 것은 아니다.
- 실제 공공데이터 API/기관 공고의 개별 자격 규칙을 검증한 것이 아니다.
- 시험용 예시의 수치·학생·공고·학년·소득구간은 실존 장학금 조건이 아니다.
- 교수님이 정량적으로 요구한 최대 동시사용자, RPS, SLA, 예산은 제공된 자료에 숫자가 없다.
- 설계 v7에 적힌 `구현 완료 로컬 랩`은 **설계 문서의 진술**이며 코드/데모 독립 검증은 별도다.

**핵심 방침:** 문서를 늘리는 것보다 **한 규칙의 주인을 하나로 정하고, 누가 언제 그 규칙을 사용하며 어떻게 깨졌는지 시험할지 연결**한다.
