import type { AssessmentResult, ConditionEvaluation, RuleNode } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

import styles from "./assessment.module.css";
import { groupLabel, groupMessage, resultIcon, resultLabel, unknownReason } from "./copy";

// Rule Engine 응답을 표시만 한다. 결과를 다시 계산하거나 바꾸지 않는다 (BR-B02, UX 계약).
// ruleTree가 있으면 원문의 AND/OR 구조대로 보여 준다(OR은 '다음 중 하나', AC-B04).
export function AssessmentResultView({ result }: { result: AssessmentResult }) {
  const group = result.eligibilityResult;
  const byId = new Map(result.details.map((d) => [d.conditionId, d]));
  return (
    <section className={styles.result} aria-live="polite" aria-labelledby="assessment-result">
      <p className={`${styles.groupBadge} ${styles[group]}`} id="assessment-result">
        {groupLabel[group]}
      </p>
      <p className={styles.message}>{groupMessage(group, result.details)}</p>
      {result.ruleTree ? (
        <TreeChildren node={result.ruleTree} byId={byId} />
      ) : (
        <ul className={styles.conditions}>
          {result.details.map((d) => (
            <ConditionItem key={d.conditionId} detail={d} />
          ))}
        </ul>
      )}
      <p className={styles.meta}>
        공고 버전 <code>{result.noticeVersionId}</code> · 평가 시각{" "}
        {formatDateTime(result.assessedAt)}
      </p>
    </section>
  );
}

type ById = Map<string, ConditionEvaluation>;

// 맨 위 AND는 목록 그대로, 그 안의 OR은 묶음 상자로 보여 준다.
function TreeChildren({ node, byId }: { node: RuleNode; byId: ById }) {
  const children = node.type === "CONDITION" ? [node] : node.children;
  return (
    <ul className={styles.conditions}>
      {children.map((child, i) => (
        <TreeNode key={child.conditionId ?? `${child.type}-${i}`} node={child} byId={byId} />
      ))}
    </ul>
  );
}

function TreeNode({ node, byId }: { node: RuleNode; byId: ById }) {
  if (node.type === "CONDITION") {
    const detail = node.conditionId ? byId.get(node.conditionId) : undefined;
    return detail ? <ConditionItem detail={detail} /> : null;
  }
  const title =
    node.type === "OR"
      ? "다음 중 하나 충족"
      : node.type === "AND"
        ? "다음 모두 충족"
        : "자동으로 판단할 수 없는 조건";
  return (
    <li className={styles.group}>
      <p className={styles.groupTitle}>
        <span className={`${styles.resultTag} ${styles[node.result]}`}>
          <span aria-hidden="true">{resultIcon[node.result]}</span> {resultLabel[node.result]}
        </span>
        {title}
      </p>
      <TreeChildren node={node} byId={byId} />
    </li>
  );
}

function ConditionItem({ detail: d }: { detail: ConditionEvaluation }) {
  return (
    <li className={styles.condition}>
      <span className={`${styles.resultTag} ${styles[d.result]}`}>
        <span aria-hidden="true">{resultIcon[d.result]}</span> {resultLabel[d.result]}
        {d.result === "UNKNOWN" && unknownReason[d.reasonCode] && (
          <> · {unknownReason[d.reasonCode]}</>
        )}
      </span>
      <span className={styles.conditionLabel}>{d.label}</span>
      {d.evidence && (
        <span className={styles.quote}>
          <q>{d.evidence.quote}</q>
          <br />
          {d.evidence.location} · 원문 확인 {formatDateTime(d.evidence.checkedAt) ?? "시각 없음"}
        </span>
      )}
    </li>
  );
}
