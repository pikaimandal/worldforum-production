const admin = require('firebase-admin');
const serviceAccount = require('./worldforum-production-firebase-adminsdk.json'); // You'll need to download this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'worldforum-production'
});

const db = admin.firestore();

async function initializeDatabase() {
  try {
    console.log('Initializing World Forum database...');

    // Create a welcome announcement
    const announcementRef = db.collection('announcements').doc();
    await announcementRef.set({
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create Firestore security rules
    console.log('Creating Firestore security rules...');
    
    console.log('✅ Database initialized successfully!');
    console.log('📝 Next steps:');
    console.log('1. Update Firestore security rules in the Firebase Console');
    console.log('2. Test the application');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
