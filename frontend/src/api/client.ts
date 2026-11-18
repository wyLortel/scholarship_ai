// 백엔드 호출 래퍼. 오류를 화면 상태로 바꾸는 일만 한다.
// 자격 판정 계산은 여기서 하지 않는다 (서버 Rule Engine 결과를 그대로 표시, UX 계약).

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function getJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` }
    }
    return { ok: true, data: (await response.json()) as T }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' }
  }
}

export type Health = { status: string }

export function getHealth(): Promise<ApiResult<Health>> {
  return getJson<Health>('/api/health')
}
