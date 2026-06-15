'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const BOARD_GRADES = [
  { label: '3-Ply E-flute (light)', gsm: 150, costPerSqm: 28 },
  { label: '3-Ply B-flute (standard)', gsm: 180, costPerSqm: 34 },
  { label: '5-Ply BC-flute (heavy)', gsm: 250, costPerSqm: 52 },
  { label: '7-Ply (extra-heavy / industrial)', gsm: 350, costPerSqm: 78 },
  { label: 'HDPE woven bag (50 kg)', gsm: 120, costPerSqm: 22 },
  { label: 'PP non-woven bag', gsm: 100, costPerSqm: 18 },
];

const GST_RATE = 0.12; // 12% GST on corrugated boxes (HSN 4819)

export default function PackagingCalculatorPage() {
  const [length, setLength] = useState('');
  const [width, setWidth]   = useState('');
  const [height, setHeight] = useState('');
  const [qty, setQty]       = useState('');
  const [gradeIdx, setGradeIdx] = useState(1);

  const result = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const q = parseInt(qty) || 0;
    if (!l || !w || !h || !q) return null;

    const grade = BOARD_GRADES[gradeIdx];
    // Corrugated box blank area (inside dimensions): 2*(lh + wh + lw) + flaps + 10% waste
    const blankSqm = (2 * (l * h + w * h + l * w) / 10000) * 1.12; // cm² → m², +12% waste/deckle
    const costPerUnit = blankSqm * grade.costPerSqm;
    const subtotal = costPerUnit * q;
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;
    const perUnitWithGst = costPerUnit * (1 + GST_RATE);
    return { costPerUnit, subtotal, gst, total, perUnitWithGst, blankSqm };
  }, [length, width, height, qty, gradeIdx]);

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-4 py-14">

        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-300">Home</Link><span>/</span>
          <Link href="/tools" className="hover:text-slate-300">Tools</Link><span>/</span>
          <span className="text-slate-300">Packaging Cost Estimator</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-2">Packaging Cost Estimator</h1>
        <p className="text-slate-400 text-base mb-2 max-w-xl">Estimate corrugated box or woven bag costs for bulk orders. Includes GST at 12% (HSN 4819).</p>
        <p className="text-slate-500 text-xs mb-10">Input dimensions in centimetres. Prices are indicative mill-to-buyer rates — actual prices vary by supplier, location, and volume.</p>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-7 mb-8">

          {/* Board grade */}
          <div className="mb-5">
            <label className="block text-slate-300 text-sm font-medium mb-2">Board / Material Grade</label>
            <div className="space-y-2">
              {BOARD_GRADES.map((g, i) => (
                <button key={i} onClick={() => setGradeIdx(i)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors border ${gradeIdx === i ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white' : 'bg-slate-700/30 border-slate-600/40 text-slate-400 hover:border-slate-500/60'}`}>
                  <span className="font-medium">{g.label}</span>
                  <span className="float-right text-slate-500">~₹{g.costPerSqm}/m²</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[['Length (cm)', length, setLength], ['Width (cm)', width, setWidth], ['Height (cm)', height, setHeight]].map(([label, val, setter]) => (
              <div key={label as string}>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">{label as string}</label>
                <input type="number" value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)}
                  placeholder="0" className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]/60" />
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Order Quantity (units)</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full bg-slate-700/50 border border-slate-600/60 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]/60" />
          </div>
        </div>

        {result && (
          <div className="bg-[#001f3f] border border-[#D4AF37]/30 rounded-2xl p-7 mb-8">
            <h2 className="text-white font-bold text-lg mb-5">Cost Estimate</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Board blank area (incl. waste)</span>
                <span className="text-slate-300 font-mono">{result.blankSqm.toFixed(4)} m²/unit</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cost per unit (excl. GST)</span>
                <span className="text-slate-300 font-mono">₹ {fmt(result.costPerUnit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal ({qty} units)</span>
                <span className="text-slate-300 font-mono">₹ {fmt(result.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#D4AF37]">GST @ 12% (HSN 4819)</span>
                <span className="text-[#D4AF37] font-mono">+ ₹ {fmt(result.gst)}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between">
                <span className="text-white font-semibold text-base">Total Invoice Value</span>
                <span className="text-white font-bold text-base font-mono">₹ {fmt(result.total)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-500">Per unit (incl. GST)</span>
                <span className="text-slate-400 font-mono">₹ {fmt(result.perUnitWithGst)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 text-xs text-slate-400 leading-relaxed mb-8">
          <strong className="text-amber-400">Note:</strong> Prices are indicative mill-to-buyer rates for Maharashtra/Gujarat. Actual quotes depend on deckle width, order frequency, payment terms, and freight. Source 3+ quotes from VyaparSethu to find the best rate.
        </div>

        <div className="bg-[#001f3f] border border-[#D4AF37]/20 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Get Real Quotes from Packaging Suppliers</h3>
          <p className="text-slate-400 text-sm mb-4">Post your Requirement with these specs — Verified Packaging Suppliers from Bhiwandi and Silvassa will quote within 24 hours.</p>
          <Link href="/rfq/create?category=packaging-materials"
            className="inline-block bg-[#D4AF37] hover:bg-[#c4a030] text-[#001f3f] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
            Post Packaging Requirement — Free
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/tools/hsn-lookup" className="text-[#D4AF37] hover:underline">→ HSN Code Lookup</Link>
          <Link href="/suppliers/bhiwandi/packaging-materials" className="text-slate-400 hover:text-white">→ Bhiwandi Packaging Suppliers</Link>
        </div>
      </div>
    </div>
  );
}
