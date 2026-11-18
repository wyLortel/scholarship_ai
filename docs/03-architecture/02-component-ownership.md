# 컴포넌트별 단일 책임·권한·통신 경계

> 책임: 누가 무엇을 **소유하고 호출**하는지. 구조 결정의 장단점은 ADR, 실제 업무 의미는 domain 문서로 넘긴다.

| 컴포넌트 | 한 가지 핵심 책임 | 주로 읽음 | 주로 씀/외부 효과 | 하지 않음 |
|---|---|---|---|---|
| Frontend (React) | 사용자에게 업무 상태를 보여주고 입력 받기 | API 결과 | 인증 요청·학생 답변/선택 | 자격 판정 조건 계산·DB 직접 조회 |
| Nginx | 웹/HTTPS와 `/api` 라우팅 | 정적 파일·서비스 주소 | 프록시 | 도메인 정책 |
| FastAPI | 권한 확인한 업무 요청 접수/조회·트랜잭션 | 인증/DB 상태 | 업무 데이터 + outbox, 응답 | 오래 걸리는 그래프 직접 실행·LLM 결과 믿고 검증 생략 |
| Crawler | 등록된 공식 출처에서 공고 원문 수집 | 소스 목록/이전 버전 | 원문 S3, 버전/수집 outbox | 학생 프로필 판정, 임의 기관 정책 결정 |
| Redis(Stream) | Crawler의 수집 대기/재처리 | `crawler_jobs` | ACK/재할당/DLQ | 장기 보존해야 할 업무 진실의 유일 저장소 |
| Outbox Relay | 영속 outbox를 실행 요청으로 옮기기 | outbox | Agent Server run 생성/보낸 기록 | 신청 업무 판단, 새 자격 계산 |
| Agent Server | 장시간 AI 그래프·중단·재개·checkpoint 실행 관리 | 도구 응답/업무 참조 | 구조화 추출 후보, 결과·초안, run/checkpoint | Rule Engine 결과에 반하는 자유 형식 판정 |
| Rule Engine (업무 모듈) | 버전 고정 규칙 AST와 학생 사실 3값 계산 | VerifiedRuleSet, fact snapshot | EligibilityAssessment | 원문 해석·LLM 설명·HTML |
| MCP Tool 서버 | Graph가 쓰는 읽기/검색/파싱 도구 제공 | 승인된 DB/공식 출처/벡터 | 읽기 응답 | 업무 DB 직접 영속 쓰기, 다른 학생 데이터 접근 |
| PostgreSQL + pgvector | 원본 메타/업무 기록/근거·임베딩 일관성 보존 | SQL 조회 | 버전·평가·케이스·이력 | 장학금 기관 권위 제공 |
| S3 | 원문/첨부/초안 파일 바이트 저장 | 파일 조회 | 파일/임시 URL | DB 업무 상태를 대체 |
| FCM 연동 | 기기에 푸시 전달 요청 | 알림 대상 | 외부 push 요청 | 자격 계산/알림함 사용자 기록의 유일 원본 |
| 내부 검토 UI/API | 정합성에 대한 사람이 내린 결정 기록 | 원문/추출/이유 | 승인/수정/반려 기록 | 기관 대신 선발 승인 |

## 도메인 책임 ↔ 실행 프로세스는 동일하지 않다

- `공고/판정/준비`는 **업무 개념 경계**. `API/Crawler/Agent/MCP`는 **프로세스 실행 경계**. 업무 경계 하나마다 별도 서버를 만들 필요가 없다.
- `Rule Engine`은 Agent Server 그래프에서 호출할 수 있지만 **판정 로직의 소유자는 Rule Engine 코드** 하나다.
- `Condition Extraction`과 `Evidence Verification`은 같은 그래프에서 이어질 수 있어도 **검증 전/후 상태는 분리**한다.
- `Notification`은 Agent Server의 알림 그래프로 실행하는 v7 제안이며, 직접 `notify_jobs` 큐를 추가하지 않는다. 실제 병목이 확인되면 분리 ADR 작성.

## 보안·거부 기본값

- 학생 API는 반드시 server-side auth+resource ownership 확인; ID를 안다고 다른 계정 자료가 열려선 안 됨.
- MCP는 read-only DB 계정 + 호출자의 student_id 격리. 도구가 넘겨받은 학생 ID 문자열을 그대로 신뢰하면 안 됨.
- 관리자 action은 관리 역할과 검토 권한 확인.
- S3 원문/초안 private; 서명 URL은 짧은 TTL/접근권한 확인. v7 예시 300초는 팀 확정값 아님.
- `trace_id`로 요청-작업 연결하되 개인정보/LLM 원문/보안 토큰의 불필요한 로깅 금지.
