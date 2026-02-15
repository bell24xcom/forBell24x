'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

type AuthStep = 'phone' | 'otp' | 'kyc' | 'plan' | 'complete';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
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
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: ['5 RFQs per month', 'Basic search', 'Email support'],
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '₹7,999/month',
      features: ['Unlimited RFQs', 'Advanced search', 'Priority support', 'Analytics'],
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'API access'],
      color: 'green'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('phone');
      setPhone('');
      setOtp('');
      setError('');
      setUser(null);
    }
  }, [isOpen]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        
        // Check if user exists and has completed KYC
        if (data.user.isNewUser) {
          setCurrentStep('kyc');
        } else if (!data.user.kycCompleted) {
          setCurrentStep('kyc');
        } else if (!data.user.planSelected) {
          setCurrentStep('plan');
        } else {
          setCurrentStep('complete');
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          kycData 
        })
      });

      const data = await response.json();

      if (data.success) {
        setUser({ ...user, kycCompleted: true });
        setCurrentStep('plan');
      } else {
        setError(data.message || 'KYC submission failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
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
        setCurrentStep('complete');
      } else {
        setError(data.message || 'Plan selection failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onSuccess(user);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStep === 'phone' && 'Login to Bell24h'}
              {currentStep === 'otp' && 'Verify OTP'}
              {currentStep === 'kyc' && 'Company Registration'}
              {currentStep === 'plan' && 'Choose Your Plan'}
              {currentStep === 'complete' && 'Welcome to Bell24h!'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {['phone', 'otp', 'kyc', 'plan', 'complete'].map((step, index) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : ['phone', 'otp', 'kyc', 'plan', 'complete'].indexOf(currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Phone Number */}
          {currentStep === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP sent to {phone}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep('phone')}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {/* Step 3: KYC Registration */}
          {currentStep === 'kyc' && (
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={kycData.companyName}
                    onChange={(e) => setKycData({...kycData, companyName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={kycData.registrationNumber}
                    onChange={(e) => setKycData({...kycData, registrationNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={kycData.gstNumber}
                    onChange={(e) => setKycData({...kycData, gstNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Step 4: Plan Selection */}
          {currentStep === 'plan' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Choose the plan that best fits your business needs
              </p>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPlan === plan.id
                        ? `border-${plan.color}-500 bg-${plan.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-2xl font-bold text-gray-900">{plan.price}</p>
                      </div>
                      {selectedPlan === plan.id && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {selectedPlan && (
                <button
                  onClick={() => handlePlanSelect(selectedPlan)}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Select Plan'}
                </button>
              )}
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Welcome to Bell24h!</h3>
              <p className="text-gray-600">
                Your account has been set up successfully. You can now access all features of our B2B marketplace.
              </p>
              <button
                onClick={handleComplete}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}