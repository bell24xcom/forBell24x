'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Shield, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface ClaimFormProps {
  token: string;
  companyName: string;
}

type Step = 'phone' | 'otp' | 'success';

export default function ClaimForm({ token, companyName }: ClaimFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolvedCompany, setResolvedCompany] = useState(companyName);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phone }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      if (data.companyName) setResolvedCompany(data.companyName);
      setStep('otp');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/claim/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, phone, otp }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to verify OTP');
        return;
      }

      // Store token in localStorage (consistent with rest of app)
      if (data.token) {
        localStorage.setItem('bell24h_token', data.token);
        if (data.user) localStorage.setItem('bell24h_user', JSON.stringify(data.user));
      }

      setStep('success');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Claimed!</h2>
        <p className="text-slate-400 text-center text-sm">
          Welcome to Bell24h. Redirecting to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'phone' ? 'bg-indigo-600 text-white' : 'bg-green-500/20 text-green-400'}`}>
          {step === 'phone' ? '1' : <CheckCircle className="w-4 h-4" />}
        </div>
        <div className="flex-1 h-px bg-slate-700" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'otp' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
          2
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your WhatsApp / Phone Number
            </label>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 focus-within:border-indigo-500 transition-colors">
              <span className="text-slate-400 text-sm font-medium select-none">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent py-3 text-white placeholder-slate-500 outline-none text-sm"
                required
                pattern="\d{10}"
              />
              <Phone className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">We'll send a 6-digit OTP to verify you own this business.</p>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enter the 6-digit OTP
            </label>
            <p className="text-xs text-slate-400 mb-3">Sent to +91 {phone.slice(0, 5)}*****</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="● ● ● ● ● ●"
              className="w-full bg-slate-800 border border-slate-600 focus:border-indigo-500 rounded-lg px-4 py-3 text-white text-center text-xl tracking-[0.5em] outline-none transition-colors"
              required
              pattern="\d{6}"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Claim My Profile</>}
          </button>

          <button
            type="button"
            onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
            className="text-slate-400 hover:text-white text-sm text-center transition-colors"
          >
            ← Change phone number
          </button>
        </form>
      )}
    </div>
  );
}
