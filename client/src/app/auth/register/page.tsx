'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, User, Mail, Building, MapPin, Users, CheckCircle, Shield, Star } from 'lucide-react';
import Link from 'next/link';

export default function RegistrationPage() {
  const [step, setStep] = useState<'basic' | 'mobile' | 'otp' | 'profile' | 'success'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Basic Info
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    companyType: '',
    location: ''
  });
  
  // Mobile Info
  const [mobileInfo, setMobileInfo] = useState({
    phoneNumber: '',
    otp: ''
  });
  
  // Profile Info
  const [profileInfo, setProfileInfo] = useState({
    businessCategory: '',
    employeeCount: '',
    annualTurnover: '',
    businessDescription: '',
    website: ''
  });
  
  const router = useRouter();

  // Step 1: Basic Information
  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate basic information
      if (!basicInfo.firstName || !basicInfo.lastName || !basicInfo.email) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Check if email already exists
      const emailCheck = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: basicInfo.email })
      });

      if (emailCheck.ok) {
        const data = await emailCheck.json();
        if (data.exists) {
          setError('Email already registered. Please use login instead.');
          setLoading(false);
          return;
        }
      }

      setStep('mobile');
      setSuccessMessage('Basic information saved! Now verify your mobile number.');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Mobile OTP
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send Mobile OTP for new user
      const response = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: mobileInfo.phoneNumber,
          email: basicInfo.email,
          registrationData: basicInfo
        })
      });

      if (response.ok) {
        setStep('otp');
        setSuccessMessage(`OTP sent to ${mobileInfo.phoneNumber}. Please verify your mobile number.`);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify Mobile OTP for registration
      const response = await fetch('/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: mobileInfo.phoneNumber,
          otp: mobileInfo.otp,
          email: basicInfo.email,
          registrationData: basicInfo
        })
      });

      if (response.ok) {
        setStep('profile');
        setSuccessMessage('Mobile verified! Complete your business profile.');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Complete Registration
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Complete registration
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basicInfo,
          mobileInfo,
          profileInfo
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('bell24h_user', JSON.stringify(data.user));
        setStep('success');
        setSuccessMessage('Registration complete! Welcome to Bell24h.');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'basic': return 'Basic Information';
      case 'mobile': return 'Mobile Verification';
      case 'otp': return 'OTP Verification';
      case 'profile': return 'Business Profile';
      case 'success': return 'Registration Complete';
      default: return 'Registration';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'basic': return <User className="h-5 w-5 text-indigo-600" />;
      case 'mobile': return <Phone className="h-5 w-5 text-emerald-600" />;
      case 'otp': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'profile': return <Building className="h-5 w-5 text-purple-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Join Bell24h
          </h1>
          <p className="text-gray-600">
            {step === 'basic' && 'Create your account in 4 simple steps'}
            {step === 'mobile' && 'Verify your mobile number'}
            {step === 'otp' && 'Enter the OTP sent to your mobile'}
            {step === 'profile' && 'Complete your business profile'}
            {step === 'success' && 'Welcome to Bell24h!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span className={step === 'basic' ? 'text-indigo-600 font-medium' : ''}>Basic Info</span>
            <span className={step === 'mobile' ? 'text-indigo-600 font-medium' : ''}>Mobile</span>
            <span className={step === 'otp' ? 'text-indigo-600 font-medium' : ''}>OTP</span>
            <span className={step === 'profile' ? 'text-indigo-600 font-medium' : ''}>Profile</span>
            <span className={step === 'success' ? 'text-indigo-600 font-medium' : ''}>Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(['basic', 'mobile', 'otp', 'profile', 'success'].indexOf(step) + 1) * 20}%` }}
            ></div>
          </div>
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

            {step === 'basic' && (
              <form onSubmit={handleBasicSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      value={basicInfo.firstName}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      value={basicInfo.lastName}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@company.com"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    value={basicInfo.companyName}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your Company Ltd"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Type
                  </label>
                  <select
                    value={basicInfo.companyType}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, companyType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Company Type</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="supplier">Supplier</option>
                    <option value="distributor">Distributor</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="trader">Trader</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <Input
                    type="text"
                    value={basicInfo.location}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Mumbai, Maharashtra"
                    required
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validating...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Continue to Mobile Verification
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === 'mobile' && (
              <form onSubmit={handleMobileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <Input
                    type="tel"
                    value={mobileInfo.phoneNumber}
                    onChange={(e) => setMobileInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send OTP to verify your mobile number
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || mobileInfo.phoneNumber.length < 10}
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600"
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

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('basic')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to Basic Info
                  </button>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code *
                  </label>
                  <Input
                    type="text"
                    value={mobileInfo.otp}
                    onChange={(e) => setMobileInfo(prev => ({ ...prev, otp: e.target.value }))}
                    placeholder="123456"
                    required
                    className="w-full text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    OTP sent to {mobileInfo.phoneNumber}
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || mobileInfo.otp.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify OTP
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to Mobile
                  </button>
                </div>
              </form>
            )}

            {step === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Category *
                  </label>
                  <select
                    value={profileInfo.businessCategory}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, businessCategory: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Business Category</option>
                    <option value="steel_metal">Steel & Metal</option>
                    <option value="textiles">Textiles & Fabrics</option>
                    <option value="electronics">Electronics & Electrical</option>
                    <option value="automotive">Automotive</option>
                    <option value="construction">Construction</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="food_beverage">Food & Beverage</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Count
                    </label>
                    <select
                      value={profileInfo.employeeCount}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, employeeCount: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Turnover
                    </label>
                    <select
                      value={profileInfo.annualTurnover}
                      onChange={(e) => setProfileInfo(prev => ({ ...prev, annualTurnover: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select</option>
                      <option value="0-1cr">₹0-1 Cr</option>
                      <option value="1-10cr">₹1-10 Cr</option>
                      <option value="10-50cr">₹10-50 Cr</option>
                      <option value="50cr+">₹50 Cr+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    value={profileInfo.businessDescription}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, businessDescription: e.target.value }))}
                    placeholder="Brief description of your business..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website (Optional)
                  </label>
                  <Input
                    type="url"
                    value={profileInfo.website}
                    onChange={(e) => setProfileInfo(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourcompany.com"
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !profileInfo.businessCategory}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing Registration...
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('otp')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to OTP
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
                  <h3 className="text-lg font-medium text-gray-900">Registration Complete!</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Welcome to Bell24h, {basicInfo.firstName}!
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 Your account is ready! Redirecting to dashboard...
                  </p>
                </div>
              </div>
            )}

            {step !== 'success' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
