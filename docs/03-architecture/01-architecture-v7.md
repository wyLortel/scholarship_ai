# v7 목표 아키텍처 해설 — 설계 사실 vs 실제 확인

> 책임: **어떤 컴포넌트와 데이터 흐름을 목표로 설계했는가**. 선택 이유/대안/대가의 단일 원본은 ADR; 업무 규칙은 도메인 BR. 이 문서는 **배포 완료 증빙이 아니다.**

## 1. 왜 시스템이 이렇게 복잡한가

프로젝트 팀은 제한된 기간·인력으로 개발하지만 **교수님의 대규모 사용자 가정을 고려**해야 했다(`EV-09`). 동시에 ① AI 작업이 오래 걸리고 ② 학생 답변·관리자 검토로 중단·재개되어야 하며 ③ 공고 정확성·버전·근거 추적이 필수다. 따라서 v7은 기능과 비동기 작업·안정성 책임을 분리한 **확장 목표**를 그린 것. **대규모 구현/성능 검증 완료를 뜻하지 않는다.**

## 2. v7 단일 EC2 배치 — 8개의 컨테이너

| 실행 요소 | 수 | 책임 | 주의 |
|---|---:|---|---|
| Nginx + React 웹 서버 | 1 | 브라우저 화면·HTTPS·`/api` 프록시 | 단일 EC2 장애에 함께 영향 |
| FastAPI | 1 | 사용자 인증/권한, 요청 입구, 업무 데이터+outbox 접수 | 긴 AI 작업 자체를 동기로 수행하지 않음 |
| Redis | 1 | 자체 `crawler_jobs` Stream, Agent Server 내부 실행 큐/스트리밍 의존성 | 업무 영속의 단일 원본 DB 아님 |
| Outbox Relay (Python) | 1 | DB outbox → Agent Server run 전달·전달 상태 갱신 | 중복 전달 가능 → 멱등성 필요 |
| Crawler (Playwright, 내장 scheduler) | 1 | 공고 수집·신규/변경 감지, 원문·메타 저장 | 확대 배치 시 scheduler 중복 등록 위험 |
| LangGraph Agent Server | 2 | 분석/질문/작성/알림 그래프, run/checkpoint, interrupt/resume | **조건부 전환 목표**. 현재 PoC 통과 확인 안 됨 |
| MCP Tool 서버 | 1 | 그래프에 공식 검색/조회/문서 파싱 도구 제공 | 학생 본인 자료만 조회, DB는 읽기 전용 |

8개의 컨테이너지만 **EC2 1대**이므로 서버 장애를 격리하는 HA가 아니다. Agent Server 2개는 *프로세스 수준* 장애 대응을 목표로 하며 실제 복구는 검증 필요.

## 3. EC2 외부의 관리형·외부 서비스

- **RDS PostgreSQL + pgvector:** 회원, 공고 버전/근거, 규칙, 평가, 준비, 검토, 알림 이력; Agent Server thread/run/checkpoint는 **별도 database**에 기록하는 목표. RDS 자체가 최종 운영 배포됐다는 증거는 없음.
- **S3:** 공식 원문 PDF/HWP/첨부 및 작성 초안 파일. DB에는 파일 위치·버전/메타 참조. 비공개·임시 presigned 다운로드.
- **FCM:** 기기에 푸시. 개별 알림함 기록과 구분. 목표 그림은 최대 500 토큰 묶음/요청, 실제 SDK·API 제한 및 방식은 사용하는 버전에서 재확인 필요.
- **외부 공식 기관/공공데이터, 검색 API, LLM API:** 공식 근거/추출·설명/임베딩. 공식성 검증과 비용/약관 필요.

## 4. 학생이 준비를 시작하면 (v7 기술 데이터 흐름)

```mermaid
sequenceDiagram
    actor S as 학생
    participant FE as React/Nginx
    participant API as FastAPI
    participant DB as RDS 업무 DB
    participant O as Outbox Relay
    participant AG as Agent Server(조건부)
    S->>FE: 신청 준비 시작
    FE->>API: 인증된 요청 + Idempotency-Key
    API->>DB: PreparationCase + outbox 같은 트랜잭션
    API-->>S: 접수 ID 반환 (준비 완료 아님)
    O->>DB: 미전송 outbox 조회
    O->>AG: run 생성 (중복 방지 고유키)
    AG->>DB: 실행 상태/checkpoint 저장
    AG-->>FE: 질문 알림/진행 상황(실제 전달 경로 구현 검증 필요)
    S->>API: 답변 + question ID
    API->>DB: 답변/재개 outbox 기록
    O->>AG: resume 요청
    AG->>DB: 최종 체크리스트/초안 업무 결과 저장
    FE->>API: 준비 상태 조회
    API-->>S: 결과/다운로드 링크/확인 사항
```

