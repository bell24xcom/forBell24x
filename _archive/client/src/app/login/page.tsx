'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOTP, setDemoOTP] = useState<string | null>(null);

  const sendOTP = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      const body = await res.json();
      setDemoOTP(body.demoOTP || '123456');
      setStep('otp');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      if (!res.ok) throw new Error('Invalid OTP. Please try again.');
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Bell24h</h1>
          <p className='text-sm text-gray-600 mt-2'>India's First AI B2B Marketplace</p>
        </div>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Mobile OTP Login</h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10'>
          {step === 'phone' ? (
            <div className='space-y-6'>
              <label className='block text-sm font-medium text-gray-700'>Mobile Number</label>
              <input
                type='tel'
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder='Enter 10-digit mobile number'
                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                maxLength={10}
              />
              {error && <div className='text-red-600 text-sm'>{error}</div>}
              <button
                onClick={sendOTP}
                disabled={loading || phone.length !== 10}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              {demoOTP && (
                <p className='text-xs text-gray-500'>Demo mode OTP: {demoOTP}</p>
              )}
            </div>
          ) : (
            <div className='space-y-6'>
              <label className='block text-sm font-medium text-gray-700'>Enter OTP</label>
              <input
                type='text'
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder='Enter 6-digit OTP'
                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center'
                maxLength={6}
              />
              {error && <div className='text-red-600 text-sm'>{error}</div>}
              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                className='w-full text-sm text-blue-600 hover:text-blue-500'
              >
                Change number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
