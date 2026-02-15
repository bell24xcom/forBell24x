"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Building, Mail, Phone, Lock, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 'role', title: 'Account Type', icon: <User /> },
  { id: 'basic', title: 'Basic Information', icon: <Mail /> },
  { id: 'business', title: 'Business Details', icon: <Building /> },
  { id: 'verify', title: 'Verification', icon: <ShieldCheck /> },
];

const RegisterForm = ({ onSwitchView, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: 'BUYER',
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

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  const validateCurrentStep = () => {
    setError('');
    
    switch (currentStep) {
      case 0: // Role selection
        if (!formData.role) {
          setError('Please select an account type');
          return false;
        }
        break;
      case 1: // Basic info
        if (!formData.fullName.trim()) {
          setError('Full name is required');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.phone.trim()) {
          setError('Phone number is required');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
      case 2: // Business info
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
        break;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      onClose();
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Create an Account</h2>
      <p className="text-center text-gray-400 mb-8">Join the world's leading B2B Marketplace.</p>

      {/* Stepper */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= index ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-500 text-gray-500'}`}>
              {currentStep > index ? <ShieldCheck size={16}/> : step.icon}
            </div>
            {index < steps.length - 1 && <div className={`flex-auto border-t-2 mx-2 ${currentStep > index ? 'border-amber-500' : 'border-gray-600'}`}></div>}
          </div>
        ))}
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-400 text-sm text-center">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {currentStep === 0 && <StepRole key="role" formData={formData} setFormData={setFormData} />}
          {currentStep === 1 && <StepBasic key="basic" formData={formData} handleChange={handleChange} />}
          {currentStep === 2 && <StepBusiness key="business" formData={formData} handleChange={handleChange} />}
          {currentStep === 3 && <StepVerify key="verify" formData={formData} />}
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          {currentStep > 0 ? (
            <button 
              type="button" 
              onClick={handlePrev} 
              className="bg-gray-700/50 border-2 border-white/10 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              Back
            </button>
          ) : <div></div>}
          
          {currentStep < steps.length - 1 ? (
            <button 
              type="button" 
              onClick={handleNext} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              Next <ArrowRight/>
            </button>
          ) : (
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></span>
              ) : (
                'Complete Registration'
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
    <InputField icon={<Users/>} name="companySize" placeholder="Company Size (e.g., SME)" value={formData.companySize} onChange={handleChange} />
    <InputField icon={<ShieldCheck/>} name="gstNumber" placeholder="GST Number (Optional)" value={formData.gstNumber} onChange={handleChange} />
  </motion.div>
);

const StepVerify = ({ formData }) => (
    <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
        <div className="p-4 bg-gray-800 rounded-lg text-left">
            <h4 className="font-semibold text-white mb-2">Registration Summary</h4>
            <div className="space-y-2 text-sm text-gray-300">
                <p><span className="text-gray-400">Name:</span> {formData.fullName}</p>
                <p><span className="text-gray-400">Email:</span> {formData.email}</p>
                <p><span className="text-gray-400">Role:</span> {formData.role}</p>
                <p><span className="text-gray-400">Company:</span> {formData.companyName}</p>
            </div>
        </div>
        <p className="text-gray-300">Click "Complete Registration" to create your account.</p>
    </motion.div>
);

const InputField = ({ icon, ...props }) => (
    <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
        <input {...props} className="w-full bg-gray-700/50 border-2 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"/>
    </div>
);

export default RegisterForm; 