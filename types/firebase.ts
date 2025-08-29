import { Timestamp } from 'firebase/firestore'

export interface WorldUser {
  id: string
  username: string
  walletAddress: string
  isOrbVerified: boolean
  profilePictureUrl: string
  createdAt?: Timestamp
  lastSeen?: Timestamp
  messageCount?: number
  reputation?: number
}

export interface Message {
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

export interface Vote {
  messageId: string
  userId: string
  type: 'up' | 'down'
  createdAt: Timestamp
}

export interface Reaction {
  messageId: string
  userId: string
  emoji: string
  createdAt: Timestamp
}

export interface Announcement {
  id: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'normal' | 'high'
  isActive: boolean
  isDismissible: boolean
  autoHide: boolean
  hideAfter?: number
  startDate?: Timestamp
  endDate?: Timestamp
  targetUsers: 'all' | 'verified' | 'new_users'
  styling?: {
    backgroundColor: string
    textColor: string
    borderColor?: string
    iconEmoji?: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserPreferences {
  userId: string
  dismissedAnnouncements: string[]
  darkMode: boolean
  notifications: boolean
  lastUpdated: Timestamp
}
