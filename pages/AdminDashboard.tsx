
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Event, User, UserRole } from '../types';
import Modal from '../components/Modal';
import EventForm from '../components/EventForm';

// --- PROPS INTERFACES FOR SUB-COMPONENTS ---
interface EventManagementProps {
    events: Event[];
    addEvent: (event: Omit<Event, 'id' | 'registrations' | 'feedback'>) => void;
    deleteEvent: (eventId: string) => void;
}

interface UserManagementProps {
    users: User[];
    deleteUser: (userId: string) => void;
    addUser: (user: Pick<User, 'email' | 'role' | 'department' | 'class'>) => void;
}

interface AnalyticsDashboardProps {
    events: Event[];
    users: User[];
}

interface AdminDashboardProps extends EventManagementProps, UserManagementProps {}


// --- SUB-COMPONENTS ---

const EventManagement: React.FC<EventManagementProps> = ({ events, addEvent, deleteEvent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateEvent = (eventData: Omit<Event, 'id' | 'registrations' | 'feedback'>) => {
        addEvent(eventData);
        setIsModalOpen(false);
    };

    return (
         <div className="bg-white p-6 rounded-lg shadow">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Events</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Create Event</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {events.map(event => (
                             <tr key={event.id}>
                                <td className="py-2 px-4 whitespace-nowrap">{event.title}</td>
                                <td className="py-2 px-4 whitespace-nowrap">{event.date.toLocaleDateString()}</td>
                                <td className="py-2 px-4 whitespace-nowrap">{event.registrations.length}</td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                    <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
                <EventForm onSubmit={handleCreateEvent} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

interface UserOnboardingFormProps {
    addUser: (user: Pick<User, 'email' | 'role' | 'department' | 'class'>) => void;
    onClose: () => void;
}

const UserOnboardingForm: React.FC<UserOnboardingFormProps> = ({ addUser, onClose }) => {
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [userClass, setUserClass] = useState('');

    const departments = ["Information System", "Information Technology", "Software Engineering", "Cybersecurity", "Computer Science"];
    const classes = ["100lvl", "200lvl", "300lvl", "400lvl"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: Pick<User, 'email' | 'role' | 'department' | 'class'> = {
            email,
            role,
            department: role === UserRole.STUDENT ? department : undefined,
            class: role === UserRole.STUDENT ? userClass : undefined,
        };
        addUser(newUser);
        onClose();
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                    <option value={UserRole.STUDENT}>Student</option>
                    <option value={UserRole.LECTURER}>Lecturer</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            {role === UserRole.STUDENT && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select value={department} onChange={e => setDepartment(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Class Level</label>
                        <select value={userClass} onChange={e => setUserClass(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </>
            )}
            <div className="flex justify-end pt-4 space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Generate Credentials & Onboard</button>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                <strong>Note:</strong> A username and temporary password will be generated. You must securely share these with the new user.
            </div>
        </form>
    );
};


const UserManagement: React.FC<UserManagementProps> = ({ users, deleteUser, addUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Users</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">Onboard New User</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / Username</th>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="py-3 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                             <tr key={user.uid}>
                                <td className="py-2 px-4 whitespace-nowrap">{user.username || user.email}</td>
                                <td className="py-2 px-4 whitespace-nowrap capitalize">{user.role}</td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                    <button onClick={() => deleteUser(user.uid)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New User">
                <UserOnboardingForm addUser={addUser} onClose={() => setIsModalOpen(false)}/>
            </Modal>
        </div>
    );
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ events, users }) => {
    const totalRegistrations = useMemo(() => events.reduce((acc, event) => acc + event.registrations.length, 0), [events]);
    
    const analyticsData = useMemo(() => events.slice(0, 5).map(event => ({
        name: event.title.length > 15 ? event.title.substring(0, 12) + '...' : event.title,
        registrations: event.registrations.length,
    })), [events]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500">Total Events</h3>
                <p className="text-3xl font-bold">{events.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500">Total Users</h3>
                <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500">Total Registrations</h3>
                <p className="text-3xl font-bold">{totalRegistrations}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500">Avg. Feedback</h3>
                <p className="text-3xl font-bold">4.6 / 5</p>
            </div>

            <div className="md:col-span-2 lg:col-span-4 bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-4">Event Performance (Top 5 by Registrations)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="registrations" fill="#4F46E5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, users, addEvent, deleteEvent, deleteUser, addUser }) => {
    const [activeTab, setActiveTab] = useState('events');

    const renderContent = () => {
        switch (activeTab) {
            case 'events': return <EventManagement events={events} addEvent={addEvent} deleteEvent={deleteEvent} />;
            case 'users': return <UserManagement users={users} deleteUser={deleteUser} addUser={addUser} />;
            case 'analytics': return <AnalyticsDashboard events={events} users={users} />;
            default: return null;
        }
    };

    return (
        <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('events')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'events' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Event Management
                    </button>
                     <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        User Management
                    </button>
                     <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Analytics
                    </button>
                </nav>
            </div>
            <div className="mt-6">{renderContent()}</div>
        </div>
    );
};

export default AdminDashboard;
