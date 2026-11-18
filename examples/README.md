# TEST_ONLY 예제 — 실제 장학금 요건이 아니다

- `eligibility-cases.json`: Rule Engine의 진리표와 판정 반환 테스트를 위한 **가상 공고·가상 학생**. `noticeVersionId`가 fictitious / test-only라고 표시되어 있다.
- `preparation-cases.json`: 준비 중 질문/공고 변경/초안 사실성/검토 중단 시나리오.
- 실제 수집 데이터에 섞어 운영 추천·푸시에 사용할 수 없다.
- 구현자는 이 fixture 기준으로 단위/통합 테스트를 생성할 수 있으나, **원문에 없는 규칙**을 운영 코드의 모든 장학금에 일반화해서는 안 된다.
