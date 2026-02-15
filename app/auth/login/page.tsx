'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 9876543210');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOTP, setDemoOTP] = useState('');
  const router = useRouter();

  // Email/Password Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@bell24h.com' && password === 'admin123') {
        // Success - redirect to dashboard
        router.push('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP Handler
  const handleSendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Generate demo OTP for testing
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOTP(generatedOTP);
      
      console.log(`📱 OTP for ${phone}: ${generatedOTP}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsOtpSent(true);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP Handler
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp === demoOTP) {
        // Success - redirect to dashboard
        router.push('/dashboard');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset OTP flow
  const resetOtpFlow = () => {
    setIsOtpSent(false);
    setOtp('');
    setDemoOTP('');
    setError('');
  };

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: #ffffff;
        }
        
        .login-container {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .login-card {
          max-width: 400px;
          width: 100%;
          background: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .brand-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .brand-name {
          font-size: 32px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .welcome-title {
          font-size: 24px;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .welcome-subtitle {
          font-size: 16px;
          color: #666666;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          background: #ffffff;
          transition: border-color 0.3s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .btn-primary {
          width: 100%;
          padding: 12px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #5856eb;
        }
        
        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          width: 100%;
          padding: 12px;
          background: #ffffff;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-secondary:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        
        .btn-secondary:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }
        
        .divider {
          position: relative;
          text-align: center;
          margin: 24px 0;
        }
        
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
        }
        
        .divider-text {
          background: #ffffff;
          padding: 0 16px;
          color: #6b7280;
          font-size: 14px;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .demo-otp {
          background: #fffbeb;
          border: 1px solid #fed7aa;
          color: #92400e;
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
          color: #6b7280;
          font-size: 14px;
        }
        
        .signup-link-button {
          color: #8b5cf6;
          text-decoration: none;
          font-weight: 500;
        }
        
        .signup-link-button:hover {
          color: #7c3aed;
        }
        
        .back-link {
          color: #6366f1;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
        }
        
        .back-link:hover {
          color: #5856eb;
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
          
          .brand-name {
            font-size: 28px;
          }
          
          .welcome-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-name">Bell24h</div>
            <h1 className="welcome-title">Welcome Back</h1>
            <p className="welcome-subtitle">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Demo OTP Display */}
          {demoOTP && isOtpSent && (
            <div className="demo-otp">
              <div className="demo-otp-title">Demo OTP</div>
              <div className="demo-otp-code">{demoOTP}</div>
              <div className="demo-otp-subtitle">Use this code for testing</div>
            </div>
          )}

          {/* Email/Password Login Form */}
          {!isOtpSent && (
            <form onSubmit={handleEmailLogin}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span> Signing in...
                  </>
                ) : (
                  'Sign In with Email'
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">Or continue with</span>
          </div>

          {/* Phone OTP Section */}
          {!isOtpSent ? (
            <div>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={isLoading || !phone}
                className="btn-secondary"
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
                <label htmlFor="otp" className="form-label">Enter OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-input"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
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
                  'Verify OTP'
                )}
              </button>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={resetOtpFlow}
                  className="back-link"
                >
                  ← Change Phone Number
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Link */}
          <div className="signup-link">
            <p className="signup-link-text">
              Don't have an account?{' '}
              <Link href="/auth/register" className="signup-link-button">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}