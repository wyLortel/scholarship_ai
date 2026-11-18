# 장애·재시도·보안 품질 시나리오

> 책임: 운영 실패가 발생할 때 **무엇을 보존하고 무엇을 검증**할지. 비즈니스 판정 의미는 domain을 참조한다.

## 1. 장애 유형과 대응 목표

| 실패 주입 | 기대 동작 | 검증 포인트 | 불확실성 |
|---|---|---|---|
| API DB 커밋 직후 종료 | outbox가 남아 추후 run 생성 가능 | 준비 건 1개/전달 재시도 | 코드 필요 |
| Relay가 run 생성 직후 종료 | 중복 전송에도 논리적 run/결과 중복 방지 | idempotency key, UNIQUE | Agent API의 멱등 지원은 PoC 필요 |
| Agent Server Worker 종료 | checkpoint를 통해 안전한 중단/복구 | resume·중복 결과·처리시간 | 자체 호스팅 방식 확인 필요 |
| Crawler가 XREADGROUP 후 중단 | `XAUTOCLAIM`/DLQ로 미완료 수집 재처리 | duplicate 검증·원문 1개 논리 버전 | AOF/vol 유지 필요 |
| Redis 데이터 손실 | DB의 미완료 작업을 재정합성 검사로 복구 | 누락된 run/수집 job 탐지 | Reconciliation 동작 실제 검증 필요 |
| S3 업로드 성공, DB 커밋 실패 | 파일은 임시/고아로 남고 정리 대상 | 참조 일관성, 중복 해시 | S3+DB 원자성 불가 |
| 기관 사이트/LLM 429·시간초과 | 제한 재시도·Backoff, 실패 가시화 | 무한 루프/비용 방지 | 수치 OPEN-12 |
| 공고 변경 중 학생 준비 | 이전 판정/초안 최신성 무효, 새 검증값으로 재판정 | stale 안내·중단 이유 | 정책 OPEN-04 |
| 학생 권한으로 남의 평가 조회 | 요청 거절 | 403 또는 권한을 노출하지 않는 방식 검토 | auth 구조 조사 필요 |
| 푸시 요청 후 네트워크 종료 | 알림 기록과 실제 푸시의 불확실성 분리 | 중복 발송/실패 모니터링 | end-to-end exactly-once 단정 금지 |

## 2. ‘한 번만 처리’의 정확한 의미

- **논리적 업무 건 하나**: `Idempotency-Key`와 DB UNIQUE로 중복 접수 방지.
- **실행 결과 하나**: 동일 version/fact/run 식별키의 결과 삽입을 UNIQUE/UPSERT로 보호.
- **외부 부작용**: LLM 호출·FCM push·S3 업로드는 네트워크 실패에서 **정확히 한 번 실행되었다고 보장할 수 없음**. 실제 외부 시스템 멱등 API 확인, 기록·재정합성 필요.
- **Outbox 만능 아님**: outbox `delivered` 이후 Agent/Redis에서 데이터가 사라지면 정합성 재검사가 필요(v7 ⑮).

## 3. 백프레셔·자원 격리

- API: 요청 제한/timeout/DB pool 제한, 긴 작업은 접수와 별도.
- Agent: 학생별 동시 준비 작업, 전체 run 동시 실행 수 제한.
- 알림: 건수/토큰 묶음·발송 속도 제한, 신청 준비 대기열과 자원 경합 관측.
- Crawler: 고유 수집키/스케줄러 중복 등록 방지, robots/서버 부하 정책.
- 목표 RPS, 실제 API p95, 가장 오래된 큐 대기 시간은 아직 팀 숫자 없음.

## 4. 운영 지표

- 기술: `API RPS/p95/p99/5xx`, DB 연결 지연, Redis pending, run 대기/실행/실패/재시도, external API 지연·비용, crawler 마지막 성공 시각.
- **도메인:** 근거 검증 실패율, 재추출 실패/검토 대기, UNKNOWN 원인별 비율, 변경 공고 재판정 지연, 과거 판정의 최신 오노출 건수.
- `trace_id`는 API → outbox → Agent Server → MCP까지 전달; 민감한 프로필 값/본문은 로깅하지 않는다.
