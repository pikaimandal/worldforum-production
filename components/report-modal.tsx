"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ReportModalProps {
  onReport: (reason: string) => void
  onClose: () => void
  isDarkMode: boolean
}

export default function ReportModal({ onReport, onClose, isDarkMode }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherText, setOtherText] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const reasons = ["Spam", "Scam", "Misleading", "Other"]

  const handleReasonSelect = (reason: string) => {
    if (reason === "Other") {
      setSelectedReason(reason)
    } else {
      handleSubmitReport(reason)
    }
  }

  const handleSubmitReport = (reason: string) => {
    const finalReason = reason === "Other" ? `Other: ${otherText}` : reason
    onReport(finalReason)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onClose()
    }, 2000)
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
        <div
          className={`w-full max-w-md mx-4 p-6 rounded-2xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } transform transition-all duration-300 ease-out text-center shadow-2xl`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <p className={`text-lg font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Your report is submitted and being reviewed for this message.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className={`w-full max-w-md mx-4 mb-4 p-6 rounded-2xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } transform transition-all duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Report Message</h3>

        {!selectedReason && (
          <div className="space-y-2">
            {reasons.map((reason) => (
              <Button
                key={reason}
                onClick={() => handleReasonSelect(reason)}
                variant="ghost"
                className={`w-full justify-start p-4 ${
                  isDarkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                {reason}
              </Button>
            ))}
          </div>
        )}

        {selectedReason === "Other" && (
          <div className="space-y-4">
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Please describe the issue..."
              className={`w-full p-3 rounded-lg resize-none ${
                isDarkMode
                  ? "bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                onClick={() => handleSubmitReport("Other")}
                disabled={!otherText.trim()}
                className={`flex-1 ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                }`}
              >
                Submit Report
              </Button>
              <Button
                onClick={() => setSelectedReason(null)}
                variant="outline"
                className={`flex-1 ${
                  isDarkMode
                    ? "border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {!selectedReason && (
          <Button
            onClick={onClose}
            variant="outline"
            className={`w-full mt-4 ${
              isDarkMode
                ? "border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
