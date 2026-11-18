# CLAUDE.md — 장학금 통합 지원 AI 팀의 개발 계약

> 이 문서는 **AI 행동 규칙**만 담당한다. 제품 요구사항은 PRD, 도메인 의미는 `docs/01-domain`, 기술 결정은 ADR에서 확인한다. 충돌하면 혼자 새 의미를 만들지 않는다.

## 0. 프로젝트 한 줄
대학생이 **공식 장학금 공고**를 발견하고, 해당 버전의 조건을 본인 사실과 비교해 **조건별 근거가 있는 지원 가능/불가/확인 필요**를 확인하고, **서류 체크리스트·발급 방법·작성 초안**으로 신청을 준비하도록 돕는 서비스다. **제출/증빙 발급/기관 심사/지급은 서비스가 하지 않는다.**

## 1. 작업별로 읽을 문서 (2~4개만)

모든 작업에 공통으로 아래 §2 비타협 규칙과 [`docs/01-domain/04-business-rules.md`](docs/01-domain/04-business-rules.md)를 적용한다. 그 외에는 해당 작업 줄의 문서만 읽는다.

| 작업 | 읽을 문서 | 핵심 주의 |
|---|---|---|
| 자격 판정 / Rule Engine | [`05-eligibility-policy.md`](docs/01-domain/05-eligibility-policy.md), [`01-acceptance-tests.md`](docs/04-delivery/01-acceptance-tests.md) §B, [`examples/eligibility-cases.json`](examples/eligibility-cases.json) | 미검증·빈 규칙은 ELIGIBLE 금지, AND/OR 전수 테스트 먼저 |
| 공고 수집·버전·검증 | [`08-notice-governance.md`](docs/01-domain/08-notice-governance.md), [`06-state-machines.md`](docs/01-domain/06-state-machines.md) §2, [`01-acceptance-tests.md`](docs/04-delivery/01-acceptance-tests.md) §A | 접속 실패 ≠ 변경 없음, 검증 실패 후보는 Rule Engine에 넘기지 않음 |
| 관리자 검토 | [`08-notice-governance.md`](docs/01-domain/08-notice-governance.md), [`06-state-machines.md`](docs/01-domain/06-state-machines.md) §5, [`01-acceptance-tests.md`](docs/04-delivery/01-acceptance-tests.md) §D | 검토는 추출 정합성만, 기관 해석 대행 금지 |
| 질문·대기·재개 / 신청 준비 / 초안 | [`09-application-preparation.md`](docs/01-domain/09-application-preparation.md), [`06-state-machines.md`](docs/01-domain/06-state-machines.md) §4, [`04-agent-workflow-contract.md`](docs/03-architecture/04-agent-workflow-contract.md), [`examples/preparation-cases.json`](examples/preparation-cases.json) | 같은 case ID 유지, 준비 ≠ 제출, 증빙 업로드 금지 |
| API / UI | [`03-UX-contract.md`](docs/02-product/03-UX-contract.md), [`contracts/README.md`](contracts/README.md), 해당 기능의 AC, 화면 시안 [`screens/README.md`](screens/README.md)(참고용), 디자인 시스템 [`docs/05-design-system/README.md`](docs/05-design-system/README.md) | 프론트·채팅 문장에서 자격 계산 금지 |
| AI 프롬프트 / LLM 단계 | [`prompts/README.md`](prompts/README.md), [`04-agent-workflow-contract.md`](docs/03-architecture/04-agent-workflow-contract.md) | 추출·설명·초안 프롬프트를 판정에 사용 금지 |
| 인프라 / AI 실행 | [`01-architecture-v7.md`](docs/03-architecture/01-architecture-v7.md), 관련 [`adr/`](docs/03-architecture/adr/README.md) | v7은 목표 설계, 자체 Worker 제거 금지(ADR-0007) |
| 제품 범위·우선순위 | [`01-PRD.md`](docs/02-product/01-PRD.md), [`03-open-decisions.md`](docs/00-governance/03-open-decisions.md) | `PROPOSED`는 자동 승인 아님 |
| 코드 위치가 헷갈릴 때 | [`docs/CODEMAP.md`](docs/CODEMAP.md) | 판정 계산은 `backend/app/eligibility/rules.py`에서만 |
| 용어가 헷갈릴 때 | [`03-glossary.md`](docs/01-domain/03-glossary.md), [`07-domain-model.md`](docs/01-domain/07-domain-model.md) | — |

시작·완료 체크리스트와 보고 양식은 모든 작업 공통으로 [`docs/04-delivery/workflow.md`](docs/04-delivery/workflow.md)를 따른다.

## 2. 비타협 규칙

