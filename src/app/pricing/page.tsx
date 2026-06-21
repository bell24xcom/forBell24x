'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { PLANS, formatLimit } from '@/lib/plans';

// ── FLAGS: the following features exist in lib/plans.ts but have no
// human-readable marketing descriptions — copy below uses field-derived labels.
// Add marketing copy to lib/plans.ts before using this in production.
//
// REMOVED from previous version (were invented, not in lib/plans.ts):
//   - "Verified Supplier" tier at ₹999 — not in PLANS
//   - "Professional" tier at ₹2,999 with 50 RFQs — PLANS.PRO has 20 RFQs, not 50
//   - Add-ons section (₹50/RFQ, ₹999 analytics, ₹1,999 API, ₹4,999 white-label)
//   - Yearly billing toggle (no annual pricing in lib/plans.ts)
//   - Mobile app, Hindi support, white-label, dedicated manager, custom domain
//   - "14-day free trial" claim — not in PLANS
//   - DynamicPricingCalculator component (not confirmed to exist)

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const FEATURE_ROWS: { label: string; key: keyof typeof PLANS['FREE'] }[] = [
  { label: 'Requirements per month',   key: 'maxRFQsPerMonth' },
  { label: 'Quotes per requirement',   key: 'maxQuotesPerRFQ' },
  { label: 'Protected Payment',        key: 'canUseEscrow' },
  { label: 'AI Supplier Matching',     key: 'canUseAIMatching' },
  { label: 'Contact unlocks / month',  key: 'contactUnlocksPerMonth' },
  { label: 'Priority support',         key: 'prioritySupport' },
  { label: 'Analytics access',         key: 'analyticsAccess' },
  { label: 'API access',               key: 'apiAccess' },
];

