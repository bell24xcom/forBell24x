'use client';
import { useState } from 'react';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function AuthModal({ mode, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Handle login with NextAuth
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          setError('Invalid email or password. Please try again.');
        } else if (result?.ok) {
          // Successful login
          const user = {
            id: '1',
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            company: formData.company,
          };
          if (onSuccess) {
            onSuccess(user);
          }
          onClose();
        }
      } else {
        // Handle registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            company: formData.company,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Registration successful - now log them in
        const loginResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (loginResult?.ok) {
          const user = {
            id: data.user.id,
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            company: formData.company,
          };
          if (onSuccess) {
            onSuccess(user);
          }
          onClose();
        } else {
          setError('Registration successful but login failed. Please try logging in.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(`Failed to login with ${provider}. Please try again.`);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              {isLogin ? 'Welcome Back' : 'Join Bell24H'}
            </h2>
            <p className='text-slate-400'>
              {isLogin
                ? 'Sign in to your Global B2B Operating System account'
                : 'Create your enterprise account and transform your procurement'}
            </p>
          </div>
          <button onClick={onClose} className='text-slate-400 hover:text-white transition-colors'>
            <span>❌</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {!isLogin && (
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-slate-300 mb-2 text-sm font-medium'>First Name</label>
                <div className='relative'>
                  <span>👤</span>
                  <input
                    type='text'
                    required
                    className='w-full pl-10 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400'
                    placeholder='John'
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className='block text-slate-300 mb-2 text-sm font-medium'>Last Name</label>
                <input
                  type='text'
                  required
                  className='w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400'
                  placeholder='Doe'
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div>
            <label className='block text-slate-300 mb-2 text-sm font-medium'>Email</label>
            <div className='relative'>
              <span>📧</span>
              <input
                type='email'
                required
                className='w-full pl-10 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400'
                placeholder='john@company.com'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className='block text-slate-300 mb-2 text-sm font-medium'>Company</label>
              <input
                type='text'
                required
                className='w-full px-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400'
                placeholder='Your Company Ltd.'
                value={formData.company}
                onChange={e => handleInputChange('company', e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className='block text-slate-300 mb-2 text-sm font-medium'>Password</label>
            <div className='relative'>
              <span>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className='w-full pl-10 pr-12 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400'
                placeholder='Enter your password'
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                disabled={loading}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white'
                disabled={loading}
              >
                {showPassword ? <span>👁️</span> : <span>👁️</span>}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className='block text-slate-300 mb-2 text-sm font-medium'>
                Confirm Password
              </label>
              <div className='relative'>
                <span>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className='w-full pl-10 pr-4 py-3 border border-slate-600 rounded-xl bg-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-slate-400'
                  placeholder='Confirm your password'
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {error && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3'>
              <p className='text-red-400 text-sm'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin h-5 w-5 border-t-2 border-white rounded-full mr-2'></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          {/* Social Login Buttons */}
          <div className='space-y-3'>
            <button
              type='button'
              onClick={() => handleSocialLogin('google')}
              className='w-full bg-slate-700 border border-slate-600 text-white py-3 rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2'
              disabled={loading}
            >
              <span>Continue with Google</span>
            </button>
            <button
              type='button'
              onClick={() => handleSocialLogin('linkedin')}
              className='w-full bg-slate-700 border border-slate-600 text-white py-3 rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2'
              disabled={loading}
            >
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          {/* Switch Mode */}
          <div className='text-center text-sm text-slate-400'>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type='button'
              onClick={() => setIsLogin(!isLogin)}
              className='text-amber-400 hover:text-amber-300 font-medium transition-colors'
              disabled={loading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
