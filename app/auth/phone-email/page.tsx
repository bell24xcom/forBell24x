"use client"
import { CheckCircle, Phone, Shield } from 'lucide-react';
import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    initSendOTP: (config: object) => void;
    sendOtp: (identifier: string, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void;
    verifyOtp: (otp: number, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void;
  }
}

const WIDGET_ID  = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;

export default function PhoneEmailAuth() {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOTP, setDemoOTP] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);
  const router = useRouter();

  // Normalize phone: strip +91, spaces, dashes
  const normalizePhone = (raw: string): string => {
    return raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');

    const normalized = normalizePhone(phone);
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    // Widget mode: MSG91 sends real SMS without DLT
    if (widgetReady && window.sendOtp) {
      window.sendOtp(
        `91${normalized}`,
        () => { setStep('otp'); setLoading(false); },
        (err) => {
          console.error('MSG91 sendOtp failed:', err);
          setError('Failed to send OTP. Please try again.');
          setLoading(false);
        }
      );
      return;
    }

    // Pilot / fallback mode
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }

      if (data.devOtp) setDemoOTP(data.devOtp);
      setStep('otp');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');

    const normalized = normalizePhone(phone);

    // Widget mode: verify via MSG91 widget → get access-token → backend login
    if (widgetReady && window.verifyOtp) {
      window.verifyOtp(
        parseInt(otp, 10),
        async (data: unknown) => {
          const result = data as Record<string, string>;
          const accessToken = result['access-token'];

          if (!accessToken) {
            setError('Verification failed. Please try again.');
            setLoading(false);
            return;
          }

          try {
            const response = await fetch('/api/auth/otp/widget-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accessToken, phone: normalized }),
            });

            const loginData = await response.json();

            if (!response.ok || !loginData.success) {
              setError(loginData.message || 'Login failed. Please try again.');
              setLoading(false);
              return;
            }

            localStorage.setItem('bell24h_user', JSON.stringify(loginData.user));
            router.push('/dashboard');
          } catch {
            setError('Network error. Please check your connection.');
            setLoading(false);
          }
        },
        (err) => {
          console.error('MSG91 verifyOtp failed:', err);
          setError('Invalid OTP. Please check and try again.');
          setLoading(false);
        }
      );
      return;
    }

    // Pilot / fallback mode
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid OTP. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('bell24h_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    setOtp('');
    setDemoOTP('');
    sendOTP();
  };

  return (
    <>
      {/* MSG91 OTP Widget — headless mode */}
      {WIDGET_ID && TOKEN_AUTH && (
        <Script
          src="https://verify.msg91.com/otp-provider.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window.initSendOTP === 'function') {
              window.initSendOTP({
                widgetId: WIDGET_ID,
                tokenAuth: TOKEN_AUTH,
                exposeMethods: true,
                success: () => {},
                failure: () => {},
              });
              setWidgetReady(true);
            }
          }}
        />
      )}

      <div className="page-container">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            {/* Header */}
            <div className="page-header">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Bell24h Login</h1>
              <p className="text-neutral-600 mt-2">
                {step === 'phone' ? 'Enter your mobile number to continue' : 'Enter the OTP sent to your phone'}
              </p>
            </div>

            {/* Demo OTP Display (only in pilot/dev fallback mode) */}
            {demoOTP && step === 'otp' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-yellow-800">Your OTP</h3>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">{demoOTP}</p>
                  <p className="text-xs text-yellow-700 mt-1">Enter this code below</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Phone Input Step */}
            {step === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="flex-1 rounded-r-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                  <label className="form-label">
                    Enter OTP sent to +91 {phone}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-2xl tracking-widest border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                    autoFocus
                  />
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
                    onClick={() => { setStep('phone'); setOtp(''); setDemoOTP(''); setError(''); }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change Number
                  </button>
                  <button
                    onClick={resendOTP}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Service Information */}
            <div className="mt-8 bg-neutral-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">Our Services</h3>
              <div className="space-y-1 text-sm text-neutral-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Supplier Verification - &#8377;2,000</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>RFQ Writing Service - &#8377;500</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span>Featured Listing - &#8377;1,000/month</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 mb-3">Need help? Contact us on WhatsApp</p>
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
    </>
  );
}
