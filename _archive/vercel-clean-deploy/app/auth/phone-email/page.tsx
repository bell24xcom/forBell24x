"use client"
import { CheckCircle, Phone, Shield } from 'lucide-react';
import { useState } from 'react';

export default function PhoneEmailAuth() {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOTP, setDemoOTP] = useState('');

  const sendOTP = async () => {
    setLoading(true);
    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      // Generate demo OTP for testing
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOTP(generatedOTP);

      console.log(`📱 OTP for +91${phone}: ${generatedOTP}`);
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }

    setLoading(false);
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');

    if (otp !== demoOTP) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    // Success - redirect to dashboard
    window.location.href = '/dashboard';
  };

  const resendOTP = () => {
    sendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bell24h Login</h1>
            <p className="text-gray-600 mt-2">
              {step === 'phone' ? 'Enter your mobile number to continue' : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {/* Demo OTP Display */}
          {demoOTP && step === 'otp' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-yellow-800">Demo OTP</h3>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{demoOTP}</p>
                <p className="text-xs text-yellow-700 mt-1">Use this code for testing</p>
              </div>
            </div>
          )}

          {/* Phone Input Step */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="flex-1 rounded-r-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <button
                onClick={sendOTP}
                disabled={loading || phone.length !== 10}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP sent to +91 {phone}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="6"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <button
                onClick={verifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('phone')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change Number
                </button>
                <button
                  onClick={resendOTP}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* Service Information */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Our Services</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Supplier Verification - ₹2,000</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>RFQ Writing Service - ₹500</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Featured Listing - ₹1,000/month</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">Need help? Contact us on WhatsApp</p>
            <a
              href="https://wa.me/919876543210?text=Hi, I need supplier verification service"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
  );
}