// ============================================
// FIRESTORE DATABASE OPERATIONS
// ============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  WhereFilterOp,
  arrayUnion,
  arrayRemove,
  DocumentData,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  Event,
  User,
  Notification,
  COLLECTIONS,
  AppError,
  ErrorCode,
  EventDocument,
  UserRole,
  Registration,
  Feedback,
  AudienceType,
} from '../types';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Firestore Timestamp to Date
 */
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * Convert Date to Firestore Timestamp
 */
const dateToTimestamp = (date: Date | Timestamp): Timestamp => {
  if (date instanceof Timestamp) return date;
  return Timestamp.fromDate(date);
};

/**
 * Check user authorization
 */
const checkAuth = (requiredRoles?: UserRole[]): string => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'User not authenticated', 401);
  }
  return currentUser.uid;
};

// ============================================
// EVENT OPERATIONS
// ============================================

/**
 * Create a new event
 */
export const createEvent = async (
  eventData: Omit<Event, 'id' | 'registrations' | 'feedback' | 'createdAt' | 'updatedAt'>
): Promise<Event> => {
  try {
    const userId = checkAuth();
    
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      date: dateToTimestamp(eventData.date as Date),
      registrations: [],
      feedback: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      id: docRef.id,
      ...eventData,
      registrations: [],
      feedback: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Create event error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to create event', 500);
  }
};

/**
 * Get event by ID
 */
export const getEvent = async (eventId: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      return null;
    }
    
    const data = eventSnap.data();
    return {
      id: eventSnap.id,
      title: data.title,
      description: data.description,
      date: timestampToDate(data.date),
      location: data.location,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      institution: data.institution,
      targetAudience: data.targetAudience,
      registrations: (data.registrations || []).map((r: any) => ({
        ...r,
        registeredAt: timestampToDate(r.registeredAt),
      })),
      feedback: (data.feedback || []).map((f: any) => ({
        ...f,
        submittedAt: timestampToDate(f.submittedAt),
      })),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  } catch (error) {
    console.error('Get event error:', error);
    return null;
  }
};

/**
 * Get events by institution with optional filters
 */
export const getEvents = async (
  institution: string,
  filters?: {
    creatorId?: string;
    targetAudienceType?: AudienceType;
    targetAudienceValue?: string;
    upcoming?: boolean;
  }
): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, COLLECTIONS.EVENTS);
    let q = query(
      eventsRef,
      where('institution', '==', institution),
      orderBy('date', 'desc')
    );
    
    if (filters?.creatorId) {
      q = query(eventsRef, where('institution', '==', institution), where('creatorId', '==', filters.creatorId));
    }
    
    const querySnapshot = await getDocs(q);
    let events: Event[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        title: data.title,
        description: data.description,
        date: timestampToDate(data.date),
        location: data.location,
        creatorId: data.creatorId,
        creatorName: data.creatorName,
        institution: data.institution,
        targetAudience: data.targetAudience,
        registrations: (data.registrations || []).map((r: any) => ({
          ...r,
          registeredAt: timestampToDate(r.registeredAt),
        })),
        feedback: (data.feedback || []).map((f: any) => ({
          ...f,
          submittedAt: timestampToDate(f.submittedAt),
        })),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      };
      events.push(event);
    });
    
    // Apply client-side filters
    if (filters?.upcoming) {
      const now = new Date();
      events = events.filter(e => e.date > now);
    }
    
    if (filters?.targetAudienceType) {
      events = events.filter(e => e.targetAudience.type === filters.targetAudienceType);
    }
    
    if (filters?.targetAudienceValue) {
      events = events.filter(e => e.targetAudience.value === filters.targetAudienceValue);
    }
    
    return events;
  } catch (error) {
    console.error('Get events error:', error);
    return [];
  }
};

/**
 * Update event
 */
export const updateEvent = async (
  eventId: string,
  updates: Partial<Omit<Event, 'id' | 'registrations' | 'feedback'>>
): Promise<void> => {
  try {
    checkAuth();
    
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    if (updates.date) {
      updateData.date = dateToTimestamp(updates.date as Date);
    }
    
    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('Update event error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update event', 500);
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    checkAuth();
    
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Delete event error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to delete event', 500);
  }
};

/**
 * Register student for event
 */
