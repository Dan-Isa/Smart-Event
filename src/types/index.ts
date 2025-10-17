// ============================================
// SHARED TYPES FOR FRONTEND & BACKEND
// ============================================

import { Timestamp } from 'firebase/firestore';

// ============================================
// USER TYPES
// ============================================

export enum UserRole {
  ADMIN = 'admin',
  LECTURER = 'lecturer',
  STUDENT = 'student',
}

export interface User {
  uid: string;
  email: string;
  username?: string;
  role: UserRole;
  institution: string;
  department?: string;
  class?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Firestore document version (with Timestamps)
export interface UserDocument extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// EVENT TYPES
// ============================================

export enum AudienceType {
  GENERAL = 'general',
  DEPARTMENT = 'department',
  CLASS = 'class',
}

export interface TargetAudience {
  type: AudienceType;
  value?: string; // e.g., 'Computer Science' or 'CS101'
}

export interface Registration {
  studentId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: Date | Timestamp;
}

export interface RegistrationDocument extends Omit<Registration, 'registeredAt'> {
  registeredAt: Timestamp;
}

export interface Feedback {
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  submittedAt: Date | Timestamp;
}

export interface FeedbackDocument extends Omit<Feedback, 'submittedAt'> {
  submittedAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date | Timestamp;
  location: string;
  creatorId: string;
  creatorName: string;
  institution: string;
  targetAudience: TargetAudience;
  registrations: Registration[];
  feedback: Feedback[];
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// Firestore document version
export interface EventDocument extends Omit<Event, 'date' | 'registrations' | 'feedback' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  registrations: RegistrationDocument[];
  feedback: FeedbackDocument[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export enum NotificationType {
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_CANCELLED = 'event_cancelled',
  REGISTRATION_CONFIRMED = 'registration_confirmed',
  EVENT_REMINDER = 'event_reminder',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  eventId?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date | Timestamp;
}

export interface NotificationDocument extends Omit<Notification, 'createdAt'> {
  createdAt: Timestamp;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateEventRequest {
  title: string;
  description: string;
  date: Date;
  location: string;
  targetAudience: TargetAudience;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  id: string;
}

export interface RegisterForEventRequest {
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

export interface SubmitFeedbackRequest {
  eventId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
}

export interface CreateUserRequest {
  email: string;
  role: UserRole;
  institution: string;
  department?: string;
  class?: string;
  temporaryPassword: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type WithoutId<T> = Omit<T, 'id'>;
export type WithTimestamps<T> = T & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// Convert Firestore Timestamp to Date for frontend
export type ConvertTimestamps<T> = {
  [K in keyof T]: T[K] extends Timestamp
    ? Date
    : T[K] extends Array<infer U>
    ? Array<ConvertTimestamps<U>>
    : T[K] extends object
    ? ConvertTimestamps<T[K]>
    : T[K];
};

// ============================================
// FIRESTORE COLLECTION NAMES
// ============================================

export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  NOTIFICATIONS: 'notifications',
  INSTITUTIONS: 'institutions',
} as const;

// ============================================
// ERROR TYPES
// ============================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export enum ErrorCode {
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  ALREADY_EXISTS = 'already_exists',
  INVALID_INPUT = 'invalid_input',
  INTERNAL_ERROR = 'internal_error',
}