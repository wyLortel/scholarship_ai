import { getHealth } from "@/lib/api/server";

// 서버 컴포넌트: 요청마다 FastAPI health를 서버에서 조회한다.
export default async function Home() {
  const health = await getHealth();

  return (
    <main>
      <h1>장학금 통합 지원 AI</h1>
      <p role="status">
        {health.ok ? `서버 상태: ${health.data.status}` : "서버에 연결하지 못했습니다"}
      </p>
    </main>
  );
}
