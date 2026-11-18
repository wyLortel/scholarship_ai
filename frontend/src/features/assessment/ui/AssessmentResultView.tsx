import { Badge, Panel } from "@/shared/components";
import type { AssessmentResult, ConditionEvaluation, RuleNode } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";

import styles from "./assessment.module.css";
import {
  groupLabel,
  groupMessage,
  groupTone,
  resultIcon,
  resultLabel,
  resultTone,
  unknownReason,
} from "./copy";

// Rule Engine 응답을 표시만 한다. 결과를 다시 계산하거나 바꾸지 않는다 (BR-B02, UX 계약).
// ruleTree가 있으면 원문의 AND/OR 구조대로 보여 준다(OR은 '다음 중 하나', AC-B04).
export function AssessmentResultView({ result }: { result: AssessmentResult }) {
  const group = result.eligibilityResult;
  const byId = new Map(result.details.map((d) => [d.conditionId, d]));
  return (
    <Panel aria-live="polite" aria-labelledby="assessment-result">
      <p className={styles.groupBadge}>
        <Badge tone={groupTone[group]} size="lg" id="assessment-result">
          {groupLabel[group]}
        </Badge>
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
    </Panel>
  );
}

type ById = Map<string, ConditionEvaluation>;

// 맨 위 AND는 목록 그대로, 그 안의 OR은 묶음 상자로 보여 준다.
function TreeChildren({ node, byId }: { node: RuleNode; byId: ById }) {
  const children = node.type === "CONDITION" ? [node] : node.children;
  // 이미 충족된 OR 묶음 안에서 안 맞은 대안은 결과에 영향이 없다 — 흐리게 표시만 한다(값은 그대로).
  const satisfiedOr = node.type === "OR" && node.result === "PASS";
  return (
    <ul className={styles.conditions}>
      {children.map((child, i) => (
        <TreeNode
          key={child.conditionId ?? `${child.type}-${i}`}
          node={child}
          byId={byId}
          notNeeded={satisfiedOr && child.result !== "PASS"}
        />
      ))}
    </ul>
  );
}

function TreeNode({
  node,
  byId,
  notNeeded = false,
}: {
  node: RuleNode;
  byId: ById;
  notNeeded?: boolean;
}) {
  if (node.type === "CONDITION") {
    const detail = node.conditionId ? byId.get(node.conditionId) : undefined;
    return detail ? <ConditionItem detail={detail} notNeeded={notNeeded} /> : null;
  }
  const title =
    node.type === "OR"
      ? "다음 중 하나만 충족하면 돼요"
      : node.type === "AND"
        ? "다음을 모두 충족해야 해요"
        : "자동으로 판단할 수 없는 조건";
  const passedBy =
    node.type === "OR" && node.result === "PASS"
      ? node.children
          .filter((c) => c.type === "CONDITION" && c.result === "PASS" && c.conditionId)
          .map((c) => byId.get(c.conditionId as string)?.label)
          .filter((label): label is string => !!label)
      : [];
  return (
    <li className={styles.group}>
      <p className={styles.groupTitle}>
        <Badge tone={resultTone[node.result]} className={styles.resultTag}>
          <span aria-hidden="true">{resultIcon[node.result]}</span> {resultLabel[node.result]}
        </Badge>
        {title}
      </p>
      <TreeChildren node={node} byId={byId} />
      {passedBy.length > 0 && (
        <p className={styles.groupNote}>[{passedBy.join(", ")}] 조건으로 충족했어요.</p>
      )}
    </li>
  );
}

function ConditionItem({
  detail: d,
  notNeeded = false,
}: {
  detail: ConditionEvaluation;
  notNeeded?: boolean;
}) {
  return (
    <li className={`${styles.condition} ${notNeeded ? styles.notNeeded : ""}`}>
      <Badge tone={resultTone[d.result]} className={styles.resultTag}>
        <span aria-hidden="true">{resultIcon[d.result]}</span> {resultLabel[d.result]}
        {d.result === "UNKNOWN" && unknownReason[d.reasonCode] && (
          <> · {unknownReason[d.reasonCode]}</>
        )}
      </Badge>
      <span className={styles.conditionLabel}>
        {d.label}
        {notNeeded && (
          <span className={styles.notNeededNote}> (다른 조건으로 충족되어 해당 없음)</span>
        )}
      </span>
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
