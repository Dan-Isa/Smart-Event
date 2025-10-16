
// // This is a placeholder for Firebase configuration.
// // In a real application, you would replace the placeholder values
// // with your actual Firebase project configuration.
// // IMPORTANT: Do not commit your actual API keys to a public repository.
// // Use environment variables to store sensitive information.

// // 1. Go to your Firebase project settings.
// // 2. Under "Your apps", find your web app or create a new one.
// // 3. Find and copy the firebaseConfig object.
// // 4. Paste it here.
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY", // process.env.REACT_APP_FIREBASE_API_KEY
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// // To make this app functional, you would need to:
// // 1. **Initialize Firebase**:
// //    - `import { initializeApp } from "firebase/app";`
// //    - `const app = initializeApp(firebaseConfig);`
// // 2. **Get Auth and Firestore instances**:
// //    - `import { getAuth } from "firebase/auth";`
// //    - `import { getFirestore } from "firebase/firestore";`
// //    - `export const auth = getAuth(app);`
// //    - `export const db = getFirestore(app);`
// // 3. **Enable Authentication Methods**:
// //    - In the Firebase console, go to Authentication -> Sign-in method and enable "Email/Password".
// // 4. **Set up Firestore Security Rules**:
// //    - This is CRITICAL for a multi-tenant application to ensure data privacy between institutions.
// //    - Example rules in `firestore.rules`:
// /*
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Users can only read their own user document
//     match /users/{userId} {
//       allow read, update: if request.auth.uid == userId;
//     }

//     // Admins can create other users within their institution
//     match /users/{userId} {
//        allow create: if request.auth.token.role == 'admin' && request.resource.data.institution == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.institution;
//     }

//     // All authenticated users can only access data within their own institution
//     match /{collection}/{docId} {
//       allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.institution == resource.data.institution;
//     }
//   }
// }
// */
// // 5. **Cloud Functions for Notifications**:
// //    - To send email notifications automatically, you would set up Firebase Cloud Functions.
// //    - Example: A function that triggers on a new document write to a 'notifications' collection
// //      and uses a service like SendGrid or Nodemailer to send an email.

// export const mockFirebase = {
//     // This object simulates a Firebase environment for demonstration purposes.
//     // Replace these with actual Firebase calls.
//     auth: {
//         onAuthStateChanged: (callback: (user: any) => void) => {
//             // Simulate user state change
//             return () => {}; // return unsubscribe function
//         },
//     },
//     db: {}
// };

// // Export the mock objects so the app can run without a real Firebase backend.
// export const auth = mockFirebase.auth;
// export const db = mockFirebase.db;


import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
];

requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});

// Initialize Firebase (prevent multiple initializations)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app);

// Enable emulators in development
if (import.meta.env.DEV) {
  // Uncomment to use Firebase Emulators
  // import { connectAuthEmulator } from 'firebase/auth';
  // import { connectFirestoreEmulator } from 'firebase/firestore';
  // import { connectFunctionsEmulator } from 'firebase/functions';
  
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;