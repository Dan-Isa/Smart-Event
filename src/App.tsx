
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Event, AudienceType } from './types';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import { v4 as uuidv4 } from 'uuid';


// --- MOCK DATABASE ---
const MOCK_USERS_DATA: { [key: string]: User } = {
    'admin@example.com': { uid: 'admin-uid', email: 'admin@example.com', username: 'Admin User', role: UserRole.ADMIN, institution: 'State University' },
    'lecturer@example.com': { uid: 'lecturer-uid', email: 'lecturer@example.com', username: 'John Doe', role: UserRole.LECTURER, institution: 'State University' },
    'student@example.com': { uid: 'student-uid', email: 'student@example.com', username: 'Alice Smith', role: UserRole.STUDENT, institution: 'State University', department: 'Computer Science', class: 'CS101' },
};

const MOCK_EVENTS_DATA: Event[] = [
    { id: '1', title: 'Career Fair 2024', description: 'Annual career fair for all departments.', date: new Date(new Date().getFullYear() + 1, 9, 25, 10, 0, 0), location: 'Main Hall', creatorId: 'admin-uid', creatorName: 'Admin User', institution: 'State University', targetAudience: { type: AudienceType.GENERAL }, registrations: Array(85).fill(0).map((_, i)=>({studentId: `s${i}`, studentName: `Student ${i}`, studentEmail: `s${i}@test.com`, registeredAt: new Date()})), feedback: [] },
    { id: '2', title: 'CS Department Mixer', description: 'Meet and greet for CS students and faculty.', date: new Date(new Date().getFullYear() + 1, 8, 15, 17, 0, 0), location: 'CS Building, Room 101', creatorId: 'lecturer-uid', creatorName: 'John Doe', institution: 'State University', targetAudience: { type: AudienceType.DEPARTMENT, value: 'Computer Science' }, registrations: Array(42).fill(0).map((_, i)=>({studentId: `s${i+100}`, studentName: `Student ${i+100}`, studentEmail: `s${i+100}@test.com`, registeredAt: new Date()})), feedback: [] },
    { id: '3', title: 'Advanced Algorithms Guest Lecture', description: 'Special lecture by Dr. Alan Turing.', date: new Date(new Date().getFullYear() + 1, 10, 5, 14, 0, 0), location: 'Lecture Hall C', creatorId: 'lecturer-uid', creatorName: 'John Doe', institution: 'State University', targetAudience: { type: AudienceType.CLASS, value: 'CS450' }, registrations: Array(110).fill(0).map((_, i)=>({studentId: `s${i+200}`, studentName: `Student ${i+200}`, studentEmail: `s${i+200}@test.com`, registeredAt: new Date()})), feedback: [] },
    { id: '4', title: 'Intro to Programming Workshop', description: 'Workshop for first-year CS students.', date: new Date(new Date().getFullYear() + 1, 8, 20, 13, 0, 0), location: 'Lab 3', creatorId: 'lecturer-uid', creatorName: 'John Doe', institution: 'State University', targetAudience: { type: AudienceType.CLASS, value: 'CS101' }, registrations: [], feedback: [] },
    { id: '5', title: 'Graduation Photo Day', description: 'A past event for feedback.', date: new Date(new Date().getFullYear() -1, 4, 20, 9, 0, 0), location: 'Campus Green', creatorId: 'admin-uid', creatorName: 'Admin User', institution: 'State University', targetAudience: { type: AudienceType.GENERAL }, registrations: [], feedback: [] },
    { id: '6', title: 'Art Department Exhibit', description: 'Showcasing student artwork.', date: new Date(new Date().getFullYear() + 1, 9, 10, 18, 0, 0), location: 'Fine Arts Building', creatorId: 'admin-uid', creatorName: 'Admin User', institution: 'State University', targetAudience: { type: AudienceType.DEPARTMENT, value: 'Fine Arts' }, registrations: Array(30).fill(0).map((_, i)=>({studentId: `s${i+300}`, studentName: `Student ${i+300}`, studentEmail: `s${i+300}@test.com`, registeredAt: new Date()})), feedback: [] },
];
// --- END MOCK DATABASE ---


