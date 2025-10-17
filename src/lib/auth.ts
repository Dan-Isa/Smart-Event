// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updatePassword,
  sendPasswordResetEmail,
  UserCredential,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserRole, COLLECTIONS, AppError, ErrorCode } from '../types';

// ============================================
// AUTHENTICATION METHODS
// ============================================

/**
 * Sign up a new user (Admin registration)
 */
export const signUp = async (
  email: string,
  password: string,
  role: UserRole,
  institution: string,
  additionalData?: { department?: string; class?: string }
): Promise<User> => {
  try {
    // Create authentication account
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user document in Firestore
    const userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'> = {
      email,
      username: email.split('@')[0],
      role,
      institution,
      department: additionalData?.department,
      class: additionalData?.class,
    };

    const userDocRef = doc(db, COLLECTIONS.USERS, userCredential.user.uid);
    await setDoc(userDocRef, {
      ...userData,
      uid: userCredential.user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: userCredential.user.uid,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new AppError(ErrorCode.ALREADY_EXISTS, 'Email already in use', 409);
    }
    if (error.code === 'auth/weak-password') {
      throw new AppError(ErrorCode.INVALID_INPUT, 'Password is too weak', 400);
    }
    
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to create account', 500);
  }
};

/**
 * Sign in existing user
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await getUserData(userCredential.user.uid);
    
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, 'User data not found', 404);
    }
    
    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    if (error instanceof AppError) throw error;
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid email or password', 401);
    }
    
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to sign in', 500);
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to sign out', 500);
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data();
    return {
      uid: userDoc.id,
      email: data.email,
      username: data.username,
      role: data.role,
      institution: data.institution,
      department: data.department,
      class: data.class,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userData = await getUserData(firebaseUser.uid);
      callback(userData);
    } else {
      callback(null);
    }
  });
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'No user logged in', 401);
    }
    
    await updatePassword(user, newPassword);
  } catch (error: any) {
    console.error('Update password error:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Please sign in again to update password',
        401
      );
    }
    
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update password', 500);
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    if (error.code === 'auth/user-not-found') {
      // Don't reveal if user exists for security
      return;
    }
    
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to send reset email', 500);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Generate a random temporary password
 */
export const generateTemporaryPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};