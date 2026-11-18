# screen-map.md — 제공된 17개 시안 구조화

이미지 원본은 [`screens/01_비로그인_홈.png`](../../screens/01_비로그인_홈.png)–`17.png`에 보존했다.

| ID | 화면 이름 | 핵심 레이아웃 | 대표 재사용 부품 | 중요한 UX 규칙 |
|---|---|---|---|---|
| 01 | 비로그인 홈 | Hero + 기능 소개 + 예시 공고 + FAQ | AppHeader, HeroBanner, ScholarshipSummaryCard | 시연용 공고임을 선언 |
| 02 | 독립 Google 로그인 | 분할 2열(브랜드/인증) | AuthShell, ConsentRow, PrimaryButton | 로그인은 홈에 끼워 넣지 않고 별도 페이지; 실제 OAuth 미연동이면 시연 명시 |
| 03 | 회원정보-학적 | Stepper + 2열 폼 + 도움 패널 | StepIndicator, TextField, SelectField | 필수/선택 구분, GPA 척도 분리 |
| 04 | 회원정보-거주·소득 | Stepper + 2열 폼 | SelectField, InlineNotice, TextareaField | 모름도 정당한 선택, 사실 추측 금지 |
| 05 | AI 채팅-정보 부족 | 3열 작업공간 | ChatBubble, MissingInfoQuestion, EvidenceSidebar | 소득구간 모름 → 확인 필요, 불가 아님 |
| 06 | 장학금 추천 결과 | 검색+카드 2열 | SearchBar, StatusBadge, ScholarshipSummaryCard | 가능/확인 필요/불가 동시 제시 |
| 07 | 자격 근거 상세 | 조건 리스트+판정 요약 | EligibilityConditionRow, SourceEvidenceCard | 원문 조건과 사용자 사실을 직접 대조 |
| 08 | AI 채팅-신청 준비 | 3열 채팅+체크리스트 | ChatWorkspace, DocumentChecklist | 초안은 사용자 확인 정보만 활용 |
| 09 | 회원정보 기반 문서 초안 | 섹션 네비+에디터+사실 패널 | DraftEditor, MissingFieldsPanel | 모르는 경험·동기 생성 금지 |
| 10 | 내 신청 준비 | 요약 KPI + 준비중 목록 | PreparationTaskRow, InlineNotice | 진행 상태가 제출 완료를 뜻하지 않음 |
| 11 | 모바일 AI 채팅 | 채팅 단일열 + 아래 근거 | MobileChat, ChatComposer, EvidenceDetails | 모바일에서도 근거/요약 접근 가능 |
| 12 | AI 채팅-첫 상담 | 3열 챗+추천 프롬프트 | ChatWorkspace, ProfileFactsCard | 재입력 최소화 |
| 13 | 내 회원정보 관리 | 기본정보 카드 + 수정 | ProfileFactsCard, InlineNotice | Google 계정과 지원 프로필 구분 |
| 14 | 알림함 | 탭 필터+리스트 | TabFilter, NotificationListItem | 알림 근거/행동으로 연결 |
| 15 | 공고 변경 재판정 | Before/After + 상태 재평가 | AnnouncementVersionDiff | 이전 가능 판정 재사용 금지 |
| 16 | 관리자 검토 목록 | 작업 큐 | ReviewQueueItem | 학생 영역과 분리 |
| 17 | 관리자 검토 상세 | 원문 vs 추출 조건 | SourceExtractionDiff, ReviewDecisionForm | 문서 정합성 검토 ≠ 개인 자격 심사 |

## 개발 순서

개발 순서는 이 문서가 정하지 않는다. [PRD §12](../02-product/01-PRD.md)와 [`screens/README.md`](../../screens/README.md)의 데모 동작을 따른다. (데모는 로그인·프로필 저장 없이 AI 상담에서 한 번 입력한다 — OPEN-18.)

## 레이아웃 반복 발견
- 같은 글로벌 헤더가 대부분 페이지에서 반복 → 하나의 `AppHeader`.
- 큰 파스텔 Hero가 여러 페이지에서 반복 → `HeroBanner`.
- 3열 AI 상담이 세 화면에서 반복 → `ChatWorkspace`.
- 조건 비교 결과가 카드/상세/대화 우측에서 반복 → 공통 `EligibilityStatus`와 `EligibilityConditionRow`.
- 시연용 안내가 반복 → **시연용 배지/안내는 필수 컴포넌트**.
