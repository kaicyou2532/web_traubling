// app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import { Noto_Sans_JP, Roboto } from "next/font/google"
import { SessionProvider } from "next-auth/react"
// import { auth } from "@/auth"
import ConditionalLayout from "./components/ConditionalLayout" // 作成したコンポーネントをインポート
import Footer from "./components/Footer"

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"] })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "traubling - 旅のお悩み相談所",
  description: "旅行中のトラブルや困りごとを共有・解決",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 一時的に認証を無効化
  // const session = await auth()
  const session = null

  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} ${roboto.className} font-medium antialiased`}>
        <SessionProvider session={session}>
          {/* HeaderやchildrenをConditionalLayoutでラップ */}
          <ConditionalLayout session={session}>
            {children}
          </ConditionalLayout>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}