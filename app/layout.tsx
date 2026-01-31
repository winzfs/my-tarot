import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MYSTIC TAROT | 8-bit Fortune Teller",
  description:
    "신비로운 8비트 세계에서 타로카드 점술사를 만나 운명을 알아보세요. 레트로 게임 스타일의 인터랙티브 타로 리딩 경험.",
  keywords: ["타로", "점술", "8비트", "레트로 게임", "운세", "타로카드"],
  authors: [{ name: "Mystic Tarot" }],
  openGraph: {
    title: "MYSTIC TAROT | 8-bit Fortune Teller",
    description: "신비로운 8비트 세계에서 타로카드 점술사를 만나보세요",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
