import "./globals.css"
import type { Metadata } from "next"
import { Inter, Noto_Sans_JP, Roboto } from "next/font/google"
import type React from "react"
import Header from "./components/Header"
import Footer from "./components/Footer"

const inter = Inter({ subsets: ["latin"] })
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"] })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "traubling - 旅のお悩み相談所",
  description: "旅行中のトラブルや困りごとを共有・解決",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.className} ${roboto.className} font-medium antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

