'use client';

import { BarChart, TrendingUp, Users, Target, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const FUNNEL = [
  { label: 'Outreach Sent',   value: '—', icon: Zap,         color: 'text-amber-500' },
  { label: 'Link Views',      value: '—', icon: ArrowRight,  color: 'text-blue-500' },
  { label: 'Quotes Captured', value: '—', icon: Target,      color: 'text-indigo-500' },
  { label: 'Deals Closed',    value: '—', icon: ShieldCheck, color: 'text-emerald-500' },
];

export default function ConversionInsightsPage() {
  return (
    <div className="p-4 md:p-8 space-y-8 bg-black min-h-screen text-white">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">CONVERSION <span className="text-indigo-500">INTELLIGENCE</span></h1>
        <p className="text-slate-500 text-sm mt-1">Funnel performance — populates once first outreach batch completes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {FUNNEL.map((item, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">PENDING</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{item.label}</p>
            <h2 className="text-4xl font-black">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <Users className="text-indigo-500 w-5 h-5" />
            <h3 className="font-bold">Top Performing Suppliers</h3>
          </div>
          <div className="p-12 text-center text-slate-600">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No deal data yet</p>
            <p className="text-xs mt-1">Supplier win rates appear once quotes convert to deals.</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <Zap className="text-amber-500 w-5 h-5" />
            <h3 className="font-bold">Message Variant ROI</h3>
          </div>
          <div className="p-12 text-center text-slate-600">
            <BarChart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">A/B data pending</p>
            <p className="text-xs mt-1">Conversion rates populate after 50+ outreach messages are sent.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
