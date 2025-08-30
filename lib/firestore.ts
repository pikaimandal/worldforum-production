import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  onSnapshot, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  setDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface FirebaseUser {
  id: string
  username: string
  walletAddress: string
  isOrbVerified: boolean
  profilePictureUrl: string
  createdAt: Timestamp
  lastSeen: Timestamp
  messageCount: number
  reputation: number
}

export interface FirebaseMessage {
  id: string
  userId: string
  username: string
  text: string
  timestamp: Timestamp
  upvotes: number
  downvotes: number
  reportCount: number
  replyTo?: string
  replies: string[]
  isEdited: boolean
  editedAt?: Timestamp
}

export interface FirebaseVote {
  messageId: string
  userId: string
  type: 'up' | 'down'
  createdAt: Timestamp
}

export interface FirebaseReaction {
  messageId: string
  userId: string
  emoji: string
  createdAt: Timestamp
}

export interface FirebaseAnnouncement {
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

export interface FirebaseUserPreference {
  userId: string
  dismissedAnnouncements: string[]
  darkMode: boolean
  notifications: boolean
  lastUpdated: Timestamp
}

export interface FirebaseReport {
  id?: string
  messageId: string
  reporterId: string
  reporterUsername: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string
  notes?: string
}

// User Management
export const createUser = async (userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'lastSeen'>) => {
  try {
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    })
    return userRef.id
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const getUserByWalletAddress = async (walletAddress: string) => {
  try {
    const q = query(collection(db, 'users'), where('walletAddress', '==', walletAddress))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as FirebaseUser
    }
    return null
  } catch (error) {
    console.error('Error getting user by wallet address:', error)
    throw error
  }
}

export const updateUserLastSeen = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      lastSeen: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user last seen:', error)
    throw error
  }
}

// Message Management
export const createMessage = async (messageData: Omit<FirebaseMessage, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'reportCount' | 'replies' | 'isEdited'>) => {
  try {
    console.log('Creating message:', messageData)
    
    const messageRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      timestamp: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      reportCount: 0,
      replies: [],
      isEdited: false,
    })

    console.log('Message document created with ID:', messageRef.id)

    // If this is a reply, add to parent's replies array
    if (messageData.replyTo) {
      try {
        const parentRef = doc(db, 'messages', messageData.replyTo)
        await updateDoc(parentRef, {
          replies: arrayUnion(messageRef.id)
        })
        console.log('Updated parent message replies')
      } catch (error) {
        console.error('Error updating parent message replies:', error)
        // Don't fail the whole operation if reply update fails
      }
    }

    // Increment user's message count
    try {
      const userRef = doc(db, 'users', messageData.userId)
      await updateDoc(userRef, {
        messageCount: increment(1)
      })
      console.log('Updated user message count')
    } catch (error) {
      console.error('Error updating user message count:', error)
      // Don't fail the whole operation if user update fails
    }

    return messageRef.id
  } catch (error) {
    console.error('Error creating message:', error)
    
    // Add more detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    throw error
  }
}

export const getMessages = (callback: (messages: FirebaseMessage[]) => void) => {
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limit(100))
  
  return onSnapshot(q, (querySnapshot) => {
    try {
      const messages: FirebaseMessage[] = []
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data()
          if (data && data.userId && data.username && data.text) {
            messages.push({ id: doc.id, ...data } as FirebaseMessage)
          } else {
            console.warn('Invalid message document:', doc.id, data)
          }
        } catch (error) {
          console.error('Error processing message document:', doc.id, error)
        }
      })
      console.log('Firebase getMessages returning:', messages.length, 'messages')
      callback(messages)
    } catch (error) {
      console.error('Error in getMessages snapshot handler:', error)
      callback([]) // Return empty array on error
    }
  }, (error) => {
    console.error('Error in getMessages listener:', error)
    callback([]) // Return empty array on error
  })
}

// Vote Management
export const voteMessage = async (messageId: string, userId: string, voteType: 'up' | 'down') => {
  try {
    const voteRef = doc(db, 'votes', `${messageId}_${userId}`)
    const existingVote = await getDoc(voteRef)

    if (existingVote.exists()) {
      const currentVote = existingVote.data().type
      
      if (currentVote === voteType) {
        // Remove vote
        await deleteDoc(voteRef)
        
        // Update message vote count
        const messageRef = doc(db, 'messages', messageId)
        await updateDoc(messageRef, {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(-1)
        })
      } else {
        // Change vote
        await updateDoc(voteRef, {
          type: voteType,
          createdAt: serverTimestamp()
        })
        
        // Update message vote counts
        const messageRef = doc(db, 'messages', messageId)
        await updateDoc(messageRef, {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1),
          [voteType === 'up' ? 'downvotes' : 'upvotes']: increment(-1)
        })
      }
    } else {
      // New vote
      await setDoc(voteRef, {
        messageId,
        userId,
        type: voteType,
        createdAt: serverTimestamp()
      })
      
      // Update message vote count
      const messageRef = doc(db, 'messages', messageId)
      await updateDoc(messageRef, {
        [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1)
      })
    }
  } catch (error) {
    console.error('Error voting on message:', error)
    throw error
  }
}

export const getUserVote = async (messageId: string, userId: string): Promise<'up' | 'down' | null> => {
  try {
    const voteRef = doc(db, 'votes', `${messageId}_${userId}`)
    const voteDoc = await getDoc(voteRef)
    
    if (voteDoc.exists()) {
      return voteDoc.data().type
    }
    return null
  } catch (error) {
    console.error('Error getting user vote:', error)
    return null
  }
}

