import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { signUp } from '../lib/auth';
import { UserRole } from '../types/index';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { login, loading } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institution, setInstitution] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Login
        await login(email, password);
      } else {
        // Sign up (Admin only)
        if (password !== confirmPassword) {
          alert('Passwords do not match!');
          return;
        }

        if (!institution.trim()) {
          alert('Please enter your institution name.');
          return;
        }

        await signUp(email, password, UserRole.ADMIN, institution);
        alert('Account created successfully! You can now log in.');
        
        // Switch to login tab
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo quick login buttons (remove in production)
  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123456');
    
    // Auto-submit after a short delay
    setTimeout(() => {
      login(demoEmail, 'demo123456').catch((error) => {
        alert('Demo login failed. Please use the manual login form.');
      });
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-700">SmartEvents</h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Welcome back! Please sign in.' : 'Create your admin account'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center font-semibold transition ${
              isLogin
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center font-semibold transition ${
              !isLogin
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Admin Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                  Institution Name
                </label>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., State University"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading ? (
              <LoadingSpinner />
            ) : isLogin ? (
              'Log In'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Demo Section - Remove in Production */}
        {isLogin && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-center text-yellow-800 font-semibold mb-3">
              🚀 Demo Mode - Quick Login
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => quickLogin('student@example.com')}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition"
              >
                Login as Student
              </button>
              <button
                onClick={() => quickLogin('lecturer@example.com')}
                className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition"
              >
                Login as Lecturer
              </button>
              <button
                onClick={() => quickLogin('admin@example.com')}
                className="px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition"
              >
                Login as Admin
              </button>
            </div>
            <p className="text-xs text-center text-yellow-700 mt-3">
              Password for all demo accounts: <code className="bg-yellow-100 px-1 rounded">demo123456</code>
            </p>
          </div>
        )}

        {/* Help Text */}
        {isLogin && (
          <p className="text-center text-sm text-gray-600">
            First time here?{' '}
            <button
              onClick={() => setIsLogin(false)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create an admin account
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;