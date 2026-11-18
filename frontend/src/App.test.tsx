import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function mockFetch(impl: () => Promise<Response>) {
  vi.stubGlobal('fetch', vi.fn(impl))
}

describe('백엔드 health 표시', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('백엔드가 ok를 반환하면 연결 상태를 보여준다', async () => {
    mockFetch(async () => Response.json({ status: 'ok' }))

    render(<App />)

    expect(await screen.findByText('서버 상태: ok')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/health')
  })

  it('백엔드에 연결하지 못하면 실패 문구를 보여주고 화면이 깨지지 않는다', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch')
    })

    render(<App />)

    expect(await screen.findByText('서버에 연결하지 못했습니다')).toBeInTheDocument()
  })

  it('백엔드가 오류 응답을 주면 연결 성공으로 표시하지 않는다', async () => {
    mockFetch(async () => new Response('error', { status: 500 }))

    render(<App />)

    expect(await screen.findByText('서버에 연결하지 못했습니다')).toBeInTheDocument()
    expect(screen.queryByText('서버 상태: ok')).not.toBeInTheDocument()
  })
})
