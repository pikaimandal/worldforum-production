"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MiniKit } from "@worldcoin/minikit-js"

interface SplashScreenProps {
  onLogin: () => void
  isLoading: boolean
}

export default function SplashScreen({ onLogin, isLoading }: SplashScreenProps) {
  const [showTagline, setShowTagline] = useState(false)
  const [taglineText, setTaglineText] = useState("")
  const [miniKitReady, setMiniKitReady] = useState(false)
  const [isInWorldApp, setIsInWorldApp] = useState(false)
  const fullTagline = "Talk to Everyone."

  useEffect(() => {
    setShowTagline(true)
    // Typewriter effect starts immediately
    let i = 0
    const timer = setInterval(() => {
      if (i < fullTagline.length) {
        setTaglineText(fullTagline.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        // Check if MiniKit is installed and ready after typewriter finishes
        setTimeout(() => {
          const isInstalled = MiniKit.isInstalled()
          setIsInWorldApp(isInstalled)
          setMiniKitReady(true)
        }, 500)
      }
    }, 100)
    return () => clearInterval(timer)
  }, [])

  if (miniKitReady && !isInWorldApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto mb-8">
            <img
              src="/world-forum-logo.png"
              alt="World Forum Logo"
              className="w-full h-full object-contain rounded-2xl"
              style={{ borderRadius: "16px" }}
            />
          </div>

          {/* App name */}
          <h1 className="text-4xl font-bold text-white tracking-tight">WORLD FORUM</h1>

          {/* Error message */}
          <div className="space-y-4">
            <p className="text-xl text-red-300 font-medium">
              ⚠️ Access Required
            </p>
            <p className="text-lg text-blue-200">
              World Forum must be opened within the World App to continue.
            </p>
            <p className="text-sm text-gray-300">
              Please open this app through the World App mini-apps section.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="w-24 h-24 mx-auto mb-8">
          <img
            src="/world-forum-logo.png"
            alt="World Forum Logo"
            className="w-full h-full object-contain rounded-2xl"
            style={{ borderRadius: "16px" }}
          />
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-white tracking-tight">WORLD FORUM</h1>

        {/* Animated tagline */}
        <div className="h-8">
          {showTagline && (
            <p className="text-xl text-blue-200 font-medium animate-fade-in">
              {taglineText}
              <span className="animate-pulse">|</span>
            </p>
          )}
        </div>

        {/* Login button */}
        <div className="pt-8">
          {miniKitReady && isInWorldApp ? (
            <Button
              onClick={onLogin}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              Let's Chat
            </Button>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-white">Initializing World App...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
