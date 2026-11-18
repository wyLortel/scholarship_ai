# components.md — 재사용 부품 명세

> 시안 01–17에서 반복되는 시각 요소를 **개발 부품**으로 재구성했다. props와 이름은 제안 API이며 시안에 명시되어 있지 않다. 구현 예제는 `frontend/src/design-system/ScholarshipUI.tsx`, 기본 스타일은 `frontend/src/design-system/components.css`.

## A. 기본 부품(Primitive)

> 구현됨(#109, `frontend/src/shared/components/`): `PrimaryButton` → `Button`, `StatusBadge` → `Badge`(색조만), `SurfaceCard` → `Panel`, `SelectField`, `InlineNotice`, 채팅 선택지 → `Chip`, 아이콘 → `Icon`. 나머지는 쓰일 때 만든다.

| 부품명 | 목적 / 필수 데이터 | Variants / States | 참조 화면 |
|---|---|---|---|
| `AppHeader` | 로고, 현재 메뉴, 로그인 상태, 알림 | guest/auth/admin, mobile, active | 01–17 |
| `AppLogo` | 장학금 AI 브랜드 (학사모 아이콘) | compact, full | 전체 |
| `PrimaryButton` | 가장 중요한 다음 행동 | primary, secondary, text, loading, disabled | 전체 |
| `StatusBadge` | 판단과 검증 상태 표시 | possible, needs-info, ineligible, blocked, demo, changed | 06–08, 10, 14–17 |
| `SurfaceCard` | 정보의 기본 묶음 | default, interactive, tinted, danger | 전체 |
| `HeroBanner` | 해당 화면 목적·설명·삽화 | marketing, onboarding, workspace | 01–04, 06–07, 09–10 |
| `TextField` | 단문 사실 입력 | default, focus, error, disabled, optional | 03–04 |
| `SelectField` | 학년·재학 상태·소득구간 선택 | default, unknown, error | 03–04 |
| `TextareaField` | 활동·경험·초안 편집 | editable, readOnly, error | 04, 09, 17 |
| `StepIndicator` | 온보딩 단계·진행 | active, complete, upcoming | 03–04 |
| `TabFilter` | 전체/새로운 장학금/준비 진행 | active, inactive, keyboard | 14 |
| `EmptyState` | 검색/기록 없음 | empty, no-match, error, recovering | 01, 06, 10 |
| `InlineNotice` | 경고·도움말·동의 | info, caution, danger, success | 전체 |
| `SectionHeading` | 제목+보조설명+보조액션 | normal, with-action | 전체 |

## B. 장학금 도메인 부품

| 부품명 | 필수 입력 | 렌더링/행동 | 참조 |
|---|---|---|---|
| `ScholarshipSummaryCard` | 장학금명, 기관, 공고 버전, 모집상태, 시연 여부 | 조건 요약 + '자격 근거 보기' / 'AI에게 물어보기' | 01, 06 |
| `ScholarshipSearchBar` | query, onSearch, currentFilters | 검색창+버튼; 검색 상태/결과 수와 분리 | 06 |
| `EligibilityStatus` | status, evaluatedAt, sourceVersion | 상태+설명(단독 확정 표현 금지) | 05–08 |
| `EligibilityConditionRow` | conditionId, conditionText, userFact, status, provenance | 원문 조건과 사실을 1:1 대조; 불명확하면 '확인 필요' | 07 |
| `EligibilitySummary` | 조건 수: 충족/확인/미충족 | 숫자 합계와 상태; 현재 정보 기준 표기 | 07 |
| `SourceEvidenceCard` | 원문 문구, 조항/페이지, 발행기관, 버전, 링크 유무 | 원문과 AI 해석을 분리; 공식 링크 없으면 미등록 표시 | 05, 07 |
| `AnnouncementVersionDiff` | beforeVersion, afterVersion, changedConditions, recheckState | 변경 전후 분리, 이전 판정 무효화 안내 | 15 |
| `DataProvenanceLabel` | verified/profile/user-answer/extracted/unverified | 사실 입력의 근거와 확인 여부 표시 | 05, 07, 09, 17 |
| `DemoDataBanner` | isDemo | '시연용 가상 공고/데이터' 명시 | 전체 demo |
| `RecruitmentStatus` | knownOpen/knownClosed/unverified, date | 자격과 모집상태를 분리 | 06–08 |

## C. 대화 및 작성 부품

| 부품명 | 입력 / 동작 | 상태 | 참조 |
|---|---|---|---|
| `ChatWorkspace` | currentThread, messages, evidence, profile | sidebar + 대화 + 우측 컨텍스트(모바일은 단일열) | 05, 08, 11, 12 |
| `ConversationItem` | scholarshipId, title, waitingState | 내 준비 중인 장학금, 진행 컨텍스트 | 05, 08, 12 |
| `ChatBubble` | role, body, sourceRefs, createdAt | assistant/user, streaming, failed | 05, 08, 11, 12 |
| `QuickReplyChips` | options[], onChoose | wrap, selected, disabled | 05, 08, 11, 12 |
| `MissingInfoQuestion` | fieldKey, prompt, reason, choices, allowUnknown | '모름/확인 필요/나중에 답하기' 필수 고려 | 05, 08 |
| `ChatComposer` | message, send, disabled, status | loading, sending, validation, error | 05, 08, 11, 12 |
| `ProfileFactsCard` | 학적·지역·성적 등 사실 + 출처 | known, unknown, stale | 05, 12, 13 |
| `DocumentChecklist` | documentRequirements[], status | 준비/발급 안내/해당 여부 미확인 | 05, 08, 10 |
| `DraftSectionNav` | sections[], current, missingCount | 지원자 소개/학업/지원동기/계획 등 | 09 |
| `DraftEditor` | version, text, factualAnchors, placeholders | saving, saved, dirty, requires-review | 09 |
| `MissingFieldsPanel` | fieldName, question, reason | 누락/미확인 부분을 명시하고 AI 상담 연결 | 09 |
| `PreparationTaskRow` | scholarship, workType, nextAction, status | 이어서 대화 / 초안 보기 / 공식 확인 | 10 |
| `NotificationListItem` | type, title, body, date, destination | unread/read, actionable | 14 |

## D. 운영자 부품

| 부품명 | 목적 | 필수 상태 | 참조 |
|---|---|---|---|
| `ReviewQueueItem` | 원문/추출 결과 불일치 표시 | pending, under-review, decided | 16 |
| `SourceExtractionDiff` | 공식 원문 vs AI가 추출한 조건 병렬 대조 | mismatch, matched, missing-source | 17 |
| `ReviewDecisionForm` | 승인/반려+사유 입력 | pending, submitted, failed | 17 |

## 각 컴포넌트의 상태 모델(최소)
- **Interaction**: `default / hover / focus-visible / disabled`.
- **Data**: `loading / success / empty / error / stale`.
- **Reasoning**: `possible / needs-info / ineligible / pending-source-review`.
- **Lifecycle**: `draft / saved / changed / requires-recheck`.

로딩 중에 관련 행동을 비활성화하고, 오류 발생 시 재시도 경로를 제공한다. `needs-info`는 오류 상태가 아니며 수정/추가답변을 유도한다.

## 재사용 원칙과 금지사항
1. 동일 상태 → 동일 `StatusBadge` + 상세 설명. 새 '조건상 가능 버튼' 같은 중복 부품을 만들지 않는다.
2. `SourceEvidenceCard`의 AI 요약과 원문 인용은 시각적으로 구분한다.
3. `ChatComposer`가 사용자의 학적·소득 데이터를 자동으로 원본 사실로 확정하지 않는다. 답변 저장 시 사실 출처를 명시한다.
4. `DraftEditor`는 검증되지 않은 지원동기/경험을 자동 생성한 확정 문장으로 표시하지 않는다.
5. 3열 채팅 레이아웃은 대화 내용의 단일 책임을 가진다. 모바일에서 오른쪽 패널이 빠지더라도 '근거 보기' 버튼을 남긴다.
6. 좌측 글로벌 메뉴와 채팅 대화목록의 책임을 분리한다. 관리자 메뉴는 별도 영역이다.
7. 화면마다 'AI에게 물어보기' 버튼 색이 바뀌지 않도록 의미 기반 버튼 variant를 사용한다.

## 컴포넌트 계약 예시
```ts
// 디자인 상태 모델 예시. 서버 도메인 모델을 강제하지 않는다.
type EligibilityStatus = 'possible' | 'needs-info' | 'ineligible' | 'pending-source-review';
type FactSource = 'profile' | 'student-confirmed' | 'source-extracted' | 'unverified';

interface EligibilityConditionRowProps {
  sourceText: string; // 근거가 되는 공고 조건
  studentFact?: string; // 미확인 값이면 undefined
  factSource?: FactSource;
  status: EligibilityStatus;
  sourceVersion: string;
}
```

## 새 부품 등록 템플릿
- **이름/역할**: 어떤 반복 문제를 푸는가?
- **사용 위치**: 어느 화면들에 등장하는가?
- **props 및 변형**: 어떤 값과 상태로 변경되는가?
- **동작**: 클릭, 키보드, 제출 시 무엇이 일어나는가?
- **A11y**: label, focus, aria-live, 대비, 터치 영역.
- **도메인 불변조건**: 오해를 막기 위해 무엇을 금지하는가?
- **대안 검토(Why)**: 기존 부품 조합으로 해결할 수 없는 이유는 무엇인가?