export const AuthContext = React.createContext<{ user: User | null; loading: boolean; login: (email: string) => void; logout: () => void; updateUser: (updatedUser: Partial<User>) => void; }>({
    user: null,
    loading: true,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
});

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS_DATA);
    const [users, setUsers] = useState<User[]>(Object.values(MOCK_USERS_DATA));

    useEffect(() => {
        const loggedInUserEmail = localStorage.getItem('loggedInUser');
        if (loggedInUserEmail && MOCK_USERS_DATA[loggedInUserEmail as keyof typeof MOCK_USERS_DATA]) {
             setUser(MOCK_USERS_DATA[loggedInUserEmail as keyof typeof MOCK_USERS_DATA]);
        }
        setLoading(false);
    }, []);
    
    const login = (email: string) => {
        setLoading(true);
        setTimeout(() => {
            const foundUser = Object.values(MOCK_USERS_DATA).find(u => u.email === email);
            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem('loggedInUser', foundUser.email);
            } else {
                alert("User not found!");
            }
            setLoading(false);
        }, 500);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('loggedInUser');
    };

    const updateUser = (updatedUserInfo: Partial<User>) => {
        if(user) {
            const updatedUser = { ...user, ...updatedUserInfo };
            setUser(updatedUser);
            // In a real app, also update the MOCK_USERS_DATA or database
            const userKey = Object.keys(MOCK_USERS_DATA).find(k => MOCK_USERS_DATA[k].uid === user.uid) as keyof typeof MOCK_USERS_DATA;
            if(userKey) {
                MOCK_USERS_DATA[userKey] = updatedUser;
            }
            const newUsers = users.map(u => u.uid === updatedUser.uid ? updatedUser : u);
            setUsers(newUsers);
        }
    };

    const addEvent = (event: Omit<Event, 'id'>) => {
        const newEvent = { ...event, id: uuidv4() };
        setEvents(prev => [...prev, newEvent]);
    };

    const deleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
    };

    const addUser = (newUser: Pick<User, 'email' | 'role' | 'department' | 'class'>) => {
        if (Object.values(MOCK_USERS_DATA).some(u => u.email === newUser.email)) {
            alert("User with this email already exists!");
            return;
        }
        const uid = uuidv4();
        const userToAdd: User = {
            ...newUser,
            uid,
            institution: user!.institution,
            username: newUser.email.split('@')[0],
        };

        MOCK_USERS_DATA[newUser.email] = userToAdd;
        setUsers(prev => [...prev, userToAdd]);
    };

    const deleteUser = (userId: string) => {
        if(userId === user?.uid) {
            alert("You cannot delete your own account.");
            return;
        }
        const userToDelete = users.find(u => u.uid === userId);
        if (userToDelete?.email && MOCK_USERS_DATA[userToDelete.email]) {
            delete MOCK_USERS_DATA[userToDelete.email];
        }
        setUsers(prev => prev.filter(u => u.uid !== userId));
    };


    const authContextValue = useMemo(() => ({ user, loading, login, logout, updateUser }), [user, loading]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {!user ? (
                <LoginPage />
            ) : (
                <div className="flex h-screen bg-gray-100">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                        {user.role === UserRole.ADMIN && <AdminDashboard events={events} users={users} addEvent={addEvent} deleteEvent={deleteEvent} deleteUser={deleteUser} addUser={addUser} />}
                        {user.role === UserRole.LECTURER && <LecturerDashboard events={events} addEvent={addEvent} deleteEvent={deleteEvent} />}
                        {user.role === UserRole.STUDENT && <StudentDashboard events={events} />}
                    </main>
                </div>
            )}
        </AuthContext.Provider>
    );
}
