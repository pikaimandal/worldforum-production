"use client"

import { useState, useEffect, useRef } from "react"
import TopBar from "@/components/top-bar"
import AnnouncementBanner from "@/components/announcement-banner"
import MessageFeed from "@/components/message-feed"
import MessageInput from "@/components/message-input"
import EmojiPicker from "@/components/emoji-picker"
import ReportModal from "@/components/report-modal"
import BlockedUserModal from "@/components/blocked-user-modal"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { WorldUser } from "@/types/user"

interface Message {
  id: string
  username: string
  isOrbVerified: boolean
  text: string
  timestamp: Date
  upvotes: number
  downvotes: number
  reactions: { [emoji: string]: number | string[] }
  replyTo?: string
  replies?: string[]
  userVote?: "up" | "down" | null
  profilePictureUrl?: string
}

interface MainChatProps {
  user: WorldUser
}

export default function MainChat({ user }: MainChatProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      username: "@alice",
      isOrbVerified: true,
      text: "Welcome to World Forum! This is where verified humans connect globally. 🌍",
      timestamp: new Date(Date.now() - 300000),
      upvotes: 12,
      downvotes: 0,
      reactions: { "👋": 5, "🔥": 3, "👋_users": ["@bob", "@charlie"], "🔥_users": ["@diana", "@erik", "@fiona"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=alice",
    },
    {
      id: "2",
      username: "@bob",
      isOrbVerified: false,
      text: "Amazing to be part of this community!\nLooking forward to meaningful conversations.",
      timestamp: new Date(Date.now() - 280000),
      upvotes: 8,
      downvotes: 1,
      reactions: { "💯": 2, "💯_users": ["@alice", "@charlie"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=bob",
    },
    {
      id: "3",
      username: "@charlie",
      isOrbVerified: true,
      text: "The future of human-verified social interaction is here! 🚀",
      timestamp: new Date(Date.now() - 260000),
      upvotes: 15,
      downvotes: 0,
      reactions: { "🚀": 8, "✨": 4, "🚀_users": ["@alice", "@bob", "@diana"], "✨_users": ["@erik", "@fiona"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=charlie",
    },
    {
      id: "4",
      username: "@diana",
      isOrbVerified: true,
      text: "Love how this platform ensures real human connections. No bots, no fake accounts! 💎",
      timestamp: new Date(Date.now() - 240000),
      upvotes: 23,
      downvotes: 0,
      reactions: { "❤️": 12, "💎": 8, "❤️_users": ["@alice", "@bob"], "💎_users": ["@charlie", "@erik"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=diana",
    },
    {
      id: "5",
      username: "@erik",
      isOrbVerified: false,
      text: "Just got verified with my Orb scan! The process was so smooth and secure.",
      timestamp: new Date(Date.now() - 220000),
      upvotes: 18,
      downvotes: 2,
      reactions: { "🎉": 6, "👏": 4, "🎉_users": ["@alice", "@diana"], "👏_users": ["@bob", "@charlie"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=erik",
    },
    {
      id: "6",
      username: "@fiona",
      isOrbVerified: true,
      text: "This is the beginning of a new era for social media. Authentic conversations only! 💰",
      timestamp: new Date(Date.now() - 200000),
      upvotes: 31,
      downvotes: 1,
      reactions: { "🔥": 15, "💯": 9, "🔥_users": ["@alice", "@bob", "@charlie"], "💯_users": ["@diana", "@erik"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=fiona",
    },
    {
      id: "7",
      username: "@george",
      isOrbVerified: true,
      text: "The crypto community is going to love this platform. Real people, real discussions! 📈",
      timestamp: new Date(Date.now() - 180000),
      upvotes: 27,
      downvotes: 0,
      reactions: { "📈": 11, "⚡": 7, "📈_users": ["@alice", "@fiona"], "⚡_users": ["@bob", "@diana"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=george",
    },
    {
      id: "8",
      username: "@hannah",
      isOrbVerified: false,
      text: "Finally, a place where I can have meaningful conversations without worrying about fake profiles.",
      timestamp: new Date(Date.now() - 160000),
      upvotes: 19,
      downvotes: 0,
      reactions: { "👍": 8, "😍": 5, "👍_users": ["@alice", "@charlie"], "😍_users": ["@erik", "@george"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=hannah",
    },
    {
      id: "9",
      username: "@ivan",
      isOrbVerified: true,
      text: "The verification process gives me so much confidence in this platform. Well done team! 👏",
      timestamp: new Date(Date.now() - 140000),
      upvotes: 22,
      downvotes: 0,
      reactions: { "👏": 14, "🎉": 6, "👏_users": ["@alice", "@bob", "@fiona"], "🎉_users": ["@diana", "@hannah"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=ivan",
    },
    {
      id: "10",
      username: "@julia",
      isOrbVerified: true,
      text: "Looking forward to connecting with verified humans from around the world! 🌍",
      timestamp: new Date(Date.now() - 120000),
      upvotes: 16,
      downvotes: 0,
      reactions: { "🌍": 9, "❤️": 4, "🌍_users": ["@alice", "@george"], "❤️_users": ["@erik", "@ivan"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=julia",
    },
    {
      id: "11",
      username: "@kevin",
      isOrbVerified: false,
      text: "This platform is exactly what the internet needed. Authentic human connections! ⚡",
      timestamp: new Date(Date.now() - 100000),
      upvotes: 14,
      downvotes: 1,
      reactions: { "⚡": 7, "💯": 3, "⚡_users": ["@alice", "@julia"], "💯_users": ["@fiona", "@hannah"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=kevin",
    },
    {
      id: "12",
      username: "@luna",
      isOrbVerified: true,
      text: "The future is here and it's verified! Can't wait to see how this community grows.",
      timestamp: new Date(Date.now() - 80000),
      upvotes: 20,
      downvotes: 0,
      reactions: { "🚀": 10, "🔥": 6, "🚀_users": ["@alice", "@ivan", "@kevin"], "🔥_users": ["@bob", "@julia"] },
      userVote: null,
      profilePictureUrl: "https://api.dicebear.com/7.x/avatars/svg?seed=luna",
    },
  ])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [selectedMessageForEmoji, setSelectedMessageForEmoji] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [emojiPickerMode, setEmojiPickerMode] = useState<"reaction" | "input">("reaction")
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [showBackToReply, setShowBackToReply] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = (smooth = false) => {
    if (smooth) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    }
  }

  const scrollToMessage = (messageId: string, fromReplyId?: string) => {
    const messageElement = document.getElementById(`message-${messageId}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "auto", block: "center" })
      // Highlight the message briefly
      messageElement.style.backgroundColor = isDarkMode ? "#374151" : "#e5e7eb"
      setTimeout(() => {
        messageElement.style.backgroundColor = ""
      }, 1000)

      // Track navigation for back button
      if (fromReplyId) {
        setNavigationHistory([fromReplyId])
        setShowBackToReply(true)
      }
    }
  }

  const goBackToReply = () => {
    if (navigationHistory.length > 0) {
      const replyId = navigationHistory[navigationHistory.length - 1]
      scrollToMessage(replyId)
      setNavigationHistory([])
      setShowBackToReply(false)
    }
  }

  // Only auto-scroll for new messages, not for reactions/votes
  useEffect(() => {
    // Only scroll when a new message is added (not when reactions/votes change)
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && Date.now() - lastMessage.timestamp.getTime() < 1000) {
      scrollToBottom()
    }
  }, [messages]) // Only depend on message count, not the entire messages array

  const handleVote = (messageId: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentVote = msg.userVote
          let newUpvotes = msg.upvotes
          let newDownvotes = msg.downvotes
          let newUserVote: "up" | "down" | null = null

          // Remove previous vote if exists
          if (currentVote === "up") {
            newUpvotes -= 1
          } else if (currentVote === "down") {
            newDownvotes -= 1
          }

          // Add new vote if different from current
          if (currentVote !== type) {
            if (type === "up") {
              newUpvotes += 1
              newUserVote = "up"
            } else {
              newDownvotes += 1
              newUserVote = "down"
            }
          }

          return {
            ...msg,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
          }
        }
        return msg
      }),
    )
    // Don't scroll to bottom when voting
  }

  const handleEmojiReact = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = { ...msg.reactions }
          const userReactionKey = `${emoji}_users`
          const userReactions = (currentReactions[userReactionKey] as string[]) || []
          const currentCount = (currentReactions[emoji] as number) || 0

          // Check if user already reacted with this emoji
          if (userReactions.includes(user.username)) {
            // Remove user's reaction
            const updatedUserReactions = userReactions.filter((u: string) => u !== user.username)
            const newCount = Math.max(0, currentCount - 1)

            if (newCount === 0) {
              delete currentReactions[emoji]
              delete currentReactions[userReactionKey]
            } else {
              currentReactions[emoji] = newCount
              currentReactions[userReactionKey] = updatedUserReactions
            }
          } else {
            // Add user's reaction
            currentReactions[emoji] = currentCount + 1
            currentReactions[userReactionKey] = [...userReactions, user.username]
          }

          return { ...msg, reactions: currentReactions }
        }
        return msg
      }),
    )
    setShowEmojiPicker(false)
    setSelectedMessageForEmoji(null)
    // Don't scroll to bottom when reacting
  }

  const handleReactionClick = (messageId: string, emoji: string) => {
    handleEmojiReact(messageId, emoji)
    // Don't scroll to bottom when clicking reactions
  }

  const handleReport = (messageId: string, reason: string) => {
    console.log(`Reported message ${messageId} for: ${reason}`)
    setShowReportModal(false)
    setReportingMessageId(null)
  }

  const openEmojiPicker = (messageId: string) => {
    setSelectedMessageForEmoji(messageId)
    setEmojiPickerMode("reaction")
    setShowEmojiPicker(true)
  }

  const openEmojiPickerForInput = () => {
    setEmojiPickerMode("input")
    setShowEmojiPicker(true)
  }

  const openReportModal = (messageId: string) => {
    setReportingMessageId(messageId)
    setShowReportModal(true)
  }

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    // Scroll to bottom immediately without animation (only for replies)
    setTimeout(() => scrollToBottom(false), 100)
  }

  const handleSendMessage = (text: string) => {
    if (messageCount >= 5) {
      setIsRateLimited(true)
      setTimeout(() => setIsRateLimited(false), 3000)
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      username: user.username, // Already has @ prefix from authentication
      isOrbVerified: user.isOrbVerified,
      text,
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
      reactions: {},
      replyTo: replyingTo || undefined,
      replies: [],
      userVote: null,
      profilePictureUrl: user.profilePictureUrl,
    }

    setMessages((prev) => {
      const updated = [...prev, newMessage]
      // Add reply reference to parent message
      if (replyingTo) {
        return updated.map((msg) =>
          msg.id === replyingTo ? { ...msg, replies: [...(msg.replies || []), newMessage.id] } : msg,
        )
      }
      return updated
    })

    setMessageCount((prev) => prev + 1)
    setReplyingTo(null)

    // Reset rate limit after 1 minute
    setTimeout(() => {
      setMessageCount((prev) => Math.max(0, prev - 1))
    }, 60000)
  }

  const handleEmojiSelect = (emoji: string) => {
    if (emojiPickerMode === "reaction" && selectedMessageForEmoji) {
      handleEmojiReact(selectedMessageForEmoji, emoji)
    }
    // For input mode, the emoji picker will handle insertion
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <TopBar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      {showAnnouncement && <AnnouncementBanner onClose={() => setShowAnnouncement(false)} />}

      <MessageFeed
        messages={messages}
        onVote={handleVote}
        onEmojiReact={openEmojiPicker}
        onReport={openReportModal}
        onReply={handleReply}
        onReactionClick={handleReactionClick}
        onMessageClick={(messageId, fromReplyId) => scrollToMessage(messageId, fromReplyId)}
        isDarkMode={isDarkMode}
        currentUser={user.username}
      />

      {showBackToReply && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={goBackToReply}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div ref={messagesEndRef} />

      <MessageInput
        onSendMessage={handleSendMessage}
        isRateLimited={isRateLimited}
        isDarkMode={isDarkMode}
        onOpenEmojiPicker={openEmojiPickerForInput}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        messages={messages}
      />

      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleEmojiSelect}
          onClose={() => {
            setShowEmojiPicker(false)
            setSelectedMessageForEmoji(null)
          }}
          isDarkMode={isDarkMode}
          mode={emojiPickerMode}
        />
      )}

      {showReportModal && (
        <ReportModal
          onReport={(reason) => reportingMessageId && handleReport(reportingMessageId, reason)}
          onClose={() => setShowReportModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {showBlockedModal && <BlockedUserModal onClose={() => setShowBlockedModal(false)} isDarkMode={isDarkMode} />}
    </div>
  )
}
