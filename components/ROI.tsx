'use client';
import { useMemo, useState } from 'react';
export default function ROI(){
  const [spend,setSpend]=useState(500000); const [rfqs,setRfqs]=useState(25);
  const {annualSavings,hoursSaved}=useMemo(()=>{ const rate=0.12; const hrs=3; return {annualSavings:Math.round(spend*rate*12),hoursSaved:rfqs*hrs*12}; },[spend,rfqs]);
  const fmt=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">Estimate Your ROI</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="rounded-md border border-white/10 bg-white/5 p-3 text-sm"><div className="text-neutral-300">Average Monthly Spend (INR)</div>
          <input type="number" value={spend} onChange={e=>setSpend(Number(e.target.value||0))} className="mt-1 w-full bg-transparent outline-none" min={0}/>
        </label>
        <label className="rounded-md border border-white/10 bg-white/5 p-3 text-sm"><div className="text-neutral-300">RFQs per Month</div>
          <input type="number" value={rfqs} onChange={e=>setRfqs(Number(e.target.value||0))} className="mt-1 w-full bg-transparent outline-none" min={0}/>
        </label>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-[#0b1220]/60 p-4"><div className="text-neutral-300 text-sm">Estimated Annual Savings</div><div className="mt-1 text-2xl font-semibold text-amber-200">{fmt(annualSavings)}</div></div>
        <div className="rounded-md border border-white/10 bg-[#0b1220]/60 p-4"><div className="text-neutral-300 text-sm">Hours Saved Annually</div><div className="mt-1 text-2xl font-semibold text-amber-200">{hoursSaved.toLocaleString('en-IN')}</div></div>
      </div>
      <a href="/demo" className="mt-6 inline-flex rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium hover:bg-indigo-500">Book a Demo to Realize These Savings</a>
    </div>
  );
}
