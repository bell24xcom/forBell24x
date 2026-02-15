"use client"
import { CheckCircle, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOTP, setDemoOTP] = useState('');

  const sendOTP = async () => {
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      });

      if (response.ok) {
        setStep('otp');
        setDemoOTP('123456'); // Demo OTP for testing
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp })
      });

      if (response.ok) {
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    setError('');
    sendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Bell24h</h1>
          <p className="text-gray-600 mt-2">Enter your mobile number to continue</p>
        </div>

        {/* Demo OTP Display */}
        {demoOTP && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Use OTP: <code className="bg-yellow-100 px-2 py-1 rounded">{demoOTP}</code>
              </span>
            </div>
          </div>
        )}

        {step === 'phone' ? (
          /* Phone Input Step */
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 min-w-0 block w-full px-3 py-3 border border-gray-300 rounded-r-md focus:ring-blue-500 focus:border-blue-500"
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              onClick={sendOTP}
              disabled={loading || phone.length !== 10}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          /* OTP Verification Step */
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-sm text-gray-500 mt-2">
                OTP sent to +91{phone}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                onClick={resendOTP}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* Service Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            Secure & Verified
          </div>
        </div>

        {/* WhatsApp Contact */}
        <div className="mt-4 text-center">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Need help? Contact us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}