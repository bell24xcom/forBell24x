'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [supabase, setSupabase] = useState<any>(null);
  const [configError, setConfigError] = useState('');
  const [showManualReset, setShowManualReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);

  useEffect(() => {
    try {
      const client = createClientComponentClient();
      setSupabase(client);
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      setConfigError('Authentication service is not properly configured. Please check your environment variables.');
    }
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }

      setSuccess(`Password reset email sent to ${email}! Please check your inbox and spam folder. If you don't receive it within 5 minutes, please try again.`);
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      console.error('❌ Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualReset = async () => {
    if (!email || !newPassword) {
      setError('Please enter both email and new password');
      return;
    }

    setIsManualLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/manual-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setSuccess(`Password reset successfully! You can now login with your new password.`);
      setShowManualReset(false);
      setNewPassword('');
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      console.error('❌ Manual reset error:', error);
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleResetPassword();
    }
  };

  // Show configuration error if Supabase is not properly configured
  if (configError) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4'>
        <div className='max-w-md w-full'>
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6'>
              <span className='text-white font-bold text-2xl'>B</span>
            </div>
            <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2'>
              BELL24H
            </h1>
          </div>
          
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <div className='text-red-400 mr-3'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div>
                  <h3 className='text-red-800 font-semibold mb-2'>Configuration Error</h3>
                  <p className='text-red-800 text-sm'>{configError}</p>
                </div>
              </div>
            </div>
            
            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-900'>To fix this issue:</h3>
              <ol className='list-decimal list-inside text-sm text-gray-700 space-y-2'>
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to Settings → API</li>
                <li>Copy your Project URL and Anon Key</li>
                <li>Update your <code className='bg-gray-100 px-1 rounded'>.env.local</code> file with these values</li>
                <li>Restart your development server</li>
              </ol>
              
              <div className='mt-6'>
                <Link
                  href='/auth/login'
                  className='block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors'
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Reset Your Password
          </h2>
          <p className='text-gray-600'>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Reset Password Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
          {/* Success Message */}
          {success && (
            <div className='mb-6 bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center mb-2'>
                <div className='text-green-400 mr-3'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <p className='text-green-800 text-sm font-medium'>{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <div className='text-red-400 mr-3'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <p className='text-red-800 text-sm'>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className='space-y-6'>
            {/* Email Input */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Business Email
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                placeholder='Enter your business email'
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading || !email}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading || !email
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
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>

          {/* Manual Reset Option */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-3'>
                Didn't receive the email?
              </p>
              <button
                onClick={() => setShowManualReset(!showManualReset)}
                className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors'
              >
                Try Manual Reset
              </button>
            </div>
          </div>

          {/* Manual Reset Form */}
          {showManualReset && (
            <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <h3 className='text-sm font-semibold text-yellow-800 mb-3'>🔧 Manual Password Reset</h3>
              <div className='space-y-3'>
                <input
                  type='password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className='w-full px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500'
                  placeholder='Enter new password'
                  disabled={isManualLoading}
                />
                <button
                  onClick={handleManualReset}
                  disabled={isManualLoading || !email || !newPassword}
                  className={`w-full py-2 px-4 rounded-md font-medium text-sm ${
                    isManualLoading || !email || !newPassword
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {isManualLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-3'>
                Remember your password?
              </p>
              <Link
                href='/auth/login'
                className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors'
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <h3 className='text-sm font-semibold text-blue-800 mb-3'>💡 Need Help?</h3>
          <div className='space-y-2 text-sm text-blue-700'>
            <p>• Check your spam folder if you don't receive the email</p>
            <p>• Make sure you're using the email address you registered with</p>
            <p>• Contact support if you continue having issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
