'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, MessageSquare, Shield } from 'lucide-react';
import Link from 'next/link';

export default function MobileOTPLoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send OTP to mobile number
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      if (response.ok) {
        setOtpSent(true);
        setStep('otp');
        // In real implementation, you would get the OTP from MSG91
        console.log('OTP sent to:', phoneNumber);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      });

      if (response.ok) {
        const data = await response.json();
        // Store user session
        localStorage.setItem('bell24h_user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      if (response.ok) {
        setError('');
        alert('OTP resent successfully!');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Secure Mobile Login
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your mobile number to receive OTP' 
              : 'Enter the OTP sent to your mobile'
            }
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {step === 'phone' ? (
                <>
                  <Phone className="h-5 w-5 text-indigo-600" />
                  Mobile Number
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  Enter OTP
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full"
                    pattern="[0-9+\-\s()]{10,15}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your 10-digit mobile number
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10}
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    OTP sent to +91 {phoneNumber.slice(-10)}
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify & Login
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Change Mobile Number
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Didn't receive OTP? Resend
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Secure & Fast</span>
              </div>
              <p className="text-green-700 text-xs mt-1">
                Your mobile number is verified via OTP for secure access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