핵심은 `응답(accepted)`과 `실제 작업 완료`를 구분하는 것. 작업 대기/재개는 DB 업무 기록과 그래프 체크포인트가 **각각 역할**을 가진다.

## 5. 공고를 가져오면

`Crawler 스케줄 → Redis crawler_jobs → 원문·첨부 S3 → NoticeVersion+outbox 같은 DB 트랜잭션 → Relay → Agent Server 조건 추출/근거 검증 → VerifiedRuleSet 저장·인덱싱 → 학생 프로필 평가 → 가능 학생에게 알림함/FCM`.

- `변경 없음`은 분석 생략. `접속 실패`는 변경 없음으로 취급하지 않음.
- 출처와 규칙 검증은 별개. 검증 실패 시 관리자 검토 대기(공개 불가).
- MCP 도구는 AI가 **그때 필요할 때** 조회; Crawler는 **주기적 수집**. 동일한 크롤러 기능을 MCP로 또 구현하지 않음.

## 6. 무중단/정확성은 별개

| 관심사 | v7의 설계 대응 | 아직 필요한 실제 확인 |
|---|---|---|
| 요청 지연 | FastAPI와 긴 AI 작업 분리 | 접수 p95, 대기·실행시간 각각 측정 |
| 작업 유실 | Outbox + 재정합성 검사, Agent Server checkpoint | DB commit 직후 종료, Relay 중복, Server 종료 시험 |
| 수집 작업 중복/장애 | Redis Stream `XACK/XAUTOCLAIM/DLQ` | 강제 종료·재처리·중복 원문 시험 |
| DB-파일 불일치 | S3 임시 업로드→DB 기록→검증 상태 전환, 고아 파일 정리 | 실패 주입 시험 |
| API·LLM 폭주 | 백프레셔·동시 수·요청 제한·타임아웃 | 실제 목표 RPS/동시수 미정 |
| 개인정보 | IAM, private bucket, 본인 인증, 읽기 전용 MCP, 로그 최소화 | IDOR/토큰/키 관리 검증 |
| 자격 정확성 | 검증된 공식 원문, Evidence, Rule Engine, UNKNOWN, 관리자 검토 | 규칙 회귀·변경 버전 판정 시험 |

## 7. 구현 상태 3층으로 구분

| 층 | 자료에 나타나는 상태 | 말할 수 있는 것 | 말하면 안 되는 것 |
|---|---|---|---|
| L0 로컬 Scholarship Lab | v7이 Compose, PostgreSQL, MinIO, mock-sites, Mock LLM/알림, MCP 3개가 이미 구현되었다고 적음 | **원본 문서상 구현 주장 있음** | 이 세션에서 코드 실행 증빙 확보했다고 주장 |
| L1 목표 배포 | EC2/RDS/S3/실 API/Playwright/FCM/Agent Server 등 | **설계 v7 목표** | AWS 배포·실사용자 처리 검증 완료 |
| L2 검증 게이트 | Agent Server 라이선스 확인, 특정 신청서 그래프 PoC, 강제 종료·interrupt 재개·중복·스트리밍 시험 | **전환 전에 해야 할 조건** | 이미 통과한 것으로 처리하거나 기존 Worker 즉시 제거 |

## 8. 추가로 정확히 검증할 질문

- Agent Server 자체 호스팅이 가능한 라이선스/비용/배포 방식? (**공식 문서 확인 필수**) 
- Agent Server가 실행 중 강제 종료한 run을 **어떤 조건에서** 자동 재처리하고 체크포인트와 외부 side effect는 어떻게 다루는가?
- FCM 기기당 전달 여부와 500개 묶음 제약이 선택 API SDK 버전에서 유효한가?
- RDS / pgvector 쿼리 성능과 테이블·인덱스 크기에서 병목이 어느 지점인가?
- 단일 EC2 인스턴스 사양으로 API/Redis/Agent/Crawler 8개 컨테이너를 동시에 운영할 수 있는가?

## 9. 목표 품질 시나리오 (숫자 일부 미확정)

- `Q1`: 지정 부하에 목록 API p95 2초 이하 = v7의 **실험용 합격선 예시**. 정식 SLA는 OPEN-10.
- `Q2`: AI 접수는 실제 생성/초안 완료를 기다리지 않고 작업 ID 반환.
- `Q3`: Agent Server 강제 종료 후 미완료 업무 복구 시험.
- `Q4`: 같은 요청 ID 두 번에도 논리적 준비 건 하나.
- `Q5`: 미입력은 UNKNOWN, FAIL 아님.
- `Q6`: 학생 A의 인증으로 B의 자료 접근 불가.
- `Q7`: 바뀐 원문/버전 및 마지막 확인 시각을 분리 표시.

실험에서 실패했다면 **설계 선택의 재검토 조건**이지 테스트 문서를 바꿔 성공으로 만드는 이유가 아니다.
