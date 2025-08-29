import { db } from './lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

async function createInitialAnnouncement() {
  try {
    console.log('Creating initial announcement...')
    
    const docRef = await addDoc(collection(db, 'announcements'), {
      content: '🎉 Welcome to World Forum! Connect with verified humans globally and join meaningful conversations.',
      type: 'info',
      priority: 'high',
      isActive: true,
      isDismissible: true,
      autoHide: false,
      targetUsers: 'all',
      styling: {
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        iconEmoji: '🎉'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    console.log('✅ Initial announcement created with ID:', docRef.id)
  } catch (error) {
    console.error('❌ Error creating announcement:', error)
  }
}

createInitialAnnouncement()
