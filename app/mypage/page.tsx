import MyPage from "../components/MyPage"

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export default function Home() {
  return <MyPage />
}
