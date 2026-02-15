'use client';

import React, { useState } from 'react';
import { Phone, Mail, ArrowLeft, CheckCircle, X } from 'lucide-react';

type AuthStep = 'phone' | 'phoneOtp' | 'email' | 'emailOtp' | 'success';

interface PhoneOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function PhoneOTPModal({ isOpen, onClose, onSuccess }: PhoneOTPModalProps) {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [demoOTP, setDemoOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (phoneNumber: string, demoOTP?: string) => {
    setPhone(phoneNumber);
    setDemoOTP(demoOTP || '');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('phoneOtp');
        console.log('Demo OTP:', data.demoOTP);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPVerified = async (otp: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setStep('email');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (emailAddress: string, demoOTP?: string) => {
    setEmail(emailAddress);
    setDemoOTP(demoOTP || '');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, phone })
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('emailOtp');
        console.log('Demo OTP:', data.demoOTP);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = async (otp: string) => {
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
        setUser(data.user);
        setStep('success');
        setTimeout(() => {
          onSuccess?.(data.user);
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipEmail = () => {
    setStep('success');
    setTimeout(() => {
      onSuccess?.(user);
      onClose();
    }, 2000);
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setPhone('');
    setUser(null);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🔔</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Join Bell24h</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'phone' || step === 'phoneOtp' || step === 'email' || step === 'emailOtp' || step === 'success'
                  ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step === 'phoneOtp' || step === 'email' || step === 'emailOtp' || step === 'success' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'email' || step === 'emailOtp' || step === 'success'
                  ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step === 'success' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'phone' && 'Enter Your Phone Number'}
              {step === 'phoneOtp' && 'Verify Your Phone'}
              {step === 'email' && 'Add Your Email (Optional)'}
              {step === 'emailOtp' && 'Verify Your Email'}
              {step === 'success' && 'Welcome to Bell24h!'}
            </h3>
            <p className="text-gray-600">
              {step === 'phone' && 'We\'ll send you a verification code to get started'}
              {step === 'phoneOtp' && 'Enter the 6-digit code sent to your phone'}
              {step === 'email' && 'Add your email for better security and notifications'}
              {step === 'emailOtp' && 'Enter the 6-digit code sent to your email'}
              {step === 'success' && 'Your account is ready! Start exploring Bell24h'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <PhoneInput onPhoneSubmit={handlePhoneSubmit} loading={loading} />
          )}

          {step === 'phoneOtp' && (
            <OTPVerification
              phone={phone}
              onVerified={handlePhoneOTPVerified}
              onBack={handleBackToPhone}
              loading={loading}
              demoOTP={demoOTP}
            />
          )}

          {step === 'email' && (
            <EmailInput
              phone={phone}
              onEmailSubmit={handleEmailSubmit}
              onSkip={handleSkipEmail}
              loading={loading}
            />
          )}

          {step === 'emailOtp' && (
            <EmailOTPVerification
              email={email}
              onVerified={handleEmailVerified}
              onBack={handleBackToEmail}
              loading={loading}
              demoOTP={demoOTP}
            />
          )}

          {step === 'success' && (
            <SuccessPage user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

// Phone Input Component
function PhoneInput({ onPhoneSubmit, loading }: { onPhoneSubmit: (phone: string, demoOTP?: string) => void; loading: boolean }) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      onPhoneSubmit(phone, '123456'); // Demo OTP
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="9876543210"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || phone.length < 10}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>
    </form>
  );
}

// OTP Verification Component
function OTPVerification({ phone, onVerified, onBack, loading, demoOTP }: { 
  phone: string; 
  onVerified: (otp: string) => void; 
  onBack: () => void; 
  loading: boolean;
  demoOTP: string;
}) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerified(otp);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Code sent to <span className="font-medium">+91 {phone}</span>
        </p>
        {demoOTP && (
          <p className="text-xs text-blue-600 mt-1 font-mono">
            Demo OTP: <span className="font-bold">{demoOTP}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
            placeholder="123456"
            maxLength={6}
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Email Input Component
function EmailInput({ phone, onEmailSubmit, onSkip, loading }: { 
  phone: string; 
  onEmailSubmit: (email: string, demoOTP?: string) => void; 
  onSkip: () => void; 
  loading: boolean;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      onEmailSubmit(email, '654321'); // Demo OTP
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Phone verified: <span className="font-medium">+91 {phone}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Adding email improves your trust score
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={loading || !email.includes('@')}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Email OTP Verification Component
function EmailOTPVerification({ email, onVerified, onBack, loading, demoOTP }: { 
  email: string; 
  onVerified: (otp: string) => void; 
  onBack: () => void; 
  loading: boolean;
  demoOTP: string;
}) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerified(otp);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Code sent to <span className="font-medium">{email}</span>
        </p>
        {demoOTP && (
          <p className="text-xs text-blue-600 mt-1 font-mono">
            Demo OTP: <span className="font-bold">{demoOTP}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
            placeholder="654321"
            maxLength={6}
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Success Page Component
function SuccessPage({ user }: { user: any }) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900">Welcome to Bell24h!</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your account has been created successfully
        </p>
      </div>

      {user && (
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Phone:</span> +91 {user.phone}</p>
            {user.email && <p><span className="font-medium">Email:</span> {user.email}</p>}
            <p><span className="font-medium">Trust Score:</span> {user.trustScore}/100</p>
            <p><span className="font-medium">Role:</span> {user.role}</p>
          </div>
        </div>
      )}

      <div className="pt-4">
        <p className="text-sm text-gray-500">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
