"use client"

import { MessageCircle, ThumbsUp, ThumbsDown, Smile, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MiniKit } from '@worldcoin/minikit-js'
import { useState, useEffect } from 'react'

interface MessageType {
  id: string
  username: string
  isOrbVerified: boolean
  text: string
  timestamp: Date
  upvotes: number
  downvotes: number
  reactions: { [emoji: string]: number | string[] }
  replyTo?: string
  profilePictureUrl?: string
  userVote?: "up" | "down" | null
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

// Profile picture component that uses Minikit SDK directly
const ProfilePicture = ({ username, size = "w-5 h-5", isDarkMode = false }: { username: string, size?: string, isDarkMode?: boolean }) => {
  const [profileUrl, setProfileUrl] = useState<string>('')

  useEffect(() => {
    const getProfilePicture = async () => {
      try {
        // Try to get profile picture from Minikit
        if (typeof window !== 'undefined' && MiniKit.user) {
          const user = MiniKit.user
          if (user.profilePictureUrl) {
            setProfileUrl(user.profilePictureUrl)
            return
          }
        }
        
        // Fallback to generated avatar
        setProfileUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`)
      } catch (error) {
        // Fallback to generated avatar on any error
        setProfileUrl(`https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`)
      }
    }

    getProfilePicture()
  }, [username])

  return (
    <div className={`${size} rounded-full overflow-hidden flex-shrink-0`}>
      {profileUrl ? (
        <img
          src={profileUrl}
          alt={`${username} profile`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full ${isDarkMode ? "bg-gray-600" : "bg-gray-300"} flex items-center justify-center`}>
          <span className="text-xs text-gray-500">
            {username.charAt(1)?.toUpperCase() || "?"}
          </span>
        </div>
      )}
    </div>
  )
}

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
            {/* Profile picture for reply - 16x16 */}
            <ProfilePicture username={replyToMessage.username} size="w-4 h-4" isDarkMode={isDarkMode} />
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
            {/* Profile picture for main message - 20x20 */}
            <ProfilePicture username={message.username} size="w-5 h-5" isDarkMode={isDarkMode} />
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
                const userReactions = (message.reactions[userReactionKey] as string[]) || []
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
                    {emoji} {count as number}
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

          <button
            onClick={() => onVote(message.id, "up")}
            className={`flex items-center space-x-1 transition-colors focus:outline-none active:bg-transparent hover:opacity-70 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <ThumbsUp 
              className={`w-4 h-4 ${
                message.userVote === "up" 
                  ? isDarkMode 
                    ? "fill-white stroke-white" 
                    : "fill-black stroke-black"
                  : isDarkMode 
                    ? "stroke-gray-400" 
                    : "stroke-gray-600"
              }`} 
            />
            <span className="text-sm">{message.upvotes}</span>
          </button>

          <button
            onClick={() => onVote(message.id, "down")}
            className={`flex items-center space-x-1 transition-colors focus:outline-none active:bg-transparent hover:opacity-70 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <ThumbsDown 
              className={`w-4 h-4 ${
                message.userVote === "down" 
                  ? isDarkMode 
                    ? "fill-white stroke-white" 
                    : "fill-black stroke-black"
                  : isDarkMode 
                    ? "stroke-gray-400" 
                    : "stroke-gray-600"
              }`} 
            />
            <span className="text-sm">{message.downvotes}</span>
          </button>

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
