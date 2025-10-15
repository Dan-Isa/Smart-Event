
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
}

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

export interface Feedback {
    studentId: string;
    studentName: string;
    rating: number; // 1-5
    comment: string;
    submittedAt: Date;
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
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}
