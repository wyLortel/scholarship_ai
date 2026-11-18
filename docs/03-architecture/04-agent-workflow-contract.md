# LangGraph / AI 역할별 입출력 계약 (구현 설계 초안)

> **유일 책임:** AI 작업의 경계와 노드 간 구조화된 입력·출력. 이 문서는 팀 제공 v7의 **목표 그래프를 구현 가능한 제안으로 구체화한 것**이지 기존 노드/서버 코드가 이대로 존재한다는 증거가 아니다. 공식 버전의 LangGraph/Agent Server API 지원 여부는 구현 시 확인.

## 1. 가장 먼저 구분할 두 가지 AI 작업

- **공고 분석 그래프(A):** 공식 원문 확보 → 조건 후보 추출 → 원문 대조 → 실패 시 검토/승인 → verified rule set/색인 → 새·변경 알림 후보.
- **신청 준비 그래프(C):** 시작 시 공고 최신성 재확인 → 규칙 판정기 호출 → 필요한 질문/interrupt → 학생 답변 후 resume → 체크리스트 → 초안 → 사실·문항 검사 → 학생 검토용 결과.

B의 **자격 계산은 별도 Rule Engine**. '자격 판정 Agent'라는 노드가 있다 해도, 그 노드는 구조화된 Rule Engine 함수를 호출·결과 전달할 뿐 LLM에게 판정을 위임하지 않는다.

## 2. 원문 분석 노드별 단일 책임

| 노드(개념) | 입력 | 출력(구조화) | 실패할 때 | 금지 사항 |
|---|---|---|---|---|
| `load_official_notice` | noticeVersionId/fileId | 원문·페이지/문장 위치 | `SOURCE_UNAVAILABLE` | 비공식 검색 요약을 공식 원문으로 승격 |
| `extract_condition_candidates` | 원문/첨부 + 위치 | `ConditionCandidate[]`, `evidenceAnchor[]` | 추출 불가·불명확 후보로 남김 | `VerifiedRuleSet` 자동 등록 |
| `verify_evidence` | 원문 + 후보 조건 | match/contradiction/ambiguity, anchors | 보류/재추출 제한 또는 관리자 | LLM 자신감 점수로 통과 |
| `route_review` | 실패 후보·원문·이유 | ReviewRequest ID, interrupt | 검토 대기 | 임의 자동 승인 |
| `publish_verified_rules` | 검증 완료된 조건 트리 | VerifiedRuleSet ID + 색인 참조 | DB/S3 정합성 실패 기록 | 검증 전 색인·평가 가능 처리 |
| `consider_notification` | 검증된 신규·변경 + ruleSet | 가능 학생 식별 작업 | 실패/재시도 기록 | UNKNOWN 학생 대상 확대 |

검증과 조건 추출을 분리하는 이유: **LLM이 규칙을 만들었다는 사실 자체는 정확성의 증거가 아니기 때문**. 실제 원문과 일치하는지 독립적인 확인/인간 검토 단계가 필요하다.

## 3. 신청 준비 노드별 단일 책임

| 노드(개념) | 입력 | 출력(구조화) | 실패/미확인 시 |
|---|---|---|---|
| `check_latest_notice` | noticeId/currentVersionId | 최신 확인 성공/변경/실패와 시점 | 실패를 성공으로 바꾸지 않음 |
| `evaluate_eligibility` | verified rules + StudentFactSnapshot | Rule Engine 결과 ID/조건별 내역 | 원문 불명/unsupported → 확인 필요 |
| `decide_next_step` | 평가 결과/필요 데이터 | STOP/ASK/REVIEW/PROCEED | 확정 FAIL이면 STOP |
| `request_student_fact` | UNKNOWN과 관련 규칙 | questionId/이유/expected type | `interrupt`, 기다림; 중복 질문 방지 |
| `prepare_checklist` | 공고에 기재된 서류/근거 | CheckList item[] | 미확인 발급처는 확인 필요 |
| `draft_sections` | 학생 확인 사실 + 문항 | 초안 sections + 사실 참조 | 모르는 사실은 질문/placeholder |
| `verify_draft` | 초안 + 입력 사실/문항 | unsupported assertions, required revisions | 내용 불일치면 수정 요청 |
| `publish_preparation` | 검증된 산출물·미확인 목록 | PREPARED / PREPARED_WITH_OPEN_ITEMS | 공식 SUBMITTED 생성 금지 |

## 4. AI가 반환해도 안 되는 것

- `eligible: true` 같은 근거 없는 직접 판정.
- 공식 원문 ID/스팬 없이 `3학년 이상` 같은 숫자 조건 확정.
- 모르는 학점·소득·봉사활동·수혜 이력의 상상 작성.
- 관리자 검토 없이 모호한 문구를 `verified`로 선언.
- 기관 공식 신청 완료/장학생 선발 완료.

## 5. 상태/Checkpoint 설계 시 주의

**업무 DB:** 준비 건·학생의 확정 입력·검토 결정·근거·평가·초안 버전 등을 **사업 기록**으로 저장.

**그래프 Checkpoint:** 중단된 노드를 재개하기 위한 **실행 상태**(thread/run, 다음 노드, 대기 중인 questionId/리뷰 ID). Checkpoint만 업무 데이터의 단일 원본으로 삼지 않는다.

**노드 출력:** 공유 상태를 여러 노드가 임의로 직접 수정하기보다, 각 노드가 자신이 소유한 결과 필드에 대한 **명시적 업데이트**(예: `{assessmentId, nextAction}`)를 반환하는 방식 검토. 실제 merge/reducer/복구 의미는 라이브러리 버전 및 병렬 superstep 특성 확인 후 구현한다.

**재개 연결:** `student_id`, `preparation_case_id`, `question_id`, `thread_id`의 소유권과 중복 요청 키를 일관되게 검사. 사용자에게 내부 checkpoint 상세나 복구 키를 무방비 노출하지 않는다.

**개인정보:** 그래프 상태에 소득 원문·민감한 서술을 얼마나 남길지 최소화하고 보존/삭제 정책 OPEN-08 확정. 예제에는 실데이터 사용 금지.

## 6. 각 그래프의 사람 개입 지점

1. **학생 질문:** 실제로 답할 수 있는 누락값일 때 `WAITING_STUDENT`; 답을 모르면 기관 확인 필요 남길 수 있다.
2. **관리자 검토:** 원문 대비 추출값 불일치·모호함 `WAITING_ADMIN`; 검토자는 정합성만 정한다.
3. **학생 초안 확인:** 작성 초안 생성 이후 ‘사실성 검토/다운로드’는 학생이 결정. 최종 외부 제출 확인은 시스템 범위 밖.

## 7. PoC에서 반드시 확인할 반례

- `interrupt` 상태에서 서버 재시작 → 학생 답변으로 같은 건 resume.
- `review` 대기에서 관리자 수정 후 재개 → 수정된 버전만 사용.
- 동일 재개 요청 2회 → 두 번 작성/기록·푸시하지 않음.
- Worker kill 중 DB 결과 기록 → checkpoint와 DB 이력이 서로 모순되지 않음.
- LLM 실패/잘못된 JSON/원문 접근 불가 → 3값 판정·공고 검증 등 다른 영역의 의미가 변하지 않음.

**라이선스와 Agent Server 자체 호스팅 공식 검증 전에는 현재 Worker 삭제/전환 금지.** 관련 ADR: `adr/0007-agent-server-gate.md`.
