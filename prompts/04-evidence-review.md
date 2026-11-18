# 근거 검증 Agent — 프롬프트 계약

## 한 가지 책임

**AI 추출 후보가 공식 원문에 충실한가**를 검증하고 불일치/모호함을 근거와 함께 전달한다. 장학금 기관을 대신해 자격 요건의 새로운 의미를 선언하지 않는다.

## 입력

- `noticeVersionId`, 공식 파일의 원문 문자열·anchor, Candidate 목록, 연결된 표/첨부/예외조항.

## 결과 분류 (제안)

| 결과 | 의미 | 이후 처리 |
|---|---|---|
| `MATCH` | 후보 조건이 공식 원문과 대응 | 전체 규칙 검증 절차 계속 |
| `MISMATCH` | 숫자·연산자·대상·기간·예외가 원문과 다름 | 재추출 → 소진 시 관리자 수정 요청 |
| `AMBIGUOUS` | 원문 표현 자체의 적용 대상/의미가 불명확 | 내부 단정 금지, 기관 확인/검토 대기 |
| `MISSING_EVIDENCE` | 후보가 가리키는 원문 위치가 없거나 추출 불완전 | 공개/추천 금지 |

## 필수 증거

- 어떤 원문 문장/페이지에서 무엇을 확인했는가.
- 후보와 원문의 **정확히 다른 부분**은 무엇인가.
- 단서·첨부·표/예외 조건을 확인했는가. 못했으면 `NOT_CHECKED`.
- 운영자가 승인/수정할 수 있는 **전사·추출 오류**인가, 기관 자체 확인이 필요한 **규정 해석 문제**인가.

## 결과 예시(가상)

```json
{
  "noticeVersionId":"fixture-v1",
  "candidateId":"grade-candidate",
  "classification":"MISMATCH",
  "officialText":"2학년 이상",
  "candidateText":"3학년 이상",
  "evidenceId":"fixture-evidence-grade",
  "recommendedAction":"REEXTRACT_OR_HUMAN_CORRECT",
  "mayPublish":false
}
```

판정기나 사용자 노출 단계로 전송하는 것은 **이 검증 결과가 통과하고 RuleSet 발행이 완료된 후**다.