function renderValue(val: boolean | number | string) {
  if (typeof val === 'boolean') {
    return val
      ? <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
      : <XCircle    className="w-5 h-5 text-slate-600 mx-auto" />;
  }
  const num = Number(val);
  return <span className="text-slate-300 text-sm">{formatLimit(num)}</span>;
}

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState<'PRO' | 'ENTERPRISE' | null>(null);
  const [error,   setError]     = useState('');

  const handleProCheckout = async () => {
    setError('');
    const stored = typeof window !== 'undefined' ? localStorage.getItem('bell24h_user') : null;
    if (!stored) { router.push('/auth/phone-email?redirect=/pricing'); return; }

    setLoading('PRO');
    try {
      const res = await fetch('/api/payment/subscribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'PRO' }),
      });
      if (res.status === 401) { router.push('/auth/phone-email?redirect=/pricing'); return; }
      if (!res.ok) { setError('Unable to start payment. Please try again.'); return; }

      const { orderId, amount, keyId } = await res.json();
      if (!keyId) { setError('Payment system not configured. Contact support.'); return; }

      const loaded = await loadRazorpayScript();
      if (!loaded) { setError('Could not load payment page. Please try again.'); return; }

      const user = JSON.parse(stored);
      const rzp  = new (window as any).Razorpay({
        key:        keyId,
        amount,
        currency:   'INR',
        order_id:   orderId,
        name:       'VyaparSethu',
        description:'Pro Plan — ₹2,999/month',
        prefill:    { name: user.name || '', email: user.email || '', contact: user.phone ? `+91${user.phone}` : '' },
        theme:      { color: '#001f3f' },
        handler:    () => router.push('/dashboard?payment=success&plan=PRO'),
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg">Verified suppliers, protected payments, faster trade — at every size.</p>
      </div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-7 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Free</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">₹0</span>
            <span className="text-slate-500 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>2 requirements/month</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Up to 5 quotes per requirement</li>
            <li className="text-slate-400 text-sm"><span className="text-slate-600 mr-2">✗</span>Protected Payment</li>
            <li className="text-slate-400 text-sm"><span className="text-slate-600 mr-2">✗</span>AI Supplier Matching</li>
            <li className="text-slate-400 text-sm"><span className="text-slate-600 mr-2">✗</span>Contact unlocks</li>
            <li className="text-slate-400 text-sm"><span className="text-slate-600 mr-2">✗</span>Analytics</li>
          </ul>
          <Link href="/auth/phone-email"
            className="block text-center border border-slate-600 text-slate-300 hover:border-white hover:text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors min-h-[44px] leading-[28px]">
            Get started free
          </Link>
        </div>

        {/* PRO */}
        <div className="bg-[#001f3f] border-2 border-[#D4AF37]/60 rounded-2xl p-7 flex flex-col relative">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#001f3f] text-xs font-bold px-4 py-1 rounded-full">
            Most Popular
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">Pro</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">₹2,999</span>
            <span className="text-slate-400 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>20 requirements/month</li>
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Unlimited quotes per requirement</li>
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Protected Payment</li>
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>AI Supplier Matching</li>
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>20 contact unlocks/month</li>
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Priority support</li>
            <li className="text-slate-200 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Analytics access</li>
          </ul>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleProCheckout}
            disabled={loading === 'PRO'}
            className="block text-center bg-[#D4AF37] hover:bg-yellow-400 text-[#001f3f] py-2.5 px-4 rounded-lg font-bold text-sm transition-colors min-h-[44px] leading-[28px] disabled:opacity-60">
            {loading === 'PRO' ? 'Opening payment…' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* ENTERPRISE */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-7 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Enterprise</p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">₹9,999</span>
            <span className="text-slate-500 ml-1">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Unlimited requirements</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Unlimited quotes per requirement</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Protected Payment</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>AI Supplier Matching</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Unlimited contact unlocks</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Priority support</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>Analytics access</li>
            <li className="text-slate-300 text-sm"><span className="text-[#D4AF37] mr-2">▸</span>API access</li>
          </ul>
          <Link href="/contact"
            className="block text-center bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors min-h-[44px] leading-[28px]">
            Contact sales
          </Link>
        </div>
      </div>

      {/* Comparison table */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold text-white text-center mb-8">Full feature comparison</h2>
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-5 py-4 text-left text-slate-400 font-medium w-1/2">Feature</th>
                {(['FREE', 'PRO', 'ENTERPRISE'] as const).map(p => (
                  <th key={p} className="px-5 py-4 text-center text-white font-semibold">{PLANS[p].label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {FEATURE_ROWS.map(row => (
                <tr key={row.key}>
                  <td className="px-5 py-3.5 text-slate-300">{row.label}</td>
                  {(['FREE', 'PRO', 'ENTERPRISE'] as const).map(p => (
                    <td key={p} className="px-5 py-3.5 text-center">
                      {renderValue(PLANS[p][row.key] as boolean | number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 text-xs text-center mt-4">
          {/* FLAG: add marketing feature descriptions to lib/plans.ts for richer table copy */}
          Prices in INR, exclusive of GST. Billed monthly.
        </p>
      </div>

      {/* CTA */}
      <div className="border-t border-slate-800 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Questions before you sign up?</h2>
        <p className="text-slate-400 mb-8">Our team is reachable at <a href="mailto:digitex.studio@gmail.com" className="text-[#D4AF37] hover:underline">digitex.studio@gmail.com</a></p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/phone-email" className="bg-[#D4AF37] hover:bg-yellow-400 text-[#001f3f] px-8 py-3 rounded-lg font-bold text-sm min-h-[44px] flex items-center justify-center transition-colors">
            Start for free
          </Link>
          <Link href="/contact" className="border border-slate-600 text-slate-300 hover:border-white hover:text-white px-8 py-3 rounded-lg font-semibold text-sm min-h-[44px] flex items-center justify-center transition-colors">
            Talk to sales
          </Link>
        </div>
      </div>
    </div>
  );
}
