import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WORLD FORUM - Talk to Everyone",
  description: "A verified human community platform powered by Worldcoin",
  icons: {
    icon: "/forum-app-logo.png",
    shortcut: "/forum-app-logo.png",
    apple: "/forum-app-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