// Reaction Management
export const reactToMessage = async (messageId: string, userId: string, emoji: string) => {
  try {
    const reactionRef = doc(db, 'reactions', `${messageId}_${userId}_${emoji}`)
    const existingReaction = await getDoc(reactionRef)

    if (existingReaction.exists()) {
      // Remove reaction
      await deleteDoc(reactionRef)
    } else {
      // Add reaction
      await setDoc(reactionRef, {
        messageId,
        userId,
        emoji,
        createdAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error reacting to message:', error)
    throw error
  }
}

export const getMessageReactions = (messageId: string, callback: (reactions: { [emoji: string]: { count: number, users: string[] } }) => void) => {
  const q = query(collection(db, 'reactions'), where('messageId', '==', messageId))
  
  return onSnapshot(q, (querySnapshot) => {
    const reactions: { [emoji: string]: { count: number, users: string[] } } = {}
    
    querySnapshot.forEach((doc) => {
      const reaction = doc.data() as FirebaseReaction
      if (!reactions[reaction.emoji]) {
        reactions[reaction.emoji] = { count: 0, users: [] }
      }
      reactions[reaction.emoji].count++
      reactions[reaction.emoji].users.push(reaction.userId)
    })
    
    callback(reactions)
  })
}

// Report Management
export const createReport = async (reportData: Omit<FirebaseReport, 'id' | 'createdAt' | 'status'>) => {
  try {
    console.log('Creating report:', reportData)
    
    const reportRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      status: 'pending',
      createdAt: serverTimestamp(),
    })

    console.log('Report created with ID:', reportRef.id)

    // Increment the message's report count
    try {
      const messageRef = doc(db, 'messages', reportData.messageId)
      await updateDoc(messageRef, {
        reportCount: increment(1)
      })
      console.log('Updated message report count')
    } catch (error) {
      console.error('Error updating message report count:', error)
      // Don't fail the whole operation if report count update fails
    }

    return reportRef.id
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}

// Admin functions for managing reports
export const updateReportStatus = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed', adminId?: string, notes?: string) => {
  try {
    const reportRef = doc(db, 'reports', reportId)
    const updateData: any = {
      status,
      reviewedAt: serverTimestamp(),
    }
    
    if (adminId) updateData.reviewedBy = adminId
    if (notes) updateData.notes = notes
    
    await updateDoc(reportRef, updateData)
    console.log('Report status updated:', reportId, status)
    return true
  } catch (error) {
    console.error('Error updating report status:', error)
    throw error
  }
}

export const deleteMessageAndUpdateReports = async (messageId: string, adminId?: string) => {
  try {
    console.log('Deleting message and updating related reports:', messageId)
    
    // First, update all reports for this message to 'resolved'
    const reportsQuery = query(collection(db, 'reports'), where('messageId', '==', messageId))
    const reportsSnapshot = await getDocs(reportsQuery)
    
    const reportUpdatePromises = reportsSnapshot.docs.map(reportDoc => 
      updateDoc(reportDoc.ref, {
        status: 'resolved',
        reviewedAt: serverTimestamp(),
        reviewedBy: adminId || 'system',
        notes: 'Message deleted by admin'
      })
    )
    
    await Promise.all(reportUpdatePromises)
    console.log(`Updated ${reportsSnapshot.size} reports to resolved status`)
    
    // Then delete the message
    const messageRef = doc(db, 'messages', messageId)
    await deleteDoc(messageRef)
    console.log('Message deleted successfully')
    
    return { deletedMessage: true, updatedReports: reportsSnapshot.size }
  } catch (error) {
    console.error('Error deleting message and updating reports:', error)
    throw error
  }
}

// Announcement Management
export const getActiveAnnouncements = (callback: (announcements: FirebaseAnnouncement[]) => void) => {
  const q = query(
    collection(db, 'announcements'), 
    where('isActive', '==', true),
    orderBy('priority', 'desc'),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (querySnapshot) => {
    const announcements: FirebaseAnnouncement[] = []
    const now = new Date()
    
    querySnapshot.forEach((doc) => {
      const announcement = { id: doc.id, ...doc.data() } as FirebaseAnnouncement
      
      // Check if announcement is within date range
      if (announcement.startDate && announcement.startDate.toDate() > now) return
      if (announcement.endDate && announcement.endDate.toDate() < now) return
      
      announcements.push(announcement)
    })
    
    callback(announcements)
  })
}

export const dismissAnnouncement = async (userId: string, announcementId: string) => {
  try {
    const prefRef = doc(db, 'userPreferences', userId)
    const prefDoc = await getDoc(prefRef)
    
    if (prefDoc.exists()) {
      await updateDoc(prefRef, {
        dismissedAnnouncements: arrayUnion(announcementId),
        lastUpdated: serverTimestamp()
      })
    } else {
      await setDoc(prefRef, {
        userId,
        dismissedAnnouncements: [announcementId],
        darkMode: true,
        notifications: true,
        lastUpdated: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error dismissing announcement:', error)
    throw error
  }
}

export const getUserPreferences = async (userId: string): Promise<FirebaseUserPreference | null> => {
  try {
    const prefRef = doc(db, 'userPreferences', userId)
    const prefDoc = await getDoc(prefRef)
    
    if (prefDoc.exists()) {
      return { ...prefDoc.data() } as FirebaseUserPreference
    }
    return null
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return null
  }
}
