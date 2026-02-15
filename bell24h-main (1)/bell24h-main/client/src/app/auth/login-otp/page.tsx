'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, ArrowLeft, Shield, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function OTPLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Handle mobile number submission
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate mobile number
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        setError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      // Call API to send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        startResendTimer();
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
    setLoading(true);

    try {
      const otpValue = otp.join('');
      if (otpValue.length !== 6) {
        setError('Please enter complete OTP');
        setLoading(false);
        return;
      }

      // Call API to verify OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: otpValue }),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth token
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
        startResendTimer();
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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

  // Handle demo login (temporary bypass for testing without MSG91)
  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        // Store demo token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('demoMode', 'true'); // Mark as demo mode
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Demo login failed');
      }
    } catch (err) {
      setError('Something went wrong with demo login.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              {step === 'mobile' ? 'Login to Bell24h' : 'Verify OTP'}
            </h1>
            <p className="text-gray-700">
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
                <label className="block text-sm font-semibold mb-2 text-gray-900">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:border-[#0070f3] text-gray-900 placeholder-gray-500 text-base font-medium"
                    style={{ color: '#111827' }}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full bg-[#0070f3] hover:bg-[#0051cc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
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

              {/* TEMPORARY DEMO LOGIN - For testing without MSG91 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">
                  ⚠️ MSG91 Pending? Use Demo Login for Testing
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Demo Login (Temporary)
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  This bypasses MSG91 OTP for testing purposes
                </p>
              </div>
            </form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* OTP Inputs */}
              <div>
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
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
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:border-[#0070f3] text-gray-900 placeholder-gray-400"
                      style={{ color: '#111827' }}
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-[#0070f3] hover:bg-[#0051cc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
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
                  <p className="text-sm text-gray-600">
                    Resend OTP in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm text-[#0070f3] hover:text-[#0051cc] font-semibold"
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
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Mobile Number
              </button>
            </form>
          )}

          {/* Features */}
          <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-4 text-center">
            <div>
              <Shield className="w-6 h-6 text-[#0070f3] mx-auto mb-2" />
              <p className="text-xs text-gray-700 font-medium">100% Secure</p>
            </div>
            <div>
              <Zap className="w-6 h-6 text-[#10b981] mx-auto mb-2" />
              <p className="text-xs text-gray-700 font-medium">Instant Login</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-sm mt-6">
          By continuing, you agree to Bell24h's{' '}
          <Link href="/legal/terms" className="underline">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

