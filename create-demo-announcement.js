const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore')
require('dotenv').config()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createDemoAnnouncement() {
  try {
    // Simplified announcement data structure
    const announcementData = {
      content: "🎉 Welcome to World Forum! Share your thoughts and connect with the community.",
      type: "info",
      priority: "normal",
      isDismissible: true,
      isActive: true,
      createdAt: Timestamp.now()
    }

    console.log('Creating announcement with data:', announcementData)
    const docRef = await addDoc(collection(db, 'announcements'), announcementData)
    console.log('✅ Demo announcement created with ID:', docRef.id)
    
    // Create another announcement
    const announcement2Data = {
      content: "🚀 New features coming soon! Stay tuned for exciting updates.",
      type: "success", 
      priority: "high",
      isDismissible: true,
      isActive: true,
      createdAt: Timestamp.now()
    }

    console.log('Creating second announcement with data:', announcement2Data)
    const docRef2 = await addDoc(collection(db, 'announcements'), announcement2Data)
    console.log('✅ Second demo announcement created with ID:', docRef2.id)
    
    console.log('\n🎯 Announcements collection created successfully!')
    console.log('You can now see the "announcements" collection in your Firebase console.')
    
  } catch (error) {
    console.error('❌ Error creating announcement:', error)
    console.error('Error details:', error.message)
  }
}

createDemoAnnouncement()
