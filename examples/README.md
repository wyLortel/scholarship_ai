# TEST_ONLY 예제 — 실제 장학금 요건이 아니다

- `fixture-notices.json` (#24): MVP 데모·테스트용 **가상 공고 4건**. 조건별 근거(원문 문장·위치·버전·확인 시각), 서류(이유·조건부 여부·발급처), 공식 제출 URL(가상 `example.org/test-only`)을 담는다. 백엔드 로더 `backend/app/infrastructure/fixtures/notice_fixture_loader.py`가 근거 누락·TEST_ONLY 표시 누락을 거부한다.
  | 공고 | 상태 | 규칙 | 쓰는 곳 |
  |---|---|---|---|
  | `fixture-notice-a` | VERIFIED | `grade AND income` | AC-B01, AC-B02, AC-B03, AC-B08 (`eligibility-cases.json`과 같은 규칙) |
  | `fixture-notice-b` | VERIFIED | `enrolled AND (income OR multiChild)` | AC-B04 (OR 평탄화 금지) |
  | `fixture-notice-c` | REVIEW_PENDING | `gpa` | BR-A05 (목록 비노출·가능 금지) |
  | `fixture-notice-d` | VERIFIED | `{"and": []}` | AC-B05, BR-B09 (빈 규칙 → 가능 금지) |
- `api/`: #23 API 계약 예제 응답. `fixture-notices.json`과 같은 공고 ID·문구를 쓴다(테스트로 확인). 설명은 [`contracts/README.md`](../contracts/README.md).
- `eligibility-cases.json`: Rule Engine의 진리표와 판정 반환 테스트를 위한 **가상 공고·가상 학생**. `noticeVersionId`는 `fixture-notice-a-v1`(위 공고 A)이고 케이스 ID는 그대로 유지한다.
- `preparation-cases.json`: 준비 중 질문/공고 변경/초안 사실성/검토 중단 시나리오.
- 실제 수집 데이터에 섞어 운영 추천·푸시에 사용할 수 없다.
- 구현자는 이 fixture 기준으로 단위/통합 테스트를 생성할 수 있으나, **원문에 없는 규칙**을 운영 코드의 모든 장학금에 일반화해서는 안 된다.
