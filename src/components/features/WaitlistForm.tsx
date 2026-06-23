'use client';

import { useState } from 'react';

export default function WaitlistForm({ feature }: { feature: string }) {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.trim().length >= 10) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-xl p-6 text-center">
        <div className="text-[#D4AF37] text-3xl mb-3">✓</div>
        <p className="text-white font-semibold mb-1">You&apos;re on the waitlist!</p>
        <p className="text-slate-400 text-sm">We&apos;ll send you a WhatsApp message when {feature} launches.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
      <p className="text-white font-semibold text-sm mb-1">
        Join Waitlist — Notify me on WhatsApp when {feature} launches
      </p>
      <p className="text-slate-500 text-xs mb-4">Beta — Coming Soon. No spam. WhatsApp only.</p>
      <div className="flex gap-3 flex-wrap">
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Your WhatsApp number (e.g. 9876543210)"
          className="flex-1 min-w-[200px] bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          required
        />
        <button
          type="submit"
          className="bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shrink-0"
        >
          Join Waitlist
        </button>
      </div>
    </form>
  );
}
