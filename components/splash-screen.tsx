"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface SplashScreenProps {
  onLogin: () => void
  isLoading: boolean
}

export default function SplashScreen({ onLogin, isLoading }: SplashScreenProps) {
  const [showTagline, setShowTagline] = useState(false)
  const [taglineText, setTaglineText] = useState("")
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
      }
    }, 100)
    return () => clearInterval(timer)
  }, []) // Remove isLoading dependency

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="w-24 h-24 mx-auto mb-8">
          <img
            src="/forum-logo.png"
            alt="Forum Logo"
            className="w-full h-full object-contain rounded-2xl"
            style={{ borderRadius: "16px" }}
          />
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-white tracking-tight">FORUM</h1>

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
          <Button
            onClick={onLogin}
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold text-lg shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            Let's Chat
          </Button>
        </div>
      </div>
    </div>
  )
}
