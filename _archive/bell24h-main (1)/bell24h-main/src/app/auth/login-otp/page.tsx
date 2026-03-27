'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, ArrowLeft, Shield, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function OTPLoginPage() {
  const router = useRouter();
  const { signIn, sendOTP, loading } = useAuth();
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Handle mobile number submission
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await sendOTP(mobile);
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      setError(err.message || err.error || 'Failed to send OTP. Please try again.');
    }
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    try {
      await signIn(mobile, otpValue);
      // AuthContext will handle redirect to dashboard
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError('');
    try {
      await sendOTP(mobile);
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
      startResendTimer();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  // Resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a1128] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl ring-8 ring-cyan-400/20">
              <span className="text-white font-black text-5xl tracking-tighter">B</span>
            </div>
            <div>
              <span className="text-5xl font-black text-white tracking-tight block">BELL</span>
              <span className="text-cyan-400 text-xs font-bold tracking-widest">24H</span>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-white mb-2">
              {step === 'mobile' ? 'Login to BELL' : 'Verify OTP'}
            </h1>
            <p className="text-gray-400">
              {step === 'mobile' 
                ? 'Enter your mobile number to receive OTP'
                : `OTP sent to +91 ${mobile}`
              }
            </p>
          </div>

          {/* Mobile Number Step */}
          {step === 'mobile' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none text-white placeholder-gray-500"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* OTP Inputs */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Enter OTP</label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          const prevInput = document.getElementById(`otp-${index - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none text-white"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-all shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Verify & Login
                    <CheckCircle className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-400">
                    Resend OTP in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Change Number */}
              <button
                type="button"
                onClick={() => {
                  setStep('mobile');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Mobile Number
              </button>
            </form>
          )}

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
            <div>
              <Shield className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">100% Secure</p>
            </div>
            <div>
              <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Instant Login</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          By continuing, you agree to BELL's{' '}
          <Link href="/legal/terms" className="text-cyan-400 hover:text-cyan-300 underline">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="text-cyan-400 hover:text-cyan-300 underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

