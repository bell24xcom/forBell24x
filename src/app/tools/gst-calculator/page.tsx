'use client';
import Link from 'next/link';
import { useState } from 'react';
import { COMMON_GST_ITEMS } from '@/src/data/hsn-codes';

export default function GSTCalculatorPage() {
  const [amount, setAmount]     = useState('');
  const [rate, setRate]         = useState(18);
  const [isInter, setIsInter]   = useState(false); // inter-state (IGST) vs intra-state (CGST+SGST)
  const [isInclusive, setIsInclusive] = useState(false);

  const base = parseFloat(amount) || 0;
  const taxable = isInclusive ? (base * 100) / (100 + rate) : base;
  const totalGST = taxable * (rate / 100);
  const total = taxable + totalGST;
  const cgst = isInter ? 0 : totalGST / 2;
  const sgst = isInter ? 0 : totalGST / 2;
  const igst = isInter ? totalGST : 0;

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-4 py-14">

        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/tools" className="hover:text-slate-300">Tools</Link><span>/</span>
          <span className="text-slate-300">GST Calculator</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-2">B2B GST Calculator — India</h1>
        <p className="text-slate-400 text-base mb-10 max-w-xl">Calculate CGST + SGST or IGST for any B2B invoice. Supports GST-inclusive and GST-exclusive modes.</p>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-7 mb-8">
          {/* Amount */}
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-medium mb-2">Invoice Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount (e.g. 100000)"
              className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/60"
            />
          </div>

          {/* Quick-select GST category */}
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-medium mb-2">Category (quick-select)</label>
            <select
              onChange={e => setRate(Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600/60 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/60"
            >
              {COMMON_GST_ITEMS.map(item => (
                <option key={item.name} value={item.rate}>{item.name} — {item.rate}% GST</option>
              ))}
            </select>
          </div>

          {/* GST rate */}
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-medium mb-2">GST Rate</label>
            <div className="flex gap-2 flex-wrap">
              {[0, 5, 12, 18, 28].map(r => (
                <button key={r} onClick={() => setRate(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${rate === r ? 'bg-[#D4AF37] text-[#001f3f]' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}>
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Toggle row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-11 h-6 rounded-full transition-colors ${isInter ? 'bg-[#D4AF37]' : 'bg-slate-600'} relative`}
                onClick={() => setIsInter(!isInter)}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isInter ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-slate-300 text-sm">{isInter ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-11 h-6 rounded-full transition-colors ${isInclusive ? 'bg-[#D4AF37]' : 'bg-slate-600'} relative`}
                onClick={() => setIsInclusive(!isInclusive)}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isInclusive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-slate-300 text-sm">{isInclusive ? 'GST-inclusive' : 'GST-exclusive'}</span>
            </label>
          </div>
        </div>

        {/* Results */}
        {base > 0 && (
          <div className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-2xl p-7 mb-8">
            <h2 className="text-white font-bold text-lg mb-5">Calculation</h2>
            <div className="space-y-3">
              <Row label="Taxable Amount" value={`₹ ${fmt(taxable)}`} />
              {isInter ? (
                <Row label={`IGST (${rate}%)`} value={`₹ ${fmt(igst)}`} highlight />
              ) : (
                <>
                  <Row label={`CGST (${rate / 2}%)`} value={`₹ ${fmt(cgst)}`} highlight />
                  <Row label={`SGST / UTGST (${rate / 2}%)`} value={`₹ ${fmt(sgst)}`} highlight />
                </>
              )}
              <div className="border-t border-slate-700 pt-3">
                <Row label="Total Invoice Value" value={`₹ ${fmt(total)}`} bold />
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-4">
              {isInclusive ? `Entered ₹${fmt(base)} is GST-inclusive. Taxable value is ₹${fmt(taxable)}.` : `GST of ₹${fmt(totalGST)} added to ₹${fmt(base)} taxable amount.`}
            </p>
          </div>
        )}

        {/* ITC note */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-xs text-slate-400 leading-relaxed mb-8">
          <strong className="text-emerald-400">Input Tax Credit (ITC):</strong> As a registered GST buyer, you can claim the full GST amount paid as ITC against your GST liability, provided your supplier files GSTR-1 correctly. Reconcile monthly via GSTR-2B before claiming.
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/tools/hsn-lookup" className="text-[#D4AF37] hover:underline">→ HSN Code Lookup</Link>
          <Link href="/blog/gst-compliance-b2b-buyers" className="text-slate-400 hover:text-white">→ GST Compliance Guide</Link>
          <Link href="/supplier/gst" className="text-slate-400 hover:text-white">→ GST Verification Tool</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'text-white font-semibold' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? 'text-white font-bold text-base' : highlight ? 'text-[#D4AF37]' : 'text-slate-300'}`}>{value}</span>
    </div>
  );
}
