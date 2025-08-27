import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import MiniKitProvider from "@/components/minikit-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WORLD FORUM - Talk to Everyone",
  description: "A verified human community platform powered by Worldcoin",
  icons: {
    icon: "/world-forum-app-new-logo.png",
    shortcut: "/world-forum-app-new-logo.png",
    apple: "/world-forum-app-new-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MiniKitProvider>{children}</MiniKitProvider>
      </body>
    </html>
  )
}
