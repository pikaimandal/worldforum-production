"use client"

import { useState, useEffect } from "react"
import SplashScreen from "@/components/splash-screen"
import MainChat from "@/components/main-chat"
import { MiniKit, MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js"
import { getIsUserVerified } from "@worldcoin/minikit-js"
import { WorldUser } from "@/types/user"

type AuthState = "loading" | "splash" | "authenticating" | "verifying" | "authenticated"

export default function WorldForumApp() {
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [user, setUser] = useState<WorldUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setAuthState("splash")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async () => {
    try {
      setAuthState("authenticating")
      setError(null)

      // Generate nonce for wallet authentication
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Initiate wallet authentication
      const walletAuthPayload = await MiniKit.commandsAsync.walletAuth({
        nonce,
        requestId: `auth-${Date.now()}`,
        expirationTime: new Date(Date.now() + 60000), // 1 minute expiry
        notBefore: new Date(),
        statement: "Sign in to World Forum - Talk to Everyone",
      })

      if (walletAuthPayload.finalPayload.status === "success") {
        const authData = walletAuthPayload.finalPayload as MiniAppWalletAuthSuccessPayload
        
        setAuthState("verifying")
        
        // Check if user is ORB verified
        const isOrbVerified = await getIsUserVerified(authData.address)
        
        // Get username from MiniKit and add @ prefix for UI display
        const rawUsername = MiniKit.user?.username || authData.address.slice(0, 8)
        const username = rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`
        
        const worldUser: WorldUser = {
          walletAddress: authData.address,
          username,
          isOrbVerified,
          profilePictureUrl: MiniKit.user?.profilePictureUrl
        }
        
        setUser(worldUser)
        setAuthState("authenticated")
      } else {
        throw new Error("Wallet authentication failed")
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setError(error instanceof Error ? error.message : "Authentication failed")
      setAuthState("splash")
    }
  }

  if (authState === "loading" || authState === "splash") {
    return <SplashScreen onLogin={handleLogin} isLoading={authState === "loading"} />
  }

  if (authState === "authenticating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 mx-auto mb-8">
            <img
              src="/world-forum-app-new-logo.png"
              alt="World Forum Logo"
              className="w-full h-full object-contain rounded-2xl"
              style={{ borderRadius: "16px" }}
            />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">WORLD FORUM</h1>
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-xl text-blue-200">Connecting wallet...</span>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    )
  }

  if (authState === "verifying") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 mx-auto mb-8">
            <img
              src="/world-forum-app-new-logo.png"
              alt="World Forum Logo"
              className="w-full h-full object-contain rounded-2xl"
              style={{ borderRadius: "16px" }}
            />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">WORLD FORUM</h1>
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span className="text-xl text-blue-200">Verifying user...</span>
          </div>
        </div>
      </div>
    )
  }

  return user ? <MainChat user={user} /> : null
}
