
import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { User } from '../types';

const NotificationBell: React.FC = () => {
    // In a real app, this would fetch and display notifications.
    const [isOpen, setIsOpen] = React.useState(false);
    const notificationCount = 3; // Mock count

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-200 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notificationCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 text-sm text-gray-700 font-bold border-b">Notifications</div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Event 'Mid-term seminar' has been updated.</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">New event 'Career Fair 2024' is available.</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your registration for 'Guest Lecture' is confirmed.</a>
                </div>
            )}
        </div>
    );
}

const Navbar: React.FC = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <nav className="bg-primary-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-white text-xl">SmartEvents</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationBell />
                        <div className="text-right">
                            <p className="text-white font-semibold">{user.username || user.email}</p>
                            <p className="text-primary-200 text-sm capitalize">{user.role} @ {user.institution}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
