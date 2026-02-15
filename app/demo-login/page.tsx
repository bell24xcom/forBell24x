'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DemoLoginPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo OTP - In production, this would be sent via SMS
  const DEMO_OTP = '123456';

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
        
        // Store user session
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="page-header">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">B</div>
            <div>
              <div className="font-bold text-2xl">Bell24h</div>
              <div className="text-sm text-neutral-600">Verified B2B Platform</div>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Login with OTP</h1>
          <p className="text-neutral-600">Secure mobile authentication</p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">🔐</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Secure Login</h3>
              <p className="text-sm text-blue-800">
                Enter your 10-digit mobile number to receive OTP via SMS
              </p>
            </div>
          </div>
        </div>

        {/* Phone Step */}
        {step === 'phone' && (
          <div className="card">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Enter Phone Number</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label htmlFor="phone" className="form-label">
                  Mobile Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Demo: Use any 10-digit number (e.g., 9876543210)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || phone.length !== 10}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="card">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Enter OTP</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">🔑</span>
                <span className="text-sm text-yellow-800">
                  <strong>Demo OTP:</strong> 123456
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp" className="form-label">
                  OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 border border-neutral-300 text-neutral-700 py-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Login Successful!</h2>
            <p className="feature-description">Welcome to Bell24h Demo</p>
            <p className="text-sm text-neutral-500">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Quick Access Links */}
        <div className="mt-6 text-center">
          <p className="text-sm feature-description">Quick Access:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/marketplace" className="px-4 py-2 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
              Marketplace
            </Link>
            <Link href="/suppliers" className="px-4 py-2 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
              Suppliers
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
              Admin
            </Link>
            <Link href="/test-live" className="px-4 py-2 bg-white text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
              Test APIs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
