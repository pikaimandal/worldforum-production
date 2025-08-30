// Admin script for managing reports and messages
// Run with: node admin-tools.js

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function adminTools() {
  console.log('🔧 Admin Tools for WorldForum Reports')
  console.log('=====================================')
  
  // Show all pending reports
  console.log('\n📋 Pending Reports:')
  const pendingQuery = query(collection(db, 'reports'), where('status', '==', 'pending'))
  const pendingSnapshot = await getDocs(pendingQuery)
  
  if (pendingSnapshot.empty) {
    console.log('No pending reports found.')
  } else {
    pendingSnapshot.forEach((doc) => {
      const report = doc.data()
      console.log(`- Report ID: ${doc.id}`)
      console.log(`  Message: ${report.messageId}`)
      console.log(`  Reason: ${report.reason}`)
      console.log(`  Reporter: ${report.reporterUsername}`)
      console.log(`  Created: ${report.createdAt?.toDate?.() || 'Unknown'}`)
      console.log('')
    })
  }
  
  // Show messages with high report counts
  console.log('\n🚨 Messages with Multiple Reports:')
  const messagesSnapshot = await getDocs(collection(db, 'messages'))
  const problematicMessages = []
  
  messagesSnapshot.forEach((doc) => {
    const message = doc.data()
    if (message.reportCount && message.reportCount > 1) {
      problematicMessages.push({
        id: doc.id,
        text: message.text,
        reportCount: message.reportCount,
        username: message.username
      })
    }
  })
  
  if (problematicMessages.length === 0) {
    console.log('No messages with multiple reports.')
  } else {
    problematicMessages.forEach(msg => {
      console.log(`- Message ID: ${msg.id}`)
      console.log(`  Text: "${msg.text}"`)
      console.log(`  Author: ${msg.username}`)
      console.log(`  Reports: ${msg.reportCount}`)
      console.log('')
    })
  }
  
  console.log('\n💡 To manage reports:')
  console.log('1. Use Firebase Console to manually update report status')
  console.log('2. Import updateReportStatus() function in your admin panel')
  console.log('3. Import deleteMessageAndUpdateReports() to remove problematic messages')
}

adminTools().catch(console.error)
