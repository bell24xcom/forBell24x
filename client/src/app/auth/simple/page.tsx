'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SimpleAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/bell24h', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          action: isRegister ? 'register' : 'login',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);

        // Store token and user data
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('bell24h-user', JSON.stringify(data.user));

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        {/* Header */}
        <div className='text-center mb-8'>
          <Link href='/' className='inline-block mb-6'>
            <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-2xl'>B</span>
            </div>
          </Link>
          <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2'>
            BELL24H
          </h1>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className='text-gray-600'>
            {isRegister ? 'Join the B2B marketplace' : 'Sign in to your business account'}
          </p>
        </div>

        {/* Auth Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          {/* Success/Error Messages */}
          {success && (
            <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
              <p className='text-green-800 text-sm'>{success}</p>
            </div>
          )}

          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Business Email
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='Enter your business email'
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='Enter your password'
                required
                disabled={isLoading}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading || !email || !password}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading || !email || !password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8v8l4-4H4z'
                    ></path>
                  </svg>
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-3'>
                {isRegister ? 'Already have an account?' : "Don't have a business account?"}
              </p>
              <button
                onClick={() => setIsRegister(!isRegister)}
                className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors'
              >
                {isRegister ? 'Sign in instead' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <h3 className='text-sm font-semibold text-blue-800 mb-3'>🚀 Quick Access</h3>
          <div className='space-y-2'>
            <Link
              href='/dashboard'
              className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors'
            >
              Direct Dashboard Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