1. **공식 원문 우선.** 검색 결과/벡터 검색/LLM 출력은 공고 조건의 최종 근거가 아니다. 검증된 공식 원문 **버전·문장 또는 위치·확인 시각**을 연결한다.
2. **3값 판정 고정.** `FAIL` 확정이면 불가; FAIL 없이 UNKNOWN이 있으면 확인 필요; 모든 필수 조건이 `PASS`면 가능. 단, 이 단순 규칙은 **검증된 AND 필수조건**의 예이고 공고의 OR·예외·가산점/우선순위를 임의로 AND로 평탄화하지 않는다. 정확한 규칙은 `05-eligibility-policy.md` 참조.
3. **추측 금지.** 프로필 미입력=UNKNOWN이지 FAIL/0이 아니다. 원문이 모호하면 관리자가 **추출 정합성**만 검토할 수 있고 기관의 최종 해석을 대신하지 않는다.
4. **LLM 판정 금지.** LLM은 조건 추출 후보/질문 표현/결과 설명/초안을 맡을 수 있지만, Rule Engine의 구조화된 판정 결과를 교체할 수 없다.
5. **버전 규칙.** 변경 공고의 새 버전이 검증되기 전 옛 판정을 새 판정으로 표시하지 않는다. 공고 최신 확인 **실패**는 `변경 없음`과 다르다.
6. **준비 != 접수.** `PREPARED`나 초안 다운로드는 공식 `SUBMITTED`가 아니다. 연동이 없는 한 외부 제출 여부는 확인 불가.
7. **학생 개인 증빙서류 수집 금지 (v6/v7 범위).** 발급 안내만. 이 기능을 원하면 사전 제품 범위 변경+개인정보/보안 검토 필요.
8. **관리자 내부 검토 != 장학금 기관 심사.** 미검증 조건 공개 금지; 승인·수정·반려 사유와 공고 버전을 기록한다.
9. **권한 및 개인정보.** 학생 본인 자료만 접근, 내부 관리자 권한 구별. 소득/성적/신청 초안/비밀키를 로그·프롬프트 원문·테스트 스냅샷에 무분별하게 기록하지 않는다.
10. **중단/재개/재시도.** 같은 준비 건과 질문 ID를 유지, 중복 요청·재실행이 논리적 신청과 결과를 중복 생성하지 않게 한다. 외부 발송까지 완전 정확히 한 번이라고 주장하지 않는다.
11. **목표 설계 != 구현 완료.** v7 Agent Server는 라이선스·단일 그래프 PoC·중단/재개·복구 검증 후 채택. 통과 전에 자체 Worker를 제거하지 않는다.
12. **문서 단일 책임.** 규칙·수용 기준은 주인 문서 한 곳에만 쓰고 다른 곳은 ID로 인용한다. 물결표·슬래시로 묶은 범위 표기 대신 개별 ID를 쓰고, 문서·ID를 바꾸면 `python3 tools/check_pack.py`를 통과시킨다.

## 3. 작업 절차 (반드시 출력)

- **구현 전:** 바꾸는 사용자 행동과 출처(ST/FR/BR/AC/ADR), 결정된 사실 vs `OPEN-…`, 모듈의 한 가지 책임, 영향받는 계약·상태·버전·권한, 실패 시 안전한 처리, 추가 테스트. **결정이 없는 도메인 정책은 구현하지 말고** OPEN으로 제안+대안+위험을 적는다.
- **구현 중:** 계산 규칙은 구조화된 도메인 서비스 한 곳에만. AI 응답은 검증 전 후보. 원문·판정 근거·관리자 결정은 이력으로 남기고 in-place 덮어쓰기 금지. 새 패키지/서비스/큐/저장소는 ADR 제안부터. 스키마 변경은 마이그레이션과 기존 버전 처리 계획 포함.
- **구현 후:** 실행한 명령과 실제 결과 vs 실행하지 않은 검사를 구분하고, [`workflow.md`](docs/04-delivery/workflow.md) 완료 조건과 보고 양식(`변경 기능 / 근거한 규칙 / 테스트 결과 / 미해결 / 문서 변경`)을 따른다.

## 4. 변경 우선순위 / 판단 권한
- **도메인 판단:** 공식 공고/팀에서 승인한 `docs/01-domain` > Claude의 일반적 추측.
- **제품 범위:** 팀 승인된 PRD > 임시 구현 아이디어. `PROPOSED`는 자동 승인 아님.
- **기술 선택:** 기존 v7 + ADR은 목표 설계; 실제 실행 환경은 저장소에서 확인. 양쪽이 다르면 이슈를 보고한다.
- **시험용 fixture:** 도메인 예시일 뿐 실제 장학금 규정이 아니다.
- **화면/문구:** 미확인 상태를 숨기거나 `가능`처럼 과장하지 않는다.

## 5. 커밋 규칙
- **형식:** `type(#이슈): 설명` (Conventional Commits). type은 `feat`, `fix`, `test`, `refactor`, `chore`, `docs`, `style` 중 하나. 예: `test(#27): AND rule fails when income exceeds limit (red)`.
- **한 커밋 = 한 가지 변경.** TDD는 `test … (red)` → `feat … (green)` → 필요 시 `refactor`.
- **커밋 전:** 바뀐 파일을 다시 보고, 관련 테스트·lint를 실행한다. 본문 한 줄은 100자 이내.
- **hook을 우회하지 않는다.** pre-commit(lint-staged: ESLint·Prettier·ruff)과 commit-msg(commitlint)가 실패하면 원인을 고친다. `--no-verify` 금지. hook은 로컬 검사일 뿐이며 전체 타입 검사·테스트는 CI가 맡는다.
