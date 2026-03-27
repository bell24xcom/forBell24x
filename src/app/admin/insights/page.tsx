'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, TrendingUp, Users, Target, 
  ArrowRight, ShieldCheck, Zap, RefreshCw 
} from 'lucide-react';

export default function ConversionInsightsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/stats'); // We'll need this route
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading Intelligence...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-black min-h-screen text-white">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">CONVERSION <span className="text-indigo-500">INTELLIGENCE</span></h1>
          <p className="text-slate-500 text-sm mt-1">Self-optimizing engine performance metrics</p>
        </div>
        <button onClick={fetchInsights} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Funnel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Outreach Sent', value: stats?.outreach || 0, icon: Zap, color: 'text-amber-500' },
          { label: 'Link Views', value: stats?.views || 0, icon: ArrowRight, color: 'text-blue-500' },
          { label: 'Quotes Captured', value: stats?.quotes || 0, icon: Target, color: 'text-indigo-500' },
          { label: 'Deals Closed', value: stats?.deals || 0, icon: ShieldCheck, color: 'text-emerald-500' }
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl group hover:border-indigo-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">LIVE</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{item.label}</p>
            <h2 className="text-4xl font-black">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Suppliers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <Users className="text-indigo-500 w-5 h-5" />
            <h3 className="font-bold">Top Performing Suppliers</h3>
          </div>
          <div className="p-6 space-y-4">
            {stats?.top_suppliers?.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center font-bold text-indigo-500">#{i+1}</div>
                  <div>
                    <p className="text-sm font-bold">{s.supplier_id}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{s.total_deals} DEALS • {s.total_quotes} QUOTES</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-indigo-400 font-black text-xl">{((s.total_deals / s.total_quotes) * 100).toFixed(0)}%</p>
                  <p className="text-[10px] text-slate-600 uppercase font-bold">WIN RATE</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Optimization */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center gap-2">
            <Zap className="text-amber-500 w-5 h-5" />
            <h3 className="font-bold">Message Variant ROI</h3>
          </div>
          <div className="p-6 space-y-6">
            {stats?.message_roi?.map((m: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-400">{m.variant_name}</span>
                  <span className="text-white">{m.conv_rate}% Conv.</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${m.conv_rate}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
