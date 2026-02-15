'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Building2,
  Star,
  Crown
} from 'lucide-react';

interface LoginState {
  step: 'choice' | 'mobile' | 'email' | 'register' | 'claim';
  phoneNumber: string;
  email: string;
  otp: string;
  loading: boolean;
  error: string;
  success: boolean;
}

export default function EnterpriseLoginIntegration() {
  const [state, setState] = useState<LoginState>({
    step: 'choice',
    phoneNumber: '',
    email: '',
    otp: '',
    loading: false,
    error: '',
    success: false
  });
  
  const router = useRouter();

  // Handle login choice selection
  const handleLoginChoice = (choice: 'existing' | 'new' | 'claim') => {
    if (choice === 'existing') {
      setState(prev => ({ ...prev, step: 'mobile' }));
    } else if (choice === 'new') {
      router.push('/auth/landing');
    } else if (choice === 'claim') {
      router.push('/claim-company');
    }
  };

  // Handle mobile OTP login (Primary - Cost Effective)
  const handleMobileOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      // Send mobile OTP
      const response = await fetch('/api/auth/send-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: state.phoneNumber })
      });

      const data = await response.json();

      if (data.success) {
        // Check if user is existing (has email registered)
        if (data.data.isExistingUser) {
          // Existing user - show email OTP option
          setState(prev => ({ 
            ...prev, 
            step: 'email',
            success: true,
            loading: false 
          }));
        } else {
          // New user - redirect to registration
          router.push('/auth/landing');
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error,
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Network error. Please try again.',
        loading: false 
      }));
    }
  };

  // Handle email OTP for existing users
  const handleEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      // Send email OTP
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email })
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          success: true,
          loading: false 
        }));
        // Show OTP input or redirect to verification
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error,
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Network error. Please try again.',
        loading: false 
      }));
    }
  };

  // Render login choice selection
  const renderLoginChoice = () => (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Existing User - Mobile OTP */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleLoginChoice('existing')}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
            <Phone className="h-6 w-6 text-indigo-600" />
          </div>
          <CardTitle className="text-lg">Existing User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center mb-4">
            Quick mobile OTP login for registered users
          </p>
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="h-3 w-3 mr-1" />
            Cost-effective • Secure
          </div>
        </CardContent>
      </Card>

      {/* New User - Registration */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleLoginChoice('new')}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <Star className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-lg">New User</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center mb-4">
            Join Bell24h with 4-step registration
          </p>
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Crown className="h-3 w-3 mr-1" />
            FREE Forever Plan
          </div>
        </CardContent>
      </Card>

      {/* Company Claim */}
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleLoginChoice('claim')}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-lg">Claim Company</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 text-center mb-4">
            Claim your company profile (3 months FREE)
          </p>
          <div className="flex items-center justify-center text-xs text-gray-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Early User Benefits
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render mobile OTP login
  const renderMobileOTP = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5 text-indigo-600" />
          <span>Mobile OTP Login</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter your mobile number for cost-effective verification
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMobileOTP} className="space-y-4">
          <div>
            <Input
              type="tel"
              placeholder="Enter mobile number"
              value={state.phoneNumber}
              onChange={(e) => setState(prev => ({ ...prev, phoneNumber: e.target.value }))}
              required
            />
          </div>
          
          {state.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {state.error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={state.loading}
          >
            {state.loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'choice' }))}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to login options
          </button>
        </div>
      </CardContent>
    </Card>
  );

  // Render email OTP for existing users
  const renderEmailOTP = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-emerald-600" />
          <span>Email OTP Login</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter your registered email for secondary verification
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailOTP} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter registered email"
              value={state.email}
              onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          {state.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {state.error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={state.loading}
          >
            {state.loading ? 'Sending Email OTP...' : 'Send Email OTP'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setState(prev => ({ ...prev, step: 'mobile' }))}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to mobile login
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔐 Bell24h Smart Authentication
        </h2>
        <p className="text-gray-600">
          Choose your login method based on your user type
        </p>
      </div>

      {state.step === 'choice' && renderLoginChoice()}
      {state.step === 'mobile' && renderMobileOTP()}
      {state.step === 'email' && renderEmailOTP()}

      {state.success && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-green-800">
              OTP sent successfully! Check your {state.step === 'mobile' ? 'mobile' : 'email'}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
