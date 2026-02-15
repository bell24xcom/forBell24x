<<<<<<< HEAD
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, MessageSquare, Mail, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'email' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const router = useRouter();

  // Step 1: Send Mobile OTP (Primary - Cost Effective)
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send Mobile OTP first (Save money)
      const response = await fetch('/api/auth/send-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if user is existing (has email registered)
        if (data.data.isExistingUser) {
          setIsExistingUser(true);
          setUserData(data.data.user);
          setSuccessMessage(`Welcome back! OTP sent to ${phoneNumber}. We'll also send email OTP to your registered email.`);
        } else {
          setIsExistingUser(false);
          setSuccessMessage(`OTP sent to ${phoneNumber}. New user detected - mobile verification only.`);
        }
        
        setStep('otp');
        console.log('Mobile OTP sent to:', phoneNumber);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Mobile OTP
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify Mobile OTP
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      });

      if (response.ok) {
        const data = await response.json();
        
        // If existing user, proceed to email OTP
        if (data.data.isExistingUser && data.data.user.email) {
          setUserData(data.data.user);
          setStep('email');
          setSuccessMessage('Mobile OTP verified! Now verifying your email...');
          
          // Automatically send email OTP
          await sendEmailOTP(data.data.user.email);
        } else {
          // New user - mobile verification complete
          localStorage.setItem('bell24h_user', JSON.stringify(data.data.user));
          setStep('success');
          setSuccessMessage('Login successful! Welcome to Bell24h.');
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Send Email OTP for existing users
  const sendEmailOTP = async (userEmail: string) => {
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          phoneNumber,
          userName: userData?.name || 'User'
        })
      });

      if (response.ok) {
        setSuccessMessage(`Email OTP sent to ${userEmail}. Please check your inbox.`);
      } else {
        setError('Failed to send email OTP. Please try again.');
      }
    } catch (err) {
      setError('Failed to send email OTP. Please try again.');
    }
  };

  // Step 4: Verify Email OTP (Final verification for existing users)
  const handleEmailOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userData.email, 
          emailOtp: otp,
          phoneNumber,
          mobileOtpVerified: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('bell24h_user', JSON.stringify(data.data.user));
        setStep('success');
        setSuccessMessage('Dual verification complete! Welcome back to Bell24h.');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('Invalid email OTP. Please try again.');
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
      if (step === 'otp') {
        // Resend mobile OTP
        const response = await fetch('/api/auth/send-mobile-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        });
        
        if (response.ok) {
          setError('');
          alert('Mobile OTP resent successfully!');
        }
      } else if (step === 'email') {
        // Resend email OTP
        await sendEmailOTP(userData.email);
        alert('Email OTP resent successfully!');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'phone': return 'Mobile Number';
      case 'otp': return 'Mobile OTP Verification';
      case 'email': return 'Email OTP Verification';
      case 'success': return 'Login Successful';
      default: return 'Authentication';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'phone': return <Phone className="h-5 w-5 text-indigo-600" />;
      case 'otp': return <MessageSquare className="h-5 w-5 text-emerald-600" />;
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
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
            🔐 Bell24h Smart Login
          </h1>
          <p className="text-gray-600">
            {step === 'phone' && 'Enter mobile number for cost-effective verification'}
            {step === 'otp' && 'Verify mobile OTP (Primary authentication)'}
            {step === 'email' && 'Verify email OTP (Secondary authentication)'}
            {step === 'success' && 'Authentication complete!'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {getStepIcon()}
              {getStepTitle()}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Success</span>
                </div>
                <p className="text-green-700 text-xs mt-1">{successMessage}</p>
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number (Primary - Cost Effective)
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
                    We'll send OTP to your mobile first (saves money)
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
                      Send Mobile OTP
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile OTP Code
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
                    Mobile OTP sent to +91 {phoneNumber.slice(-10)}
                    {isExistingUser && <span className="block text-blue-600">Existing user - Email OTP will follow</span>}
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
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Verify Mobile OTP
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

            {step === 'email' && (
              <form onSubmit={handleEmailOTPSubmit} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-blue-800 text-sm mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email Verification Required</span>
                  </div>
                  <p className="text-blue-700 text-xs">
                    As an existing user, we need to verify your email: <strong>{userData?.email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700 mb-1">
                    Email OTP Code
                  </label>
                  <Input
                    id="emailOtp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Email OTP sent to {userData?.email}
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying Email...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Verify Email OTP
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('otp')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to Mobile OTP
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Didn't receive email OTP? Resend
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Login Successful!</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {isExistingUser ? 'Dual verification complete' : 'Mobile verification complete'}
                  </p>
                </div>
                <div className="animate-pulse">
                  <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {step !== 'success' && (
              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            )}

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Smart Authentication</span>
              </div>
              <p className="text-green-700 text-xs mt-1">
                Mobile OTP first (saves money), Email OTP for existing users (dual security)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
=======
import { redirect } from 'next/navigation';

export default function LoginRedirect() {
  redirect('/auth/login-otp');
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
