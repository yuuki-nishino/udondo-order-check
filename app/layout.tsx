import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ウドンド注文確認システム',
  description: 'ウドンドのオーダーを店舗で確認できるシステム',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
