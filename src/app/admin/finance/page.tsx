'use client';

import { IndianRupee, TrendingUp, CreditCard, ShieldCheck, ArrowUpRight, Clock } from 'lucide-react';

const METRICS = [
  { label: 'Total Deal Value',     value: '—', icon: TrendingUp,  color: 'text-white' },
  { label: 'Revenue (Commission)', value: '—', icon: ArrowUpRight, color: 'text-emerald-500' },
  { label: 'Protected Payments',   value: '—', icon: ShieldCheck,  color: 'text-blue-500' },
  { label: 'Pending Payouts',      value: '—', icon: Clock,        color: 'text-amber-500' },
];

export default function AdminFinancePage() {
  return (
    <div className="p-4 md:p-8 space-y-8 bg-black min-h-screen text-white">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">FINANCIAL <span className="text-emerald-500">LEDGER</span></h1>
        <p className="text-slate-500 text-sm mt-1">Protected Payment revenue and transaction tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {METRICS.map((item, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/30 transition-all">
            <item.icon className={`w-6 h-6 mb-4 ${item.color}`} />
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{item.label}</p>
            <h2 className="text-3xl font-black">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Recent Transactions
          </h3>
        </div>
        <div className="p-12 text-center text-slate-600">
          <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No transactions yet</p>
          <p className="text-xs mt-1">Completed deals will appear here once the first Protected Payment settles.</p>
        </div>
      </div>
    </div>
  );
}
