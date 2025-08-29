import { Timestamp } from 'firebase/firestore'

export interface WorldUser {
  id?: string
  walletAddress: string
  username: string
  isOrbVerified: boolean
  profilePictureUrl?: string
  createdAt?: Timestamp
  lastSeen?: Timestamp
  messageCount?: number
  reputation?: number
}
