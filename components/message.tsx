"use client"

import { MessageCircle, ChevronUp, ChevronDown, Smile, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageType {
  id: string
  username: string
  isOrbVerified: boolean
  text: string
  timestamp: Date
  upvotes: number
  downvotes: number
  reactions: { [emoji: string]: number }
  replyTo?: string
}

interface MessageProps {
  message: MessageType
  onVote: (messageId: string, type: "up" | "down") => void
  onEmojiReact: (messageId: string) => void
  onReport: (messageId: string) => void
  onReply: (messageId: string) => void
  onReactionClick: (messageId: string, emoji: string) => void
  onMessageClick: (messageId: string, fromReplyId?: string) => void
  isDarkMode: boolean
  currentUser: string
  replyToMessage?: MessageType
}

const VerificationBadge = () => <img src="/blue-checkmark.png" alt="Verified" className="w-4 h-4" />

export default function Message({
  message,
  onVote,
  onEmojiReact,
  onReport,
  onReply,
  onReactionClick,
  onMessageClick,
  isDarkMode,
  currentUser,
  replyToMessage,
}: MessageProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}d`
  }

  const isReply = !!message.replyTo

  return (
    <div id={`message-${message.id}`} className={`${isReply ? "ml-4 border-l-2 border-blue-500 pl-4" : ""}`}>
      {isReply && replyToMessage && (
        <div
          className={`mb-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => onMessageClick(message.replyTo!, message.id)}
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-blue-500 text-sm">↳</span>
            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {replyToMessage.username}
            </span>
            {replyToMessage.isOrbVerified && <VerificationBadge />}
          </div>
          <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{replyToMessage.text}</p>
        </div>
      )}

      <div className={`p-4 rounded-2xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{message.username}</span>
            {message.isOrbVerified && <VerificationBadge />}
            <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport(message.id)}
            className={`p-1 ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
        </div>

        <p
          className={`mb-3 leading-relaxed whitespace-pre-wrap break-words ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
        >
          {message.text}
        </p>

        {/* Reactions */}
        {Object.keys(message.reactions).filter((key) => !key.endsWith("_users")).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(message.reactions)
              .filter(([key]) => !key.endsWith("_users"))
              .map(([emoji, count]) => {
                const userReactionKey = `${emoji}_users`
                const userReactions = message.reactions[userReactionKey] || []
                const hasUserReacted = userReactions.includes(currentUser)

                return (
                  <button
                    key={emoji}
                    onClick={() => onReactionClick(message.id, emoji)}
                    className={`px-2 py-1 rounded-full text-sm transition-colors ${
                      hasUserReacted
                        ? isDarkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                        : isDarkMode
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {emoji} {count}
                  </button>
                )
              })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(message.id)}
            className={`flex items-center space-x-1 ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Reply</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(message.id, "up")}
            className={`flex items-center space-x-1 ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm">{message.upvotes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVote(message.id, "down")}
            className={`flex items-center space-x-1 ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm">{message.downvotes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEmojiReact(message.id)}
            className={`flex items-center space-x-1 ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
