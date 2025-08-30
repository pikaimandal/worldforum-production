// Test script to verify Firebase connection and message creation
// Run with: node test-firebase.js

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('🔥 Testing Firebase connection...');
    console.log('Project ID:', firebaseConfig.projectId);
    
    // Test reading messages collection
    console.log('\n📖 Reading messages collection...');
    const messagesSnapshot = await getDocs(collection(db, 'messages'));
    console.log('Messages found:', messagesSnapshot.size);
    
    messagesSnapshot.forEach((doc) => {
      console.log('Message:', doc.id, doc.data());
    });
    
    // Test reading users collection
    console.log('\n� Reading reports collection...')
  const reportsSnapshot = await getDocs(collection(db, 'reports'))
  console.log(`Reports found: ${reportsSnapshot.size}`)
  reportsSnapshot.forEach((doc) => {
    console.log(`Report: ${doc.id}`, doc.data())
  })

  console.log('\n�👥 Reading users collection...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('Users found:', usersSnapshot.size);
    
    usersSnapshot.forEach((doc) => {
      console.log('User:', doc.id, doc.data());
    });
    
    // Test creating a message
    console.log('\n✍️ Creating test message...');
    const testMessage = {
      userId: 'test-user-id',
      username: 'TestUser',
      text: 'This is a test message created via script',
      timestamp: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      replies: []
    };
    
    const docRef = await addDoc(collection(db, 'messages'), testMessage);
    console.log('Test message created with ID:', docRef.id);
    
    console.log('\n✅ Firebase test completed successfully!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

testFirebase();
