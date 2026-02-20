'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

// MSG91 widget method types (provided by otp-provider.js at runtime)
declare global {
  interface Window {
    initSendOTP: (config: object) => void;
    sendOtp: (identifier: string, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void;
    verifyOtp: (otp: number, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void;
    retryOtp: (channel: string | null, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void;
  }
}

const WIDGET_ID  = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH;

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOTP, setDemoOTP] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);
  const [sentViaWidget, setSentViaWidget] = useState(false);
  const router = useRouter();

  // Normalize phone: strip +91, spaces, dashes
  const normalizePhone = (raw: string): string => {
    return raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '');
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setIsLoading(true);
    setError('');

    const normalized = normalizePhone(phone);
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      setIsLoading(false);
      return;
    }

    // Widget mode: delegate to MSG91 widget (sends real SMS, no DLT needed)
    if (widgetReady && window.sendOtp) {
      setSentViaWidget(true);
      window.sendOtp(
        `91${normalized}`,
        () => {
          setIsOtpSent(true);
          setIsLoading(false);
        },
        (err) => {
          console.error('MSG91 sendOtp failed:', err);
          setError('Failed to send OTP. Please try again.');
          setIsLoading(false);
        }
      );
      return;
    }

    // Pilot / fallback mode: call our backend (OTP shown on screen)
    setSentViaWidget(false);
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.devOtp) setDemoOTP(data.devOtp);
      setIsOtpSent(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const normalized = normalizePhone(phone);

    // Widget mode: verify OTP via MSG91 widget → get access-token → call backend
    if (sentViaWidget && window.verifyOtp) {
      window.verifyOtp(
        parseInt(otp, 10),
        async (data: unknown) => {
          const result = data as Record<string, string>;
          const accessToken = result['access-token'];

          if (!accessToken) {
            setError('Verification failed. Please try again.');
            setIsLoading(false);
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
              setIsLoading(false);
              return;
            }

            localStorage.setItem('bell24h_user', JSON.stringify(loginData.user));
            router.push('/dashboard');
          } catch {
            setError('Network error. Please check your connection and try again.');
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('MSG91 verifyOtp failed:', err);
          setError('Invalid OTP. Please check and try again.');
          setIsLoading(false);
        }
      );
      return;
    }

    // Pilot / fallback mode: verify OTP with our backend
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('bell24h_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetOtpFlow = () => {
    setIsOtpSent(false);
    setOtp('');
    setDemoOTP('');
    setError('');
  };

  return (
    <>
      {/* MSG91 OTP Widget — headless mode (sends real SMS without DLT registration) */}
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
                success: () => {}, // handled inside verifyOtp callback
                failure: () => {}, // handled inside verifyOtp callback
              });
              setWidgetReady(true);
            }
          }}
        />
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .login-container {
          min-height: 100vh;
          background: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-card {
          max-width: 400px;
          width: 100%;
          background: #1e293b;
          padding: 40px;
          border-radius: 12px;
          border: 1px solid rgba(100, 116, 139, 0.3);
          box-shadow: 0 4px 32px rgba(0,0,0,0.4);
        }

        .brand-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand-name {
          font-size: 32px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .welcome-title {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 16px;
          color: #94a3b8;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(100, 116, 139, 0.5);
          border-radius: 6px;
          font-size: 16px;
          color: #ffffff;
          background: rgba(30, 41, 59, 0.6);
          transition: border-color 0.3s;
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          background: #475569;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: #e2e8f0;
          border: 1px solid rgba(100, 116, 139, 0.5);
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(100, 116, 139, 0.15);
          border-color: #64748b;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.4);
          color: #fca5a5;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .demo-otp {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: #fcd34d;
          padding: 16px;
          border-radius: 6px;
          text-align: center;
          margin-bottom: 20px;
        }

        .demo-otp-title {
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .demo-otp-code {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 4px;
        }

        .demo-otp-subtitle {
          font-size: 11px;
          margin-top: 4px;
          opacity: 0.8;
        }

        .signup-link {
          text-align: center;
          margin-top: 24px;
        }

        .signup-link-text {
          color: #64748b;
          font-size: 14px;
        }

        .signup-link-button {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
        }

        .signup-link-button:hover {
          color: #93c5fd;
        }

        .back-link {
          color: #60a5fa;
          background: none;
          border: none;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
        }

        .back-link:hover {
          color: #93c5fd;
        }

        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
            margin: 10px;
          }
          .brand-name { font-size: 28px; }
          .welcome-title { font-size: 20px; }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-name">Bell24h</div>
            <h1 className="welcome-title">Welcome Back</h1>
            <p className="welcome-subtitle">Sign in with your phone number</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Demo OTP Display (only shown in pilot/fallback mode) */}
          {demoOTP && isOtpSent && (
            <div className="demo-otp">
              <div className="demo-otp-title">Your OTP</div>
              <div className="demo-otp-code">{demoOTP}</div>
              <div className="demo-otp-subtitle">Enter this code below</div>
            </div>
          )}

          {/* Phone Number Input */}
          {!isOtpSent ? (
            <div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-\s]/g, ''))}
                  className="form-input"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={isLoading || !phone}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span> Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleOtpLogin}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label">Enter OTP sent to {phone}</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span> Verifying...
                  </>
                ) : (
                  'Verify OTP & Login'
                )}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="back-link"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="back-link"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Link */}
          <div className="signup-link">
            <p className="signup-link-text">
              New to Bell24h?{' '}
              <Link href="/auth/phone-email" className="signup-link-button">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
