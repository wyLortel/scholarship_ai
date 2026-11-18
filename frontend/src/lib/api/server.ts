import "server-only";

// 서버 컴포넌트 전용 FastAPI 호출. (ADR-0013)
// - 자격 판정을 계산하지 않는다. FastAPI(Rule Engine) 응답을 그대로 돌려준다.
// - 개인 데이터가 다른 사용자에게 캐시되지 않도록 기본값은 no-store.

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8000";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function getJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, { cache: "no-store" });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network error" };
  }
}

export type Health = { status: string };

export function getHealth(): Promise<ApiResult<Health>> {
  return getJson<Health>("/api/health");
}
