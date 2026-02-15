'use client';

import React, { useState } from 'react';
import { Phone, Mail, ArrowLeft, CheckCircle, X, Building2, CreditCard, User } from 'lucide-react';

type AuthStep = 'phone' | 'phoneOtp' | 'email' | 'emailOtp' | 'kyc' | 'plan' | 'success';

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function EnhancedAuthModal({ isOpen, onClose, onSuccess }: EnhancedAuthModalProps) {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [demoOTP, setDemoOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycData, setKycData] = useState({
    companyName: '',
    businessType: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    contactPerson: '',
    designation: '',
    website: '',
    gstNumber: '',
    panNumber: ''
  });
  const [selectedPlan, setSelectedPlan] = useState('professional'); // Default to Professional (free trial)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      originalPrice: 'Free',
      features: ['5 RFQs per month', 'Basic search', 'Email support', '2.5% transaction fee'],
      color: 'gray',
      isDefault: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'Free for 3 months',
      originalPrice: '₹2,999/month',
      features: ['Unlimited RFQs', 'Advanced AI matching', 'Priority support', 'Analytics', 'Voice/Video RFQ', '2% transaction fee', '1% escrow fee'],
      color: 'blue',
      isDefault: true,
      trialPeriod: '3 months',
      trialEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₹9,999/month',
      originalPrice: '₹9,999/month',
      features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'API access', 'White-label options', '1.5% transaction fee', '0.5% escrow fee'],
      color: 'purple',
      isDefault: false
    }
  ];

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
        
        // Check if user is new or needs KYC
        if (data.user.isNewUser || !data.user.kycCompleted) {
          setStep('kyc');
        } else if (!data.user.planSelected) {
          setStep('plan');
        } else {
          setStep('success');
        }
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
        
        // Check if user needs KYC or plan selection
        if (!data.user.kycCompleted) {
          setStep('kyc');
        } else if (!data.user.planSelected) {
          setStep('plan');
        } else {
          setStep('success');
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          phone: phone,
          kycData 
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser({ ...user, kycCompleted: true });
        setStep('plan');
      } else {
        setError(data.message || 'KYC submission failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/select-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          planId 
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser({ ...user, planSelected: true, plan: planId });
        setStep('success');
      } else {
        setError(data.message || 'Plan selection failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipEmail = () => {
    if (!user.kycCompleted) {
      setStep('kyc');
    } else if (!user.planSelected) {
      setStep('plan');
    } else {
      setStep('success');
    }
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

  const handleBackToKyc = () => {
    setStep('kyc');
  };

  const handleComplete = () => {
    onSuccess?.(user);
    onClose();
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
            <div className="flex items-center space-x-1">
              {['phone', 'phoneOtp', 'email', 'emailOtp', 'kyc', 'plan', 'success'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === stepName || ['phone', 'phoneOtp', 'email', 'emailOtp', 'kyc', 'plan', 'success'].indexOf(step) > index
                      ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 6 && (
                    <div className={`w-8 h-1 ${
                      ['phone', 'phoneOtp', 'email', 'emailOtp', 'kyc', 'plan', 'success'].indexOf(step) > index 
                        ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'phone' && 'Enter Your Phone Number'}
              {step === 'phoneOtp' && 'Verify Your Phone'}
              {step === 'email' && 'Add Your Email (Optional)'}
              {step === 'emailOtp' && 'Verify Your Email'}
              {step === 'kyc' && 'Company Registration'}
              {step === 'plan' && 'Choose Your Plan'}
              {step === 'success' && 'Welcome to Bell24h!'}
            </h3>
            <p className="text-gray-600">
              {step === 'phone' && 'We\'ll send you a verification code to get started'}
              {step === 'phoneOtp' && 'Enter the 6-digit code sent to your phone'}
              {step === 'email' && 'Add your email for better security and notifications'}
              {step === 'emailOtp' && 'Enter the 6-digit code sent to your email'}
              {step === 'kyc' && 'Complete your company profile for verification'}
              {step === 'plan' && 'Select the plan that best fits your business needs'}
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

          {step === 'kyc' && (
            <KYCForm
              kycData={kycData}
              setKycData={setKycData}
              onSubmit={handleKycSubmit}
              onBack={handleBackToEmail}
              loading={loading}
            />
          )}

          {step === 'plan' && (
            <PlanSelection
              plans={plans}
              selectedPlan={selectedPlan}
              onPlanSelect={handlePlanSelect}
              onBack={handleBackToKyc}
              loading={loading}
            />
          )}

          {step === 'success' && (
            <SuccessPage user={user} onComplete={handleComplete} />
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

// KYC Form Component
function KYCForm({ kycData, setKycData, onSubmit, onBack, loading }: {
  kycData: any;
  setKycData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={kycData.companyName}
            onChange={(e) => setKycData({...kycData, companyName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            value={kycData.businessType}
            onChange={(e) => setKycData({...kycData, businessType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Business Type</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="supplier">Supplier</option>
            <option value="distributor">Distributor</option>
            <option value="retailer">Retailer</option>
            <option value="service">Service Provider</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address *
        </label>
        <textarea
          value={kycData.address}
          onChange={(e) => setKycData({...kycData, address: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            value={kycData.city}
            onChange={(e) => setKycData({...kycData, city: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            value={kycData.state}
            onChange={(e) => setKycData({...kycData, state: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <input
            type="text"
            value={kycData.country}
            onChange={(e) => setKycData({...kycData, country: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
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
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Complete Registration'}
        </button>
      </div>
    </form>
  );
}

// Plan Selection Component
function PlanSelection({ plans, selectedPlan, onPlanSelect, onBack, loading }: {
  plans: any[];
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Trial Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-4 text-center">
        <h3 className="text-lg font-bold mb-1">🎉 Special Launch Offer!</h3>
        <p className="text-sm">Get Professional plan FREE for 3 months</p>
        <p className="text-xs opacity-90">Perfect for testing our B2B marketplace features</p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors relative ${
              selectedPlan === plan.id
                ? `border-${plan.color}-500 bg-${plan.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.isDefault ? 'ring-2 ring-purple-200' : ''}`}
            onClick={() => onPlanSelect(plan.id)}
          >
            {/* Recommended Badge */}
            {plan.isDefault && (
              <div className="absolute -top-2 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {plan.isDefault && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      FREE TRIAL
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-xl font-bold text-gray-900">{plan.price}</p>
                  {plan.originalPrice !== plan.price && (
                    <p className="text-sm text-gray-500 line-through">{plan.originalPrice}</p>
                  )}
                </div>
                {plan.trialPeriod && (
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    Trial ends: {new Date(plan.trialEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {selectedPlan === plan.id && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <ul className="mt-3 space-y-1">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Trial Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What happens after 3 months?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You can continue with Professional plan at ₹2,999/month</li>
          <li>• Or downgrade to Basic plan (free)</li>
          <li>• Or upgrade to Enterprise for custom pricing</li>
          <li>• No automatic charges - you choose what's best</li>
        </ul>
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
          onClick={() => selectedPlan && onPlanSelect(selectedPlan)}
          disabled={loading || !selectedPlan}
          className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Start ${plans.find(p => p.id === selectedPlan)?.trialPeriod ? 'Free Trial' : 'Plan'}`}
        </button>
      </div>
    </div>
  );
}

// Success Page Component
function SuccessPage({ user, onComplete }: { user: any; onComplete: () => void }) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900">Welcome to Bell24h!</h3>
        <p className="text-sm text-gray-600 mt-1">
          Your account has been set up successfully
        </p>
      </div>

      {user && (
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Phone:</span> +91 {user.phone}</p>
            {user.email && <p><span className="font-medium">Email:</span> {user.email}</p>}
            {user.kycCompleted && <p><span className="font-medium">Company:</span> {user.companyName}</p>}
            {user.plan && <p><span className="font-medium">Plan:</span> {user.plan}</p>}
            <p><span className="font-medium">Trust Score:</span> {user.trustScore || 100}/100</p>
          </div>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
