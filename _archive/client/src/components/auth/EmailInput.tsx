'use client';

import { ArrowRight, CheckCircle, Loader2, Mail, X } from 'lucide-react';
import { useState } from 'react';

interface EmailInputProps {
  phone: string;
  onEmailSubmit: (email: string, demoOTP?: string) => void;
  onSkip: () => void;
}

export default function EmailInput({ phone, onEmailSubmit, onSkip }: EmailInputProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone })
      });

      const data = await response.json();

      if (data.success) {
        onEmailSubmit(email, data.demoOTP);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send email OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center text-green-700">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Phone verified: +91 {phone}</span>
        </div>
      </div>

      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Add Business Email</h2>
        <p className="text-gray-600 mt-2">
          Email helps us send quotations, invoices, and important updates
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Email (Optional but Recommended)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@company.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <p className="text-xs text-gray-500 mt-2">
            Trust Score: 70% (phone only) → 100% (phone + email)
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !email}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Skip
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Why add email?
            </h3>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Receive quotations and invoices</li>
              <li>• Get order confirmations</li>
              <li>• Important business updates</li>
              <li>• Increase trust score to 100%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
