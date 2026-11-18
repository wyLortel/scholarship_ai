# 아키텍처 결정 기록(ADR)

> ADR의 목적은 **기술 선택의 이유/대안/비용/되돌릴 조건**을 보존하는 것이다. 상태는 `TARGET-DESIGN` 또는 `CONDITIONAL`: 실제 코드·배포 확인 전 승인 완료라고 단정하지 않는다. 중요한 변경은 과거 ADR을 지우지 않고 새 ADR에서 `Supersedes`로 연결한다.

| 번호 | 결정(제목) | 상태 |
|---|---|---|
| [ADR-0001](0001-business-boundaries.md) | 업무 경계를 A 수집·검증 / B 자격 판정 / C 신청 준비로 유지 | `TARGET-DESIGN` |
| [ADR-0002](0002-rule-engine-three-valued.md) | AI 추출·설명과 규칙 평가를 분리, PASS/FAIL/UNKNOWN 사용 | `TARGET-DESIGN` |
| [ADR-0003](0003-evidence-versioning.md) | 공고 버전 보존과 원문 근거 검증 후 색인 | `TARGET-DESIGN` |
| [ADR-0004](0004-postgres-pgvector.md) | RDS PostgreSQL + pgvector에 업무·벡터 데이터를 통합 | `TARGET-DESIGN` |
| [ADR-0005](0005-async-outbox-idempotency.md) | FastAPI 빠른 접수와 DB Outbox를 이용해 장시간 AI 작업 분리 | `TARGET-DESIGN` |
| [ADR-0006](0006-separate-work-queues.md) | Crawler는 직접 Redis Stream, AI/알림은 Agent Server 내장 실행 큐 | `TARGET-DESIGN` |
| [ADR-0007](0007-agent-server-gate.md) | LangGraph Agent Server 도입은 라이선스·PoC 합격 후 조건부 | `CONDITIONAL` |
| [ADR-0008](0008-single-ec2-eight-containers.md) | 1차 목표 배포는 단일 EC2 + 8개 컨테이너 + 관리형 RDS/S3 | `TARGET-DESIGN` |
| [ADR-0009](0009-s3-file-boundary.md) | 원문·작성 초안 파일을 S3에 두고 DB는 파일 참조/메타 관리 | `TARGET-DESIGN` |
| [ADR-0010](0010-mcp-readonly.md) | MCP는 AI의 필요 시 조회/검색 도구, 읽기 전용 DB 접근 | `TARGET-DESIGN` |
| [ADR-0011](0011-notification-workflow.md) | 검증된 신규·변경 공고의 가능 학생에게 알림함+FCM, 실행은 Agent Server 그래프 | `TARGET-DESIGN` |
| [ADR-0012](0012-no-personal-doc-uploads.md) | 개인 증빙서류는 업로드·보관·진위 검증하지 않고 발급 방법만 안내 | `TARGET-DESIGN` |
| [ADR-0013](0013-nextjs-app-router-frontend.md) | 프론트엔드는 Next.js App Router, 서버 컴포넌트 기본 (ADR-0008 웹 서버 구성 부분 대체) | `TARGET-DESIGN` |

## 업데이트 규칙

- 추상적 "좋아 보인다"로 승인하지 않는다. 해당 품질 시나리오·측정·실패 시험을 통과할 것.
- 이미 내린 과거 결정은 맥락과 당시 대가를 보존한다. 새 선택은 **새 ADR**로 대체.
- 제품 범위 변경은 PRD, 판정 규칙 변경은 BR/Policy가 먼저이며 ADR은 **기술 영향이 큰 경우에만** 작성한다.
