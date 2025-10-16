import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Seed users
const seedUsers = [
  {
    email: 'admin@example.com',
    password: 'password123',
    username: 'Admin User',
    role: 'admin',
    institution: 'State University',
  },
  {
    email: 'lecturer@example.com',
    password: 'password123',
    username: 'John Doe',
    role: 'lecturer',
    institution: 'State University',
  },
  {
    email: 'student@example.com',
    password: 'password123',
    username: 'Alice Smith',
    role: 'student',
    institution: 'State University',
    department: 'Computer Science',
    class: 'CS101',
  },
];

// Seed events
const seedEvents = [
  {
    title: 'Career Fair 2024',
    description: 'Annual career fair for all departments.',
    date: new Date(new Date().getFullYear() + 1, 9, 25, 10, 0, 0),
    location: 'Main Hall',
    institution: 'State University',
    targetAudience: { type: 'general' },
  },
  {
    title: 'CS Department Mixer',
    description: 'Meet and greet for CS students and faculty.',
    date: new Date(new Date().getFullYear() + 1, 8, 15, 17, 0, 0),
    location: 'CS Building, Room 101',
    institution: 'State University',
    targetAudience: { type: 'department', value: 'Computer Science' },
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create users
    console.log('👥 Creating users...');
    for (const userData of seedUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        
        const { uid } = userCredential.user;
        
        await setDoc(doc(db, 'users', uid), {
          email: userData.email,
          username: userData.username,
          role: userData.role,
          institution: userData.institution,
          department: userData.department || null,
          class: userData.class || null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        
        console.log(`   ✅ Created user: ${userData.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ⚠️  User already exists: ${userData.email}`);
        } else {
          console.error(`   ❌ Error creating ${userData.email}:`, error.message);
        }
      }
    }

    // Get lecturer UID for creating events
    const lecturerEmail = 'lecturer@example.com';
    // Note: In a real scenario, you'd fetch this from Firestore
    // For now, you'll need to manually get the UID after first run
    
    console.log('\n📅 Creating events...');
    console.log('   ℹ️  Note: You need to manually add creatorId from users collection');
    console.log('   Run this script after noting down the lecturer UID\n');

    console.log('✅ Database seeding complete!\n');
    console.log('Next steps:');
    console.log('1. Check Firebase Console > Authentication for created users');
    console.log('2. Check Firebase Console > Firestore for user documents');
    console.log('3. Try logging in with admin@example.com / password123\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  }

  process.exit(0);
}

seedDatabase();