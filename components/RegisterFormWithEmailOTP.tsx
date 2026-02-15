"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Building, Mail, Phone, Lock, ArrowRight, ShieldCheck, Users, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const steps = [
  { id: 'role', title: 'Account Type', icon: <User /> },
  { id: 'basic', title: 'Basic Information', icon: <Mail /> },
  { id: 'business', title: 'Business Details', icon: <Building /> },
  { id: 'email-otp', title: 'Email Verification', icon: <ShieldCheck /> },
  { id: 'complete', title: 'Registration Complete', icon: <CheckCircle /> },
];

function RegisterFormContent({ onSwitchView, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formData, setFormData] = useState({
    role: 'SUPPLIER',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    companySize: '',
    gstNumber: '',
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill mobile number from URL params
  useEffect(() => {
    const mobile = searchParams.get('mobile');
    if (mobile) {
      setFormData(prev => ({ ...prev, phone: mobile }));
    }
  }, [searchParams]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 2) { // After business details, send email OTP
        sendEmailOTP();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      }
    }
  };
  
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const sendEmailOTP = async () => {
    if (!formData.email) {
      setError('Email address is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setCurrentStep(3); // Move to email OTP step
        startResendCooldown();
      } else {
        setError(data.error || 'Failed to send email OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (otpAttempts >= 3) {
      setError('Maximum OTP attempts exceeded. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          otp: emailOtp 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Complete registration
        await completeRegistration();
      } else {
        setOtpAttempts(prev => prev + 1);
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(4); // Move to completion step
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;
    setEmailOtp('');
    setError('');
    setOtpAttempts(0);
    sendEmailOTP();
  };

  const validateCurrentStep = () => {
    setError('');
    
    switch (currentStep) {
      case 0: // Role selection
        return formData.role !== '';
      case 1: // Basic info
        if (!formData.fullName.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Valid email address is required');
          return false;
        }
        if (!formData.phone.trim() || formData.phone.length !== 10) {
          setError('Valid 10-digit phone number is required');
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      case 2: // Business details
        if (!formData.companyName.trim()) {
          setError('Company name is required');
          return false;
        }
        if (!formData.industry.trim()) {
          setError('Industry is required');
          return false;
        }
        if (!formData.companySize.trim()) {
          setError('Company size is required');
          return false;
        }
        return true;
      case 3: // Email OTP
        return emailOtp.length === 6;
      default:
        return true;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 3) {
      verifyEmailOTP();
    } else {
      handleNext();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-2xl mx-auto bg-gray-900 rounded-2xl p-8 shadow-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Join Bell24h</h2>
        <p className="text-gray-400">Create your supplier account in minutes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= currentStep ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-amber-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === 0 && <StepRole formData={formData} setFormData={setFormData} />}
          {currentStep === 1 && <StepBasic formData={formData} handleChange={handleChange} />}
          {currentStep === 2 && <StepBusiness formData={formData} handleChange={handleChange} />}
          {currentStep === 3 && (
            <StepEmailOTP 
              email={formData.email}
              emailOtp={emailOtp}
              setEmailOtp={setEmailOtp}
              resendCooldown={resendCooldown}
              onResend={handleResendOTP}
            />
          )}
          {currentStep === 4 && <StepComplete />}
        </AnimatePresence>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          {currentStep > 0 && currentStep < 4 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              ← Previous
            </button>
          )}
          
          {currentStep < 4 && (
            <button
              type="submit" 
              className="ml-auto bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg flex items-center space-x-2 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></span>
              ) : (
                <>
                  {currentStep === 3 ? 'Verify Email' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
      
      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{' '}
        <button 
          onClick={onSwitchView} 
          className="font-semibold text-amber-400 hover:text-amber-500 transition-colors"
          disabled={isLoading}
        >
          Login
        </button>
      </p>
    </motion.div>
  );
};

const StepRole = ({ formData, setFormData }) => (
  <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
    <RoleCard icon={<User/>} title="Buyer" description="Procure goods & services" selected={formData.role === 'BUYER'} onClick={() => setFormData(p => ({...p, role: 'BUYER'}))} />
    <RoleCard icon={<Briefcase/>} title="Supplier" description="Sell your products & services" selected={formData.role === 'SUPPLIER'} onClick={() => setFormData(p => ({...p, role: 'SUPPLIER'}))} />
    <RoleCard icon={<ShieldCheck/>} title="Admin" description="Manage the marketplace" selected={formData.role === 'ADMIN'} onClick={() => setFormData(p => ({...p, role: 'ADMIN'}))} />
  </motion.div>
);

const RoleCard = ({ icon, title, description, selected, onClick }) => (
  <div onClick={onClick} className={`p-4 border-2 rounded-lg cursor-pointer flex items-center space-x-4 transition-all ${selected ? 'border-amber-500 bg-amber-500/10' : 'border-gray-600 hover:border-gray-400'}`}>
    <div className={`p-2 rounded-full ${selected ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-300'}`}>{icon}</div>
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </div>
);

const StepBasic = ({ formData, handleChange }) => (
  <motion.div key="basic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
    <InputField icon={<User/>} name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
    <InputField icon={<Mail/>} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
    <InputField icon={<Phone/>} name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
    <InputField icon={<Lock/>} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
    <InputField icon={<Lock/>} name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
  </motion.div>
);

const StepBusiness = ({ formData, handleChange }) => (
  <motion.div key="business" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
    <InputField icon={<Building/>} name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} />
    <InputField icon={<Briefcase/>} name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} />
    <InputField icon={<Users/>} name="companySize" placeholder="Company Size" value={formData.companySize} onChange={handleChange} />
    <InputField icon={<ShieldCheck/>} name="gstNumber" placeholder="GST Number (Optional)" value={formData.gstNumber} onChange={handleChange} />
  </motion.div>
);

const StepEmailOTP = ({ email, emailOtp, setEmailOtp, resendCooldown, onResend }) => (
  <motion.div key="email-otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
    <div className="space-y-4">
      <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-xl font-bold text-white">Verify Your Email</h3>
      <p className="text-gray-400">
        We've sent a 6-digit verification code to<br />
        <span className="text-amber-400 font-semibold">{email}</span>
      </p>
    </div>

    <div className="space-y-4">
      <input
        type="text"
        value={emailOtp}
        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Enter 6-digit code"
        className="w-full px-4 py-3 bg-gray-700/50 border-2 border-white/10 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
        maxLength={6}
      />
      
      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0}
          className="text-amber-400 text-sm disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0 
            ? `Resend code in ${resendCooldown}s` 
            : 'Resend verification code'
          }
        </button>
      </div>
    </div>
  </motion.div>
);

const StepComplete = () => (
  <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
      <CheckCircle className="w-10 h-10 text-green-400" />
    </div>
    <h3 className="text-2xl font-bold text-white">Registration Complete!</h3>
    <p className="text-gray-400">
      Your account has been created successfully.<br />
      Redirecting to dashboard...
    </p>
  </motion.div>
);

const InputField = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
    <input {...props} className="w-full bg-gray-700/50 border-2 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"/>
  </div>
);

const RegisterFormWithEmailOTP = ({ onSwitchView, onClose }) => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterFormContent onSwitchView={onSwitchView} onClose={onClose} />
    </Suspense>
  );
};

export default RegisterFormWithEmailOTP;