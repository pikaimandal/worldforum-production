"use client"

import { Button } from "@/components/ui/button"

interface BlockedUserModalProps {
  onClose: () => void
  isDarkMode: boolean
}

export default function BlockedUserModal({ onClose, isDarkMode }: BlockedUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-sm p-6 rounded-2xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } transform transition-all duration-300 ease-out`}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>

          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Temporarily Restricted
          </h3>

          <p className={`mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            You are temporarily restricted from messaging.
          </p>

          <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Contact us at <span className="text-blue-500">support@forum.online</span>
          </p>

          <Button onClick={onClose} className="w-full">
            Understood
          </Button>
        </div>
      </div>
    </div>
  )
}
