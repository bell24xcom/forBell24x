'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/app/contexts/AuthContext';

type Step = 'phone' | 'otp';

export default function PhoneCaptureModal() {
  const { captureModalOpen, captureIntent, closeCaptureModal, sendOTP, signIn, loading } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (captureModalOpen) {
      setStep('phone'); setPhone(''); setOtp(['','','','','','']); setError(''); setDevOtp('');
      setTimeout(() => phoneRef.current?.focus(), 100);
    }
  }, [captureModalOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const headline = captureIntent?.label
    ? captureIntent.label
    : 'Get Free Supplier Quotes';

  const handleSendOTP = async () => {
    setError('');
    const cleaned = phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
    if (cleaned.length !== 10) { setError('Enter a valid 10-digit mobile number'); return; }
    try {
      const res = await sendOTP(cleaned);
      if (res?.devOtp) setDevOtp(res.devOtp);
      setStep('otp');
      setCountdown(45);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not send OTP. Try again.');
    }
  };

  const handleOTPChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleOTPKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    setError('');
    const code6 = code || otp.join('');
    if (code6.length !== 6) { setError('Enter the full 6-digit OTP'); return; }
    const cleaned = phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
    try {
      await signIn(cleaned, code6);
      // signIn handles redirect via AuthContext
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Incorrect OTP. Please try again.');
      setOtp(['','','','','','']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  };

  if (!captureModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCaptureModal} />

      {/* Sheet — bottom on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-md bg-[#0F172A] border border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-2xl p-7 pb-10 sm:pb-7 z-10">

        {/* Close */}
        <button onClick={closeCaptureModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-xl leading-none">×</button>

        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#001f3f] font-black text-sm">V</div>
          <span className="text-slate-400 text-sm font-medium">VyaparSethu</span>
        </div>

        {step === 'phone' && (
          <>
            <h2 className="text-white font-bold text-xl mb-1">{headline}</h2>
            <p className="text-slate-400 text-sm mb-6">Enter your mobile — we'll send a one-time code. No password, no spam.</p>

            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-600/60 rounded-xl px-4 py-3 mb-4 focus-within:border-[#D4AF37]/60 transition-colors">
              <span className="text-slate-400 text-sm font-medium shrink-0">🇮🇳 +91</span>
              <input
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={e => { setError(''); setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                placeholder="Mobile number"
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-base tracking-widest"
              />
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <button
              onClick={handleSendOTP}
              disabled={loading || phone.replace(/\D/g,'').length < 10}
              className="w-full bg-[#D4AF37] hover:bg-[#c4a030] disabled:opacity-40 text-[#001f3f] font-bold py-3.5 rounded-xl text-sm transition-colors"
            >
              {loading ? 'Sending…' : 'Send OTP →'}
            </button>

            <p className="text-slate-500 text-xs text-center mt-4">
              By continuing you agree to our{' '}
              <a href="/legal/terms-of-service" className="underline hover:text-slate-400">Terms</a> &amp;{' '}
              <a href="/legal/privacy-policy" className="underline hover:text-slate-400">Privacy Policy</a>
            </p>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-slate-500">
              <span>🔒 Verified suppliers only</span>
              <span>✅ Protected Payment</span>
              <span>⚡ 24h quotes</span>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="text-white font-bold text-xl mb-1">Enter OTP</h2>
            <p className="text-slate-400 text-sm mb-6">
              Sent to +91 {phone} —{' '}
              <button onClick={() => { setStep('phone'); setError(''); }} className="text-[#D4AF37] underline">change</button>
            </p>

            {devOtp && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-amber-300 text-xs mb-4">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}

            {/* OTP boxes */}
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOTPChange(i, e.target.value)}
                  onKeyDown={e => handleOTPKeyDown(i, e)}
                  className="w-11 h-13 text-center text-white text-xl font-bold bg-slate-800/60 border border-slate-600/60 rounded-lg focus:border-[#D4AF37]/60 focus:outline-none transition-colors"
                  style={{ height: '3.25rem' }}
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

            <button
              onClick={() => handleVerify()}
              disabled={loading || otp.join('').length < 6}
              className="w-full bg-[#D4AF37] hover:bg-[#c4a030] disabled:opacity-40 text-[#001f3f] font-bold py-3.5 rounded-xl text-sm transition-colors mb-4"
            >
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>

            <div className="text-center text-sm">
              {countdown > 0 ? (
                <span className="text-slate-500">Resend OTP in {countdown}s</span>
              ) : (
                <button onClick={handleSendOTP} className="text-[#D4AF37] underline">
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
