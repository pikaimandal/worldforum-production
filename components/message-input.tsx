"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageInputProps {
  onSendMessage: (text: string) => void
  isRateLimited: boolean
  isDarkMode: boolean
  onOpenEmojiPicker: () => void
  replyingTo?: string | null
  onCancelReply?: () => void
  messages?: any[]
}

export default function MessageInput({
  onSendMessage,
  isRateLimited,
  isDarkMode,
  onOpenEmojiPicker,
  replyingTo,
  onCancelReply,
  messages = [],
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const maxLength = 300

  const replyingToMessage = replyingTo ? messages.find((m) => m.id === replyingTo) : null

  const allowedEmojis = [
    "👍",
    "👎",
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡",
    "🔥",
    "👏",
    "🎉",
    "💯",
    "😍",
    "🤔",
    "🌍",
    "🙄",
    "🚀",
    "💎",
    "📈",
    "💰",
    "⚡",
  ]

  const filterEmojis = (text: string) => {
    // Remove any emojis that are not in our allowed list
    return text.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      (match) => {
        return allowedEmojis.includes(match) ? match : ""
      },
    )
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !isRateLimited) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Only send on Enter for desktop, allow new lines on mobile
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = message.slice(0, start) + emoji + message.slice(end)

      if (newText.length <= maxLength) {
        setMessage(newText)
        // Set cursor position after emoji
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + emoji.length
          textarea.focus()
        }, 0)
      }
    }
  }

  // Expose insertEmoji function globally for emoji picker
  useEffect(() => {
    ;(window as any).insertEmojiToInput = insertEmoji
  }, [message])

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <>
      {isRateLimited && (
        <div className="px-4 py-2 bg-red-500 text-white text-sm text-center">
          {"You've reached the 5 message/min limit. Try again soon."}
        </div>
      )}

      {replyingToMessage && (
        <div
          className={`px-4 py-2 ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} border-t`}
        >
          <div className="flex items-start justify-between max-w-full">
            <div className="flex-1 min-w-0 pr-2">
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Replying to <span className="font-semibold">{replyingToMessage.username}</span>
              </p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                {truncateText(replyingToMessage.text, 60)}
              </p>
            </div>
            <button
              onClick={onCancelReply}
              className={`flex-shrink-0 p-1 ${isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`sticky bottom-0 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t px-4 py-3`}
      >
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                const filteredText = filterEmojis(e.target.value)
                setMessage(filteredText.slice(0, maxLength))
              }}
              onKeyPress={handleKeyPress}
              placeholder="Say something…"
              className={`w-full pl-4 pr-16 py-3 rounded-2xl resize-none overflow-hidden ${
                isDarkMode
                  ? "bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-300"
              } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              style={{ minHeight: "48px" }}
              onPaste={(e) => {
                e.preventDefault()
                const paste = e.clipboardData.getData("text")
                const filteredPaste = filterEmojis(paste)
                const textarea = textareaRef.current
                if (textarea) {
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const newText = message.slice(0, start) + filteredPaste + message.slice(end)
                  if (newText.length <= maxLength) {
                    setMessage(newText)
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + filteredPaste.length
                    }, 0)
                  }
                }
              }}
            />

            {/* Character counter */}
            <div
              className={`absolute right-2 top-2 text-xs ${
                message.length > maxLength * 0.9 ? "text-red-500" : isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {message.length}/{maxLength}
            </div>

            {/* Emoji button inside input */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenEmojiPicker}
              className={`absolute right-2 bottom-2 p-1 ${
                isDarkMode ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-600"
              }`}
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || isRateLimited}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
