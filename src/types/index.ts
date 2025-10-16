// ==========================================
// USER TYPES
// ==========================================

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
  createdAt: Date;
  updatedAt: Date;
}

// For Firestore documents (dates as Timestamps)
export interface UserDocument extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// ==========================================
// EVENT TYPES
// ==========================================

export enum AudienceType {
  GENERAL = 'general',
  DEPARTMENT = 'department',
  CLASS = 'class'
}

export interface TargetAudience {
  type: AudienceType;
  value?: string; // e.g., 'Computer Science' or 'CS101'
}

export interface Registration {
  studentId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: Date;
}

export interface RegistrationDocument extends Omit<Registration, 'registeredAt'> {
  registeredAt: FirebaseFirestore.Timestamp;
}

export interface Feedback {
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  submittedAt: Date;
}

export interface FeedbackDocument extends Omit<Feedback, 'submittedAt'> {
  submittedAt: FirebaseFirestore.Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  creatorId: string;
  creatorName: string;
  institution: string;
  targetAudience: TargetAudience;
  registrations: Registration[];
  feedback: Feedback[];
  createdAt: Date;
  updatedAt: Date;
}

// For Firestore documents
export interface EventDocument extends Omit<Event, 'date' | 'registrations' | 'feedback' | 'createdAt' | 'updatedAt'> {
  date: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================

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
  link?: string;
  isRead: boolean;
  createdAt: Date;
  eventId?: string;
}

export interface NotificationDocument extends Omit<Notification, 'createdAt'> {
  createdAt: FirebaseFirestore.Timestamp;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// FORM DATA TYPES
// ==========================================

export interface CreateEventData extends Omit<Event, 'id' | 'registrations' | 'feedback' | 'createdAt' | 'updatedAt'> {}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  institution: string;
  username?: string;
  department?: string;
  class?: string;
}

export interface UpdateUserData {
  username?: string;
  department?: string;
  class?: string;
}

// ==========================================
// QUERY FILTERS
// ==========================================

export interface EventFilters {
  institution?: string;
  creatorId?: string;
  targetAudienceType?: AudienceType;
  targetAudienceValue?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UserFilters {
  institution?: string;
  role?: UserRole;
  department?: string;
}

// ==========================================
// ANALYTICS TYPES
// ==========================================

export interface EventAnalytics {
  totalEvents: number;
  totalRegistrations: number;
  averageAttendance: number;
  upcomingEvents: number;
  pastEvents: number;
  eventsByDepartment: Record<string, number>;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
}

export interface InstitutionAnalytics extends EventAnalytics {
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  activeUsers: number;
}