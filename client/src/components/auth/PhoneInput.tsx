'use client';

import { ArrowRight, Loader2, Phone } from 'lucide-react';
import { useState } from 'react';

interface PhoneInputProps {
  onPhoneSubmit: (phone: string, demoOTP?: string) => void;
}

export default function PhoneInput({ onPhoneSubmit }: PhoneInputProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate Indian phone number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Invalid mobile number');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (data.success) {
        onPhoneSubmit(phone, data.demoOTP);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Phone</h2>
        <p className="text-gray-600 mt-2">
          Enter your mobile number to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number (Required)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +91
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="flex-1 rounded-r-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || phone.length !== 10}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send OTP
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Why phone verification?
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Quick 30-second login like IndiaMART. No passwords to remember!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
