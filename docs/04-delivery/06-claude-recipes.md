# Claude 작업 프롬프트 레시피 — 범위를 제한하는 명령

> 책임: 문서를 **어떻게 읽고 코딩 지시로 바꾸는지**에 대한 실제 사용 예시. 모든 요구의 단일 기준은 이 프롬프트가 아니라 원본 문서다.

## 1. 새 기능 시작

```text
CLAUDE.md를 읽고 현재 저장소의 파일 구조와 테스트 명령을 직접 확인해. 작업 대상은 [FR-/ST-/AC-]야.
1. 해당 사용자 업무 스토리(D1~D4, A/B/C)와 BR/RulePolicy를 먼저 연결해.
2. 원본에서 정의한 사실, 이 문서가 제안한 계약, 아직 열린 OPEN 쟁점을 분리해.
3. 새 코드가 가질 한 가지 책임과 제외할 책임을 설명해.
4. 실패/모름/공고 변경/권한/중복에 대한 수용 테스트를 먼저 제안해.
5. 작고 검증 가능한 범위만 구현하고, 실제 실행 결과와 미실행을 구분해 보고해.
```

## 2. 수집 공고 검증 구현

```text
A-01·D3·D4와 BR-A01, BR-A02, BR-A03, BR-A04, BR-A05, BR-A06, BR-A07, BR-A08, BR-A09, docs/01-domain/08-notice-governance.md를 읽어.
이 기능은 '공식 원문 확인 → 신규/변경/동일/접속 실패 분류 → 원문 버전 → 추출 후보 → 근거 검증'을 담당해.
공식성 미확인 사이트나 검증 실패 후보는 Rule Engine으로 넘기지 마.
인덱스 공개/관리자 검토/구버전 stale 처리의 수용 테스트부터 보여줘.
```

## 3. 자격 판정 구현

```text
D1/D2, BR-B01, BR-B02, BR-B03, BR-B04, BR-B05, BR-B06, BR-B07, BR-B08, BR-B09, eligibility-policy 진리표, examples/eligibility-cases.json을 읽어.
Rule Engine은 VerifiedRuleSet AST와 StudentFactSnapshot으로 PASS/FAIL/UNKNOWN을 계산해야 해.
LLM·React·FastAPI 라우트에서 판정 로직을 재구현하지 마. 미검증/빈 규칙은 ELIGIBLE 금지.
AND/OR 전수 테스트, FAIL+UNKNOWN, 원문 버전 stale 테스트를 만든 다음 구현해.
```

## 4. LangGraph 신청 준비 그래프 작성

```text
C-01/D2, BR-C01, BR-C02, BR-C03, BR-C04, BR-C05, BR-C06, BR-C07, BR-C08, BR-C09, state-machines, application-preparation, agent-workflow-contract를 읽어.
우리는 신청 준비가 끝나도 기관 제출은 하지 않아. 개인 증빙 업로드 기능도 만들지 마.
그래프 노드는 최신성/판정 호출/질문/체크리스트/초안/검증의 한 책임을 갖게 제안하고, 노드 출력 타입과 interrupt/resume 저장 경계를 문서화해.
현재 Agent Server 코드를 확인하고, 자체 호스팅 라이선스/PoC 미확정이라면 기존 Worker 제거를 제안하지 마.
```

## 5. ADR 판단 요청

```text
이번에 [기술 선택]을 바꾸려 한다. 관련 ADR를 읽고 현재 문제/요구한 품질 수치/대안(최소 2개)/얻는 것/감수할 단점/롤백 조건/검증 실험을 표로 비교해.
현재 수치가 없으면 추정으로 승인하지 말고 필요한 측정을 제안해. 결정이 바뀌면 기존 ADR은 유지하고 새 ADR을 제안해.
```

## 6. 코드 리뷰

```text
PR의 변경이 [FR-/BR-/AC-]와 일치하는지 검토해.
특히 원문 검증·UNKNOWN·버전/근거·개인정보·준비/접수 분리·멱등성·실제 장애 복구 근거를 봐.
확인한 위반은 '문제/왜 위험한지/재현 상황/파일·라인/제안 수정/필요 테스트'로 분리해.
테스트를 실행하지 않았으면 통과했다고 쓰지 마.
```
