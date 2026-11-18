import { useEffect, useState } from 'react'
import { getHealth } from './api/client'

type HealthView = { state: 'loading' } | { state: 'ok'; status: string } | { state: 'failed' }

function App() {
  const [health, setHealth] = useState<HealthView>({ state: 'loading' })

  useEffect(() => {
    let active = true
    getHealth().then((result) => {
      if (!active) return
      setHealth(result.ok ? { state: 'ok', status: result.data.status } : { state: 'failed' })
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <main>
      <h1>장학금 통합 지원 AI</h1>
      <p role="status">
        {health.state === 'loading' && '서버 상태 확인 중…'}
        {health.state === 'ok' && `서버 상태: ${health.status}`}
        {health.state === 'failed' && '서버에 연결하지 못했습니다'}
      </p>
    </main>
  )
}

export default App
