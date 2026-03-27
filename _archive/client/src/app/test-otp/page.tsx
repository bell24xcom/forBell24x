'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slot } from '@radix-ui/react-slot';
import { CheckCircle, Phone, Shield } from 'lucide-react';

export default function TestOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock OTP sending - replace with real MSG91 API
      console.log('Sending OTP to:', phoneNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For testing, show demo OTP
      setStep('otp');
      alert(`Demo OTP: 123456\nIn production, this would be sent to ${phoneNumber}`);
      
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock OTP verification
      if (otp === '123456') {
        setStep('success');
      } else {
        setError('Invalid OTP. Try 123456 for demo.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">OTP Test Page</CardTitle>
          <p className="text-gray-600">Emergency testing for MSG91 integration</p>
        </CardHeader>
        
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
              
              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> OTP will be 123456
                </p>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  OTP sent to {phoneNumber}
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Change Number
              </Button>
              
              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  OTP Verified Successfully!
                </h3>
                <p className="text-gray-600">
                  Phone number {phoneNumber} is verified.
                </p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Ready for MSG91 integration
                </p>
              </div>
              
              <Button 
                onClick={() => {
                  setStep('phone');
                  setPhoneNumber('');
                  setOtp('');
                  setError('');
                }}
                className="w-full"
              >
                Test Another Number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
