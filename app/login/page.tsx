'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // shown in dev mode when MSG91 not configured
  const [maskedPhone, setMaskedPhone] = useState('');
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) { setError('Please enter your phone number'); return; }

    setLoading(true);
    setError('');
    setDevOtp('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (data.success) {
        setMaskedPhone(data.phone || phone);
        // Dev mode: API returns OTP directly (MSG91 not configured)
        if (data.devOtp) {
          setDevOtp(data.devOtp);
          setOtp(data.devOtp); // auto-fill
        }
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (data.success) {
        // Store token in localStorage (httpOnly cookie already set by server)
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setStep('phone');
    setOtp('');
    setDevOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {step === 'phone' ? 'Sign in to Bell24h' : 'Enter OTP'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {step === 'phone'
              ? 'Enter your phone number to receive a one-time password'
              : `OTP sent to ${maskedPhone}`}
          </p>
        </div>

        <form
          className="bg-slate-800 p-8 rounded-xl border border-slate-700/50 space-y-5"
          onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP}
        >
          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Dev OTP notice */}
          {devOtp && (
            <div className="bg-yellow-900/30 border border-yellow-500/40 text-yellow-200 px-4 py-3 rounded-lg text-sm">
              <span className="font-semibold">Dev mode</span> — MSG91 not configured. Your OTP is:{' '}
              <span className="font-mono font-bold text-yellow-100 text-base tracking-widest">{devOtp}</span>
              <span className="block text-xs text-yellow-400 mt-1">(auto-filled below)</span>
            </div>
          )}

          {step === 'phone' ? (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                autoFocus
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-2">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                autoFocus
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {step === 'phone' ? 'Sending OTP…' : 'Verifying…'}
              </>
            ) : (
              step === 'phone' ? 'Send OTP' : 'Verify & Login'
            )}
          </button>

          {step === 'otp' && (
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Didn't receive? Resend OTP
              </button>
              <div>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </div>
          )}

          <div className="text-center border-t border-slate-700 pt-4">
            <p className="text-sm text-slate-400">
              New to Bell24h?{' '}
              <Link href="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
