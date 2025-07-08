"use client"

import Message from "@/components/message"

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

interface MessageFeedProps {
  messages: MessageType[]
  onVote: (messageId: string, type: "up" | "down") => void
  onEmojiReact: (messageId: string) => void
  onReport: (messageId: string) => void
  onReply: (messageId: string) => void
  onReactionClick: (messageId: string, emoji: string) => void
  onMessageClick: (messageId: string, fromReplyId?: string) => void
  isDarkMode: boolean
  currentUser: string
}

export default function MessageFeed({
  messages,
  onVote,
  onEmojiReact,
  onReport,
  onReply,
  onReactionClick,
  onMessageClick,
  isDarkMode,
  currentUser,
}: MessageFeedProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => {
        const replyToMessage = message.replyTo ? messages.find((m) => m.id === message.replyTo) : undefined
        return (
          <Message
            key={message.id}
            message={message}
            onVote={onVote}
            onEmojiReact={onEmojiReact}
            onReport={onReport}
            onReply={onReply}
            onReactionClick={onReactionClick}
            onMessageClick={(messageId) => onMessageClick(messageId, message.id)}
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            replyToMessage={replyToMessage}
          />
        )
      })}
    </div>
  )
}
