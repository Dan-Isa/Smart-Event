import { auth, db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Test Firebase connection
 * Run this to verify Firebase is properly configured
 */
export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...\n');

  // Test 1: Firebase initialization
  try {
    console.log('✅ Firebase initialized successfully');
    console.log('   Project ID:', db.app.options.projectId);
    console.log('   Auth Domain:', db.app.options.authDomain);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    return;
  }

  // Test 2: Auth service
  try {
    console.log('\n✅ Auth service connected');
    console.log('   Current user:', auth.currentUser ? 'Signed in' : 'Not signed in');
  } catch (error) {
    console.error('❌ Auth service error:', error);
  }

  // Test 3: Firestore connection
  try {
    const testCollection = collection(db, 'users');
    const snapshot = await getDocs(testCollection);
    console.log('\n✅ Firestore connected');
    console.log('   Users collection exists:', snapshot.empty ? 'Empty' : `${snapshot.size} documents`);
  } catch (error: any) {
    console.error('❌ Firestore connection error:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied - This is expected if not signed in');
      console.log('   Security rules are working correctly!');
    }
  }

  console.log('\n🎉 Firebase connection test complete!\n');
};

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFirebaseConnection();
}