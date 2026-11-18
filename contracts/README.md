# 프론트엔드/백엔드/Agent 통신 계약 (초안)

> 이 폴더는 **데이터 교환 형식**만 소유한다. 정책·Rule Engine 진리표는 `../docs/01-domain/05-eligibility-policy.md`가 단일 기준이다.

## 상태

`DRAFT — 팀 승인 전`. `api-draft.yaml`은 개념 API를 설계한 예시이지 실제 저장소의 엔드포인트를 조사한 결과가 아니다. 실제 코드 확인 후 **하나의 API 기준**으로 갱신한다.

## 필드 의미의 일관성

- 사용자의 미입력은 `null/unknown`, `false/0`을 자동 대체하지 않는다.
- `noticeVersionId`는 필수 근거 컨텍스트, `lastCheckedAt`은 마지막 **성공한** 확인 시각. 실패 시 `freshnessStatus=CHECK_FAILED`를 별도 포함.
- `eligibilityResult`는 `ELIGIBLE/INELIGIBLE/NEEDS_REVIEW`. 각 조건은 `PASS/FAIL/UNKNOWN`. `sourceVerificationStatus`는 완전히 별개.
- `preparationStatus`는 준비 워크플로, `executionStatus`는 백그라운드 run 상태, 외부 `submitted`는 확인되지 않는다.
- `evidence`는 원문 버전+위치·문서ID를 포함한다. URL이 없거나 미검증이면 검증 완료로 표기하지 않는다.
- 출처를 의심해야 하는 모든 LLM 출력은 verified rule set을 만들기 전의 candidate 상태로 취급.

## 소비자가 지켜야 할 것

- FE: 서버가 반환한 판정을 표시할 것. 계산 로직 자체 중복 구현 금지.
- BE: 학생 리소스 권한 검사를 통과한 데이터만 반환. 입력 값/단위/버전 검증.
- Agent: 완료 텍스트 대신 구조화 결과·근거·문항 검사 결과를 반환하고 업무 상태 변경은 검증된 application 계층에서 실행.
- 관리자: 사용자 계정 권한 확인; 검토 결정은 원문-추출 정합성에 한정.

`examples/`는 테스트 **가상 자료**, 실제 장학금·API 응답 증거가 아니다.
