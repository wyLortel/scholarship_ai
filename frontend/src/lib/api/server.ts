import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  AssessmentRequest,
  AssessmentResult,
  NoticeDetail,
  NoticeSummary,
  PreparationSummary,
} from "./types";

// 서버 컴포넌트 전용 FastAPI 호출. (ADR-0013)
// - 자격 판정을 계산하지 않는다. FastAPI(Rule Engine) 응답을 그대로 돌려준다.
// - 개인 데이터가 다른 사용자에게 캐시되지 않도록 기본값은 no-store.
// - API_MOCK=1 이면 examples/api 의 계약 예제(TEST_ONLY)를 돌려준다(#23).

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8000";
const API_MOCK = process.env.API_MOCK === "1";
const EXAMPLES_DIR = process.env.EXAMPLES_DIR ?? path.join(process.cwd(), "..", "examples", "api");

// 판정 mock은 입력을 보고 고르지 않는다(그러면 프론트가 판정하는 것). 환경변수로 고정 선택.
const MOCK_ASSESSMENT = process.env.API_MOCK_ASSESSMENT ?? "needs-review"; // eligible | ineligible | needs-review
const MOCK_PREPARATION = process.env.API_MOCK_PREPARATION ?? "with-open-items"; // prepared | with-open-items

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function mock<T>(file: string): Promise<ApiResult<T>> {
  try {
    const text = await readFile(path.join(EXAMPLES_DIR, file), "utf-8");
    return { ok: true, data: JSON.parse(text) as T };
  } catch (err) {
    return { ok: false, error: `mock ${file}: ${err instanceof Error ? err.message : "read error"}` };
  }
}

async function request<T>(apiPath: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_ORIGIN}${apiPath}`, { cache: "no-store", ...init });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

function postJson<T>(apiPath: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export type Health = { status: string };

export function getHealth(): Promise<ApiResult<Health>> {
  return API_MOCK ? Promise.resolve({ ok: true, data: { status: "ok (mock)" } }) : request("/api/health");
}

export function getNotices(): Promise<ApiResult<NoticeSummary[]>> {
  return API_MOCK ? mock("notices.list.json") : request("/api/notices");
}

export function getNotice(noticeId: string): Promise<ApiResult<NoticeDetail>> {
  return API_MOCK ? mock("notice.detail.json") : request(`/api/notices/${encodeURIComponent(noticeId)}`);
}

export function postAssessment(body: AssessmentRequest): Promise<ApiResult<AssessmentResult>> {
  return API_MOCK ? mock(`assessment.${MOCK_ASSESSMENT}.json`) : postJson("/api/assessments", body);
}

export function postPreparationSummary(body: AssessmentRequest): Promise<ApiResult<PreparationSummary>> {
  return API_MOCK
    ? mock(`preparation-summary.${MOCK_PREPARATION}.json`)
    : postJson("/api/preparation-summaries", body);
}
