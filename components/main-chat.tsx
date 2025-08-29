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
import { 
  getMessages, 
  createMessage, 
  voteMessage, 
  getUserVote, 
  reactToMessage, 
  getMessageReactions,
  getActiveAnnouncements,
  dismissAnnouncement,
  getUserPreferences,
  updateUserLastSeen
} from "@/lib/firestore"
import { Timestamp } from 'firebase/firestore'

interface Message {
  id: string
  userId: string
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

interface Announcement {
  id: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'normal' | 'high'
  isActive: boolean
  isDismissible: boolean
  styling?: {
    backgroundColor: string
    textColor: string
    iconEmoji?: string
  }
}

interface MainChatProps {
  user: WorldUser
}

export default function MainChat({ user }: MainChatProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([])
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [messageReactions, setMessageReactions] = useState<{ [messageId: string]: { [emoji: string]: { count: number, users: string[] } } }>({})
  const [userVotes, setUserVotes] = useState<{ [messageId: string]: 'up' | 'down' | null }>({})
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
  const [isLoading, setIsLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize Firebase data
  useEffect(() => {
    let unsubscribeMessages: (() => void) | undefined
    let unsubscribeAnnouncements: (() => void) | undefined

    const initializeData = async () => {
      try {
        setIsLoading(true)

        // Update user's last seen
        if (user.id) {
          await updateUserLastSeen(user.id)
        }

        // Get user preferences for announcements
        if (user.id) {
          const preferences = await getUserPreferences(user.id)
          if (preferences?.dismissedAnnouncements) {
            setDismissedAnnouncements(preferences.dismissedAnnouncements)
          }
          if (preferences?.darkMode !== undefined) {
            setIsDarkMode(preferences.darkMode)
          }
        }

        // Subscribe to messages
        console.log('MainChat: Setting up messages listener...')
        unsubscribeMessages = getMessages((firebaseMessages) => {
          console.log('MainChat: Received messages from Firebase:', firebaseMessages.length, 'messages')
          console.log('MainChat: Raw Firebase messages:', firebaseMessages)
          
          const transformedMessages: Message[] = firebaseMessages
            .filter(msg => msg && msg.id && msg.timestamp) // Filter out invalid messages
            .map(msg => {
              try {
                return {
                  id: msg.id,
                  userId: msg.userId,
                  username: msg.username,
                  isOrbVerified: user.isOrbVerified, // We'll need to get this from user data
                  text: msg.text,
                  timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(),
                  upvotes: msg.upvotes || 0,
                  downvotes: msg.downvotes || 0,
                  reactions: {},
                  replyTo: msg.replyTo,
                  replies: msg.replies || [],
                  userVote: null, // Will be loaded separately
                  profilePictureUrl: user.profilePictureUrl
                }
              } catch (error) {
                console.error('Error transforming message:', msg, error)
                return null
              }
            })
            .filter(msg => msg !== null) as Message[]
            
          console.log('MainChat: Transformed messages:', transformedMessages.length, 'messages')
          console.log('MainChat: Final transformed messages:', transformedMessages)
          setMessages(transformedMessages)

          // Load user votes for each message
          if (user.id) {
            transformedMessages.forEach(async (msg) => {
              try {
                const vote = await getUserVote(msg.id, user.id!)
                setUserVotes(prev => ({ ...prev, [msg.id]: vote }))
              } catch (error) {
                console.error('Error loading vote for message:', msg.id, error)
              }
            })
          }
        })

        // Subscribe to announcements
        unsubscribeAnnouncements = getActiveAnnouncements((announcements) => {
          // Filter out dismissed announcements
          const filteredAnnouncements = announcements.filter(
            ann => !dismissedAnnouncements.includes(ann.id)
          )
          setActiveAnnouncements(filteredAnnouncements)
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing data:', error)
        setIsLoading(false)
      }
    }

    initializeData()

    return () => {
      if (unsubscribeMessages) unsubscribeMessages()
      if (unsubscribeAnnouncements) unsubscribeAnnouncements()
    }
  }, [user.id, dismissedAnnouncements])

  // Subscribe to reactions for each message
  useEffect(() => {
    const unsubscribeReactions: (() => void)[] = []

    messages.forEach((message) => {
      const unsubscribe = getMessageReactions(message.id, (reactions) => {
        setMessageReactions(prev => ({
          ...prev,
          [message.id]: reactions
        }))
      })
      unsubscribeReactions.push(unsubscribe)
    })

    return () => {
      unsubscribeReactions.forEach(unsub => unsub())
    }
  }, [messages.length]) // Only re-subscribe when message count changes

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

  const handleVote = async (messageId: string, type: "up" | "down") => {
    if (!user.id) return

    try {
      await voteMessage(messageId, user.id, type)
      
      // Update local state immediately for better UX
      const currentVote = userVotes[messageId]
      if (currentVote === type) {
        // Remove vote
        setUserVotes(prev => ({ ...prev, [messageId]: null }))
      } else {
        // Add or change vote
        setUserVotes(prev => ({ ...prev, [messageId]: type }))
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleEmojiReact = async (messageId: string, emoji: string) => {
    if (!user.id) return

    try {
      await reactToMessage(messageId, user.id, emoji)
    } catch (error) {
      console.error('Error reacting:', error)
    }
    
    setShowEmojiPicker(false)
    setSelectedMessageForEmoji(null)
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

  const handleSendMessage = async (text: string) => {
    if (!user.id) {
      console.error('Cannot send message: user.id is missing')
      return
    }
    
    if (messageCount >= 5) {
      setIsRateLimited(true)
      setTimeout(() => setIsRateLimited(false), 3000)
      return
    }

    try {
      console.log('Sending message:', { userId: user.id, username: user.username, text })
      
      const messageId = await createMessage({
        userId: user.id,
        username: user.username,
        text,
        replyTo: replyingTo || undefined,
      })
      
      console.log('Message created successfully with ID:', messageId)

      setMessageCount((prev) => prev + 1)
      setReplyingTo(null)

      // Reset rate limit after 1 minute
      setTimeout(() => {
        setMessageCount((prev) => Math.max(0, prev - 1))
      }, 60000)

      // Auto-scroll to bottom for new messages
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('Error sending message:', error)
      // Optionally show user-friendly error message
      alert('Failed to send message. Please try again.')
    }
  }

  const handleDismissAnnouncement = async (announcementId: string) => {
    if (!user.id) return

    try {
      await dismissAnnouncement(user.id, announcementId)
      setDismissedAnnouncements(prev => [...prev, announcementId])
      setActiveAnnouncements(prev => prev.filter(ann => ann.id !== announcementId))
    } catch (error) {
      console.error('Error dismissing announcement:', error)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (emojiPickerMode === "reaction" && selectedMessageForEmoji) {
      handleEmojiReact(selectedMessageForEmoji, emoji)
    }
    // For input mode, the emoji picker will handle insertion
  }

  const messagesWithReactionsAndVotes = messages.map(msg => ({
    ...msg,
    reactions: messageReactions[msg.id] ? 
      Object.entries(messageReactions[msg.id]).reduce((acc, [emoji, data]) => ({
        ...acc,
        [emoji]: data.count,
        [`${emoji}_users`]: data.users
      }), {}) : {},
    userVote: userVotes[msg.id] || null
  }))

  console.log('MainChat: Final messages for MessageFeed:', messagesWithReactionsAndVotes.length, 'messages')
  console.log('MainChat: Messages with reactions/votes:', messagesWithReactionsAndVotes)

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
        <TopBar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <TopBar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      {activeAnnouncements.map((announcement) => (
        <AnnouncementBanner 
          key={announcement.id}
          announcement={announcement}
          onClose={() => handleDismissAnnouncement(announcement.id)}
          isDarkMode={isDarkMode}
        />
      ))}

      <MessageFeed
        messages={messagesWithReactionsAndVotes}
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
        messages={messagesWithReactionsAndVotes}
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
