import { HomeView } from "@/features/home/ui/HomeView";
import { AppShell } from "@/features/navigation/ui/AppShell";
import { getNotices } from "@/lib/api/server";

export const dynamic = "force-dynamic";

// 홈(시안 01, #94): 서버에서 검증된 공고만 받아 소개와 함께 보여 준다 (BR-A05). 판정은 하지 않는다.
export default async function Home() {
  const result = await getNotices();
  return (
    <AppShell current="home">
      <HomeView notices={result.ok ? result.data : []} noticesOk={result.ok} />
    </AppShell>
  );
}
