import path from "node:path";
import type { NextConfig } from "next";

// 서버 전용 변수(NEXT_PUBLIC_ 아님). compose 안에서는 http://backend:8000. (ADR-0013)
const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // 상위 폴더의 다른 lockfile을 워크스페이스 루트로 오인하지 않게 고정
  outputFileTracingRoot: path.join(__dirname),
  // 브라우저의 /api/* 요청은 FastAPI로 전달
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
