# 프론트엔드/백엔드/Agent 통신 계약 (초안)

> 이 폴더는 **데이터 교환 형식**만 소유한다. 정책·Rule Engine 진리표는 `../docs/01-domain/05-eligibility-policy.md`가 단일 기준이다.

## 상태

`DRAFT — 팀 승인 전`. `api-draft.yaml`은 개념 API를 설계한 예시이지 실제 저장소의 엔드포인트를 조사한 결과가 아니다. 실제 코드 확인 후 **하나의 API 기준**으로 갱신한다.

## MVP 범위 (#23, 2026-11-18)

`api-draft.yaml`에서 `x-mvp: true`인 경로만 MVP에서 구현한다. 로그인·DB 없이 TEST_ONLY fixture로 동작한다.

| 경로 | 응답 스키마 | 예제 (`../examples/api/`) |
|---|---|---|
| `GET /notices` | `NoticeSummary[]` (VERIFIED만) | `notices.list.json` |
| `GET /notices/{noticeId}` | `NoticeDetail` (조건별 원문 근거) | `notice.detail.json` |
| `POST /assessments` | `AssessmentResult` | `assessment.eligible.json`, `assessment.ineligible.json`, `assessment.needs-review.json` (요청: `assessment.request.unknown-income.json`) |
| `POST /preparation-summaries` | `PreparationSummary` (MVP 전용, 준비 건 생성 안 함) | `preparation-summary.prepared.json`, `preparation-summary.with-open-items.json` |
| 공통 오류 | `DomainError` | `error.notice-not-verified.json` |

- **미검증 공고 정책:** 공고 버전이 VERIFIED가 아니면 409 `NOTICE_NOT_VERIFIED`. VERIFIED 공고인데 규칙이 비었거나 평가할 수 없으면 200 + `NEEDS_REVIEW`(조건 `reasonCode=RULE_UNVERIFIED`/`UNSUPPORTED_OPERATOR`). 어느 쪽도 `ELIGIBLE`을 만들지 않는다.
- **근거 완결성:** 조건별 `missingEvidenceFields`가 비어 있지 않거나 `evidenceComplete=false`면 화면에 '근거 검증 완료'를 표시하지 않는다.
- **검사:** `backend/tests/test_contract_examples.py`가 예제를 이 스키마로 검사한다(계약에 없는 필드도 실패). 스키마를 바꾸면 예제와 테스트를 같이 고친다. BE 응답도 같은 도우미(`backend/tests/contract.py`의 `validate`)로 검사한다.

## 필드 의미의 일관성

- 사용자의 미입력은 `null/unknown`, `false/0`을 자동 대체하지 않는다. 요청의 `StudentFact`는 `isKnown: false`, `value: null`.
- `noticeVersionId`는 필수 근거 컨텍스트, `lastCheckedAt`은 마지막 **성공한** 확인 시각. 실패 시 `freshnessStatus=CHECK_FAILED`를 별도 포함.
- `eligibilityResult`는 `ELIGIBLE/INELIGIBLE/NEEDS_REVIEW`. 각 조건은 `PASS/FAIL/UNKNOWN`. `sourceVerificationStatus`는 완전히 별개.
- `preparationStatus`는 준비 워크플로, `executionStatus`는 백그라운드 run 상태, 외부 `submitted`는 확인되지 않는다.
- `evidence`는 원문 버전+위치·문서ID를 포함한다. URL이 없거나 미검증이면 검증 완료로 표기하지 않는다.
- 출처를 의심해야 하는 모든 LLM 출력은 verified rule set을 만들기 전의 candidate 상태로 취급.

## 소비자가 지켜야 할 것

계약을 변경할 때는 [인터페이스 설계 가이드](../docs/03-architecture/guides/04-interface-design.md)의 소비자·실패·호환성 검토 항목을 확인한다.

- FE: 서버가 반환한 판정을 표시할 것. 계산 로직 자체 중복 구현 금지.
- BE: 학생 리소스 권한 검사를 통과한 데이터만 반환. 입력 값/단위/버전 검증.
- Agent: 완료 텍스트 대신 구조화 결과·근거·문항 검사 결과를 반환하고 업무 상태 변경은 검증된 application 계층에서 실행.
- 관리자: 사용자 계정 권한 확인; 검토 결정은 원문-추출 정합성에 한정.

`examples/`는 테스트 **가상 자료**, 실제 장학금·API 응답 증거가 아니다.
