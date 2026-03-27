'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, TrendingUp, CreditCard, ShieldCheck, 
  ArrowUpRight, Clock, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function AdminFinancePage() {
  const [financeData, setFinanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/finance'); // We'll need to define this stats route
      const data = await res.json();
      setFinanceData(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading Ledger...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-black min-h-screen text-white">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">FINANCIAL <span className="text-emerald-500">LEDGER</span></h1>
          <p className="text-slate-500 text-sm mt-1">Real-time marketplace revenue and transaction tracking</p>
        </div>
        <button onClick={fetchFinance} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Deal Value', value: `₹${financeData?.total_gmv || 0}`, icon: TrendingUp, color: 'text-white' },
          { label: 'Revenue (Commission)', value: `₹${financeData?.total_revenue || 0}`, icon: ArrowUpRight, color: 'text-emerald-500' },
          { label: 'Escrow Holdings', value: `₹${financeData?.total_escrow || 0}`, icon: ShieldCheck, color: 'text-blue-500' },
          { label: 'Pending Payouts', value: `₹${financeData?.pending_payouts || 0}`, icon: Clock, color: 'text-amber-500' }
        ].map((item, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl group hover:border-emerald-500/50 transition-all">
            <item.icon className={`w-6 h-6 mb-4 ${item.color}`} />
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{item.label}</p>
            <h2 className="text-3xl font-black">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {financeData?.transactions?.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{tx.provider_payment_id || tx.id}</td>
                  <td className="px-6 py-4 font-bold text-white">₹{tx.amount}</td>
                  <td className="px-6 py-4 text-slate-500 uppercase text-[10px] font-bold">{tx.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      tx.status === 'captured' ? 'bg-emerald-500/20 text-emerald-400' :
                      tx.status === 'created' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
