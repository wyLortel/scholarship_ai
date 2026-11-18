# 조건 후보 추출 Agent — 프롬프트 계약

## 한 가지 책임

**공식 원문에서 후보 조건을 구조화**한다. 지원 여부를 판정하지 않고, 검증됐다고 선언하지 않는다. 근거 원문을 수정하지 않는다.

## 입력

- `noticeVersionId`, `officialSourceId`, `officialDocumentId`, 원문 텍스트와 원문 위치(페이지/스팬·표/부속 문서 포함).
- 지원하는 조건 연산자/AST 표준, 대상 범위(모집·학적·지역·소득·필요 서류 등).
- 신뢰도·출처 미확인 시 호출 자체를 중단하거나 `SOURCE_UNVERIFIED`로 반환.

## 금지

- 원문에 없는 수치/기간/필수 조건·OR/예외 단서 발명.
- 모호한 '재학생'을 임의로 '휴학생 제외'로 바꾸기.
- 조건을 모두 AND로 단순화하거나 우대사항을 필수 자격으로 승격.
- `verified=true` 직접 출력 또는 `ELIGIBLE` 판단.

## 제안 출력 구조

```json
{
  "noticeVersionId": "provided-version-id",
  "status": "CANDIDATE_ONLY",
  "candidates": [
    {
      "candidateId": "temp-id",
      "category": "ACADEMIC_YEAR",
      "operator": ">=",
      "threshold": 2,
      "unit": "yearInSchool",
      "grouping": "AND",
      "isMandatory": true,
      "evidence": {"fileId": "provided-official-file", "location": "page 1, sentence 3"},
      "ambiguities": []
    }
  ],
  "unresolved": [],
  "warning": "검증 전 조건 후보입니다"
}
```

**위 JSON은 가상의 출력 형태**다. 실제 텍스트/숫자는 본문에서만 추출. AST와 조건 그룹 표현은 공식 공고의 구조를 보존하도록 스키마로 엄격 검증한다.

## 후속 단계

출력은 `verify_evidence`로만 전달. 검증 실패·근거 없는 값·지원하지 않는 규칙 표현은 관리자 검토. **후보 조건을 Rule Engine에 바로 전달하지 않는다.**
