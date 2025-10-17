import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Event } from './types/index';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';

// Firebase imports
import { onAuthChange, signIn as firebaseSignIn, signOutUser } from './lib/auth';
import {
  getEvents,
  getUsersByInstitution,
  createEvent as firestoreCreateEvent,
  deleteEvent as firestoreDeleteEvent,
  updateUserData,
  deleteUser as firestoreDeleteUser,
} from './lib/firestore';
import { functions } from './lib/config';
import { httpsCallable } from 'firebase/functions';

// ============================================
// AUTH CONTEXT
// ============================================

export const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
}>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // ============================================
  // AUTH STATE LISTENER
  // ============================================

  useEffect(() => {
    const unsubscribe = onAuthChange(async (userData) => {
      setUser(userData);
      
      if (userData) {
        // Load events and users when user logs in
        await loadData(userData.institution);
      } else {
        // Clear data on logout
        setEvents([]);
        setUsers([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // DATA LOADING
  // ============================================

  const loadData = async (institution: string) => {
    try {
      const [eventsData, usersData] = await Promise.all([
        getEvents(institution),
        getUsersByInstitution(institution),
      ]);
      
      setEvents(eventsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // ============================================
  // AUTH METHODS
  // ============================================

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await firebaseSignIn(email, password);
      setUser(userData);
      await loadData(userData.institution);
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setEvents([]);
      setUsers([]);
    } catch (error: any) {
      console.error('Logout error:', error);
      alert(error.message || 'Failed to logout');
    }
  };

  const updateUser = async (updatedUserInfo: Partial<User>) => {
    if (!user) return;
    
    try {
      await updateUserData(user.uid, updatedUserInfo);
      const updatedUser = { ...user, ...updatedUserInfo };
      setUser(updatedUser);
      
      // Update in local users list
      setUsers(prev => 
        prev.map(u => u.uid === updatedUser.uid ? updatedUser : u)
      );
    } catch (error: any) {
      console.error('Update user error:', error);
      alert(error.message || 'Failed to update profile');
    }
  };

  // ============================================
  // EVENT METHODS
  // ============================================

  const addEvent = async (eventData: Omit<Event, 'id' | 'registrations' | 'feedback' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEvent = await firestoreCreateEvent(eventData);
      setEvents(prev => [...prev, newEvent]);
    } catch (error: any) {
      console.error('Add event error:', error);
      alert(error.message || 'Failed to create event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await firestoreDeleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error: any) {
      console.error('Delete event error:', error);
      alert(error.message || 'Failed to delete event');
    }
  };

  // ============================================
  // USER MANAGEMENT METHODS (Admin only)
  // ============================================

  const addUser = async (newUser: Pick<User, 'email' | 'role' | 'department' | 'class'>) => {
    try {
      // Generate temporary password
      const temporaryPassword = generatePassword();
      
      // Call Cloud Function to create user
      const createUserFunction = httpsCallable(functions, 'createUser');
      const result = await createUserFunction({
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        class: newUser.class,
        temporaryPassword: temporaryPassword,
      });
      
      const data = result.data as any;
      
      if (data.success) {
        alert(
          `User created successfully!\n\n` +
          `Email: ${data.email}\n` +
          `Temporary Password: ${temporaryPassword}\n\n` +
          `Please share these credentials securely with the new user.`
        );
        
        // Reload users list
        if (user) {
          const updatedUsers = await getUsersByInstitution(user.institution);
          setUsers(updatedUsers);
        }
      }
    } catch (error: any) {
      console.error('Add user error:', error);
      alert(error.message || 'Failed to create user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === user?.uid) {
      alert('You cannot delete your own account.');
      return;
    }
    
    try {
      // Call Cloud Function to delete user
      const deleteUserFunction = httpsCallable(functions, 'deleteUser');
      await deleteUserFunction({ userId });
      
      // Update local state
      setUsers(prev => prev.filter(u => u.uid !== userId));
    } catch (error: any) {
      console.error('Delete user error:', error);
      alert(error.message || 'Failed to delete user');
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const generatePassword = (): string => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const authContextValue = useMemo(
    () => ({ user, loading, login, logout, updateUser }),
    [user, loading]
  );

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {!user ? (
        <LoginPage />
      ) : (
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {user.role === UserRole.ADMIN && (
              <AdminDashboard
                events={events}
                users={users}
                addEvent={addEvent}
                deleteEvent={deleteEvent}
                deleteUser={deleteUser}
                addUser={addUser}
              />
            )}
            {user.role === UserRole.LECTURER && (
              <LecturerDashboard
                events={events}
                addEvent={addEvent}
                deleteEvent={deleteEvent}
              />
            )}
            {user.role === UserRole.STUDENT && (
              <StudentDashboard events={events} />
            )}
          </main>
        </div>
      )}
    </AuthContext.Provider>
  );
}