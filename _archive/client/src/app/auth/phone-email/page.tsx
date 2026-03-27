'use client';

import EmailInput from '@/components/auth/EmailInput';
import EmailOTPVerification from '@/components/auth/EmailOTPVerification';
import OTPVerification from '@/components/auth/OTPVerification';
import PhoneInput from '@/components/auth/PhoneInput';
import { CheckCircle, Shield } from 'lucide-react';
import { useState } from 'react';

type AuthStep = 'phone' | 'phoneOtp' | 'email' | 'emailOtp' | 'success';

export default function PhoneEmailAuth() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [demoOTP, setDemoOTP] = useState('');

  const handlePhoneSubmit = (phoneNumber: string, demoOTP?: string) => {
    setPhone(phoneNumber);
    setDemoOTP(demoOTP || '');
    setStep('phoneOtp');
  };

  const handlePhoneOTPVerified = (userData: any) => {
    setUser(userData);
    setStep('email');
  };

  const handleEmailSubmit = (emailAddress: string, demoOTP?: string) => {
    setEmail(emailAddress);
    setDemoOTP(demoOTP || '');
    setStep('emailOtp');
  };

  const handleEmailVerified = (userData: any) => {
    setUser(userData);
    setStep('success');
  };

  const handleSkipEmail = () => {
    setStep('success');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${step === 'phoneOtp' || step === 'email' || step === 'emailOtp' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 'phoneOtp' || step === 'email' || step === 'emailOtp' || step === 'success' ? 'bg-green-100 border-green-600' : 'border-gray-300'}`}>
              {step === 'phoneOtp' || step === 'email' || step === 'emailOtp' || step === 'success' ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Phone</span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-300 mx-4" />

          <div className={`flex items-center ${step === 'emailOtp' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 'emailOtp' || step === 'success' ? 'bg-green-100 border-green-600' : 'border-gray-300'}`}>
              {step === 'emailOtp' || step === 'success' ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="ml-2 text-sm font-medium">Email</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bell24h Registration</h1>
          <p className="text-gray-600 mt-2">
            {step === 'phone' && 'Verify your mobile number'}
            {step === 'phoneOtp' && 'Enter phone OTP'}
            {step === 'email' && 'Add your business email'}
            {step === 'emailOtp' && 'Enter email OTP'}
            {step === 'success' && 'Account created successfully!'}
          </p>
        </div>

        {/* Demo OTP Display */}
        {demoOTP && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-yellow-800">Demo OTP</h3>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{demoOTP}</p>
              <p className="text-xs text-yellow-700 mt-1">Use this code for testing</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        {step === 'phone' && (
          <PhoneInput onPhoneSubmit={handlePhoneSubmit} />
        )}

        {step === 'phoneOtp' && (
          <OTPVerification
            phone={phone}
            onOTPVerified={handlePhoneOTPVerified}
            onBack={handleBackToPhone}
          />
        )}

        {step === 'email' && (
          <EmailInput
            phone={phone}
            onEmailSubmit={handleEmailSubmit}
            onSkip={handleSkipEmail}
          />
        )}

        {step === 'emailOtp' && (
          <EmailOTPVerification
            email={email}
            phone={phone}
            onEmailVerified={handleEmailVerified}
            onBack={handleBackToEmail}
          />
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Welcome to Bell24h!
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span>Phone: +91 {phone}</span>
              </div>
              {user?.emailVerified && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Email: {email}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span>Trust Score: {user?.trustScore || 0}%</span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>

            {!user?.emailVerified && (
              <p className="text-sm text-gray-600">
                Add email later from settings to increase trust score
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
