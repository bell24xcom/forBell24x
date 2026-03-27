'use client';

import { ArrowLeft, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EmailOTPVerificationProps {
  email: string;
  phone: string;
  onEmailVerified: (user: any) => void;
  onBack: () => void;
}

export default function EmailOTPVerification({ email, phone, onEmailVerified, onBack }: EmailOTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, phone })
      });

      const data = await response.json();

      if (data.success) {
        onEmailVerified(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to verify email OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(600);
        setError('');
        alert(`New OTP sent! Demo OTP: ${data.demoOTP}`);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Enter Email OTP</h2>
        <p className="text-gray-600 mt-2">
          We sent a 6-digit code to {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-3xl tracking-widest border border-gray-300 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength="6"
            required
          />
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Complete Registration'
          )}
        </button>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Change Email
          </button>

          <button
            type="button"
            onClick={resendOTP}
            disabled={resendLoading || timeLeft > 0}
            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center text-sm"
          >
            {resendLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : timeLeft > 0 ? (
              `Resend in ${formatTime(timeLeft)}`
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-1" />
                Resend OTP
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Demo Mode
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Check the console for the OTP code. In production, you'll receive it via email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
