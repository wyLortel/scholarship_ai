// contracts/api-draft.yaml 의 MVP 스키마와 같은 모양 (#23). 스키마를 바꾸면 여기도 같이 바꾼다.
// 판정 값은 서버(Rule Engine)가 준 것을 표시만 한다 — 프론트에서 계산하지 않는다.

export type EligibilityGroup = "ELIGIBLE" | "INELIGIBLE" | "NEEDS_REVIEW";
export type RuleResult = "PASS" | "FAIL" | "UNKNOWN";
export type VerificationStatus =
  "CANDIDATE" | "EXTRACTING" | "REVIEW_PENDING" | "VERIFIED" | "REJECTED";
export type FreshnessStatus =
  "UNCHECKED" | "CHECKED_UNCHANGED" | "CHECKED_CHANGED" | "CHECK_FAILED";
export type ReasonCode =
  | "EVALUATED"
  | "VALUE_MISMATCH"
  | "MISSING_FACT"
  | "INSTITUTION_CONFIRMATION"
  | "RULE_UNVERIFIED"
  | "UNSUPPORTED_OPERATOR";

export type EvidenceRef = {
  evidenceId: string;
  noticeVersionId: string;
  fileId: string;
  location: string;
  quote: string;
  officialUrl?: string | null;
  checkedAt?: string | null;
  verifiedAt?: string | null;
};

export type NoticeSummary = {
  noticeId: string;
  noticeVersionId: string;
  title: string;
  institution: string;
  isTestOnly: boolean;
  officialUrl?: string | null;
  sourceVerificationStatus: VerificationStatus;
  freshnessStatus: FreshnessStatus;
  lastCheckedAt?: string | null;
  recruitmentStartAt?: string | null;
  recruitmentEndAt?: string | null;
};

export type NoticeCondition = {
  conditionId: string;
  label: string;
  evidence: EvidenceRef;
  /** 이 조건이 비교하는 학생 사실 필드. 입력 화면이 무엇을 물을지 고르는 데만 쓴다 */
  studentFactRef?: string | null;
};
export type NoticeDetail = { notice: NoticeSummary; conditions: NoticeCondition[] };

export type StudentFact = {
  field: string;
  isKnown: boolean;
  /** 모름이면 반드시 null (0/false 금지, BR-B01) */
  value: number | string | boolean | null;
  unit?: string | null;
  effectiveAt?: string | null;
  source: "STUDENT_PROVIDED" | "USER_CONFIRMED";
};

export type AssessmentRequest = { noticeVersionId: string; facts: StudentFact[] };

export type ConditionEvaluation = {
  conditionId: string;
  label: string;
  result: RuleResult;
  reasonCode: ReasonCode;
  evidence: EvidenceRef | null;
  /** 비어 있지 않으면 '근거 검증 완료' 표시 금지 (AC-B09) */
  missingEvidenceFields: Array<"evidence" | "noticeVersionId" | "checkedAt">;
  studentFactRef?: string | null;
};

export type AssessmentResult = {
  assessmentId: string;
  noticeVersionId: string;
  eligibilityResult: EligibilityGroup;
  evidenceComplete: boolean;
  details: ConditionEvaluation[];
  assessedAt: string;
  isStale: boolean;
  warning?: string | null;
  /** 평가한 AND/OR 트리(원문 구조 보존). 빈 규칙이면 null (계약 0.3.0) */
  ruleTree?: RuleNode | null;
};

export type RuleNode = {
  type: "AND" | "OR" | "CONDITION" | "UNSUPPORTED";
  result: RuleResult;
  conditionId?: string | null;
  children: RuleNode[];
};

export type ChecklistItem = {
  itemId: string;
  documentName: string;
  reason: string;
  isConditional: boolean;
  appliesWhen?: string | null;
  /** null이면 "발급처 확인 필요"로 표시 */
  issuer: string | null;
  issuanceGuideUrl: string | null;
  evidence: EvidenceRef;
};

export type OpenItem = { conditionId: string; label: string; reasonCode: ReasonCode };

export type PreparationSummary = {
  noticeId: string;
  noticeVersionId: string;
  eligibilityResult: EligibilityGroup;
  /** 제출(SUBMITTED) 상태는 없다 — 공식 제출은 학생이 직접 (BR-C07) */
  preparationStatus: "PREPARED" | "PREPARED_WITH_OPEN_ITEMS" | "STOPPED";
  checklist: ChecklistItem[];
  openItems: OpenItem[];
  failedConditions: ConditionEvaluation[];
  officialSubmissionUrl: string | null;
};

export type DomainError = {
  code: string;
  message: string;
  traceId: string;
  noticeVersionId?: string | null;
};
