
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
    const { login, loading } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [institution, setInstitution] = useState('State University');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            login(email);
        } else {
            alert("Please enter an email.");
        }
    };
    
    const userOptions = [
        { email: 'student@example.com', label: 'Student' },
        { email: 'lecturer@example.com', label: 'Lecturer' },
        { email: 'admin@example.com', label: 'Admin' },
    ];
    
    const institutionOptions = ['State University', 'City College', 'Tech Institute'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary-700">Smart Event System</h1>
                    <p className="text-gray-500 mt-2">Welcome! Please sign in to your account.</p>
                </div>

                <div className="flex border-b">
                    <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-center font-semibold ${isLogin ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}>
                        Login
                    </button>
                    <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-center font-semibold ${!isLogin ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}>
                        Admin Sign Up
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="institution" className="text-sm font-medium text-gray-700">
                            Institution
                        </label>
                        <select
                            id="institution"
                            name="institution"
                            required
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            {institutionOptions.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                    >
                        {loading ? <LoadingSpinner /> : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                 <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-center text-primary-800 font-semibold">For Demo Purposes:</p>
                    <p className="text-xs text-center text-primary-700 mb-2">Select a user to pre-fill the form.</p>
                    <div className="flex justify-center gap-2">
                        {userOptions.map(opt => (
                            <button key={opt.email} onClick={() => { setEmail(opt.email); setInstitution('State University'); setPassword('password123') }} className="px-3 py-1 text-xs bg-primary-100 text-primary-800 rounded-full hover:bg-primary-200">
                                Login as {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
