'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * TEMPORARY DEMO LOGIN PAGE
 * 
 * ⚠️ WARNING: This is a temporary bypass for testing without MSG91.
 * Remove this page before production deployment.
 * 
 * Direct access: /auth/demo-login
 */
export default function DemoLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        // Store demo token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('demoMode', 'true'); // Mark as demo mode
        }
        
        setSuccess(true);
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(data.message || 'Demo login failed');
      }
    } catch (err) {
      setError('Something went wrong with demo login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger on page load (optional - comment out if you want manual click)
  // useEffect(() => {
  //   handleDemoLogin();
  // }, []);

  return (
    <div className="min-h-screen bg-[#0a1128] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <div className="w-12 h-12 bg-[#0070f3] rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <span className="text-3xl font-bold text-white">Bell24h</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              Demo Login
            </h1>
            <p className="text-gray-700">
              Temporary bypass for testing without MSG91
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 text-center">
              ⚠️ <strong>DEMO MODE:</strong> This bypasses MSG91 OTP for testing purposes only.
            </p>
            <p className="text-xs text-amber-600 text-center mt-2">
              Remove this page before production deployment.
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Demo login successful! Redirecting to dashboard...</span>
            </div>
          )}

          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading || success}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Login Successful!
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Demo Login (Temporary)
              </>
            )}
          </button>

          {/* Links */}
          <div className="mt-6 pt-6 border-t space-y-3 text-center">
            <Link 
              href="/auth/login-otp" 
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Regular Login
            </Link>
            <Link 
              href="/" 
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              Go to Homepage
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          By using demo login, you agree to Bell24h's{' '}
          <Link href="/legal/terms" className="underline">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

