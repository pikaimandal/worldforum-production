import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WORLD FORUM - Talk to Everyone",
  description: "A verified human community platform powered by Worldcoin",
  icons: {
    icon: "/world-forum-icon.png",
    shortcut: "/world-forum-icon.png",
    apple: "/world-forum-icon.png",
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
