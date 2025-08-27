"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TopBarProps {
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function TopBar({ isDarkMode, onToggleDarkMode }: TopBarProps) {
  return (
    <div
      className={`sticky top-0 z-50 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-4 py-3`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8">
            <img
              src="/world-forum-app-new-logo.png"
              alt="World Forum Logo"
              className="w-full h-full object-contain rounded-lg"
              style={{ borderRadius: "8px" }}
            />
          </div>
          <h1 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>WORLD FORUM</h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </Button>
      </div>
    </div>
  )
}
