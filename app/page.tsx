"use client"

import { useState, useEffect } from "react"
import SplashScreen from "@/components/splash-screen"
import MainChat from "@/components/main-chat"

export default function ForumApp() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ username: string; isOrbVerified: boolean } | null>(null)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = () => {
    // Simulate Worldcoin login
    setTimeout(() => {
      setUser({
        username: "@pikai",
        isOrbVerified: true,
      })
      setIsLoggedIn(true)
    }, 1500)
  }

  if (isLoading || !isLoggedIn) {
    return <SplashScreen onLogin={handleLogin} isLoading={isLoading} />
  }

  return <MainChat user={user!} />
}