export const registerForEvent = async (
  eventId: string,
  registration: Omit<Registration, 'registeredAt'>
): Promise<void> => {
  try {
    checkAuth();
    
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Event not found', 404);
    }
    
    const event = eventSnap.data();
    const isAlreadyRegistered = event.registrations?.some(
      (r: any) => r.studentId === registration.studentId
    );
    
    if (isAlreadyRegistered) {
      throw new AppError(ErrorCode.ALREADY_EXISTS, 'Already registered for this event', 409);
    }
    
    await updateDoc(eventRef, {
      registrations: arrayUnion({
        ...registration,
        registeredAt: serverTimestamp(),
      }),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Register for event error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to register for event', 500);
  }
};

/**
 * Unregister student from event
 */
export const unregisterFromEvent = async (
  eventId: string,
  studentId: string
): Promise<void> => {
  try {
    checkAuth();
    
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Event not found', 404);
    }
    
    const event = eventSnap.data();
    const registration = event.registrations?.find(
      (r: any) => r.studentId === studentId
    );
    
    if (!registration) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Registration not found', 404);
    }
    
    await updateDoc(eventRef, {
      registrations: arrayRemove(registration),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to unregister from event', 500);
  }
};

/**
 * Submit feedback for event
 */
export const submitFeedback = async (
  eventId: string,
  feedback: Omit<Feedback, 'submittedAt'>
): Promise<void> => {
  try {
    checkAuth();
    
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Event not found', 404);
    }
    
    const event = eventSnap.data();
    const hasAlreadySubmitted = event.feedback?.some(
      (f: any) => f.studentId === feedback.studentId
    );
    
    if (hasAlreadySubmitted) {
      throw new AppError(ErrorCode.ALREADY_EXISTS, 'Feedback already submitted', 409);
    }
    
    await updateDoc(eventRef, {
      feedback: arrayUnion({
        ...feedback,
        submittedAt: serverTimestamp(),
      }),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to submit feedback', 500);
  }
};

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    const data = userSnap.data();
    return {
      uid: userSnap.id,
      email: data.email,
      username: data.username,
      role: data.role,
      institution: data.institution,
      department: data.department,
      class: data.class,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Get all users by institution
 */
export const getUsersByInstitution = async (institution: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS);
    const q = query(usersRef, where('institution', '==', institution));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email,
        username: data.username,
        role: data.role,
        institution: data.institution,
        department: data.department,
        class: data.class,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
      });
    });
    
    return users;
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};

/**
 * Update user data
 */
export const updateUserData = async (
  userId: string,
  updates: Partial<Omit<User, 'uid' | 'email' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    checkAuth();
    
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update user', 500);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    checkAuth();
    
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Delete user error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to delete user', 500);
  }
};

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

/**
 * Create notification
 */
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Create notification error:', error);
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to create notification', 500);
  }
};

/**
 * Get notifications for user
 */
export const getUserNotifications = async (
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        userId: data.userId,
        type: data.type,
        message: data.message,
        eventId: data.eventId,
        link: data.link,
        isRead: data.isRead,
        createdAt: timestampToDate(data.createdAt),
      });
    });
    
    return notifications;
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    checkAuth();
    
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to mark notification as read', 500);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    checkAuth();
    
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Delete notification error:', error);
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to delete notification', 500);
  }
};

// ============================================
// ANALYTICS OPERATIONS
// ============================================

/**
 * Get event statistics
 */
export const getEventStats = async (eventId: string) => {
  try {
    const event = await getEvent(eventId);
    if (!event) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Event not found', 404);
    }
    
    const totalRegistrations = event.registrations.length;
    const totalFeedback = event.feedback.length;
    const averageRating = totalFeedback > 0
      ? event.feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
      : 0;
    
    return {
      eventId,
      title: event.title,
      totalRegistrations,
      totalFeedback,
      averageRating: Number(averageRating.toFixed(2)),
      feedbackSubmissionRate: totalRegistrations > 0
        ? Number(((totalFeedback / totalRegistrations) * 100).toFixed(2))
        : 0,
    };
  } catch (error) {
    console.error('Get event stats error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get event stats', 500);
  }
};

/**
 * Get institution-wide analytics
 */
export const getInstitutionStats = async (institution: string) => {
  try {
    const events = await getEvents(institution);
    const users = await getUsersByInstitution(institution);
    
    const totalRegistrations = events.reduce((sum, e) => sum + e.registrations.length, 0);
    const totalFeedback = events.reduce((sum, e) => sum + e.feedback.length, 0);
    
    const allRatings = events.flatMap(e => e.feedback.map(f => f.rating));
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;
    
    return {
      totalEvents: events.length,
      totalUsers: users.length,
      totalStudents: users.filter(u => u.role === UserRole.STUDENT).length,
      totalLecturers: users.filter(u => u.role === UserRole.LECTURER).length,
      totalAdmins: users.filter(u => u.role === UserRole.ADMIN).length,
      totalRegistrations,
      totalFeedback,
      averageRating: Number(averageRating.toFixed(2)),
    };
  } catch (error) {
    console.error('Get institution stats error:', error);
    throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get institution stats', 500);
  }
}