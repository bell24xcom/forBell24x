'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, FileText, Download } from 'lucide-react';
import { useSession } from '@/src/app/contexts/AuthContext';

interface LedgerTx {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  reference: string | null;
  balanceAfter: number;
  createdAt: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  CREDIT:          { label: 'Credit',          color: 'text-green-400 bg-green-900/30 border-green-700/50' },
  DEBIT:           { label: 'Payment',         color: 'text-red-400 bg-red-900/30 border-red-700/50'   },
  ESCROW_LOCK:     { label: 'Escrow Locked',   color: 'text-amber-400 bg-amber-900/30 border-amber-700/50' },
  ESCROW_RELEASE:  { label: 'Escrow Released', color: 'text-green-400 bg-green-900/30 border-green-700/50' },
  WITHDRAWAL:      { label: 'Withdrawal',      color: 'text-red-400 bg-red-900/30 border-red-700/50'   },
  DEPOSIT:         { label: 'Deposit',         color: 'text-green-400 bg-green-900/30 border-green-700/50' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const isCredit = (type: string) => ['CREDIT', 'ESCROW_RELEASE', 'DEPOSIT'].includes(type);

export default function WalletLedgerPage() {
  const { user } = useSession();
  const [range, setRange] = useState('30d');
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === null) { window.location.href = '/auth/phone-email'; return; }
    fetchLedger();
  }, [user, range]);

  const fetchLedger = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/wallet/ledger?range=${range}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) { setBalance(data.balance); setTxns(data.transactions || []); }
      else setError(data.error || 'Failed to load ledger');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const headers = 'Date,Type,Description,Amount (₹),Balance After (₹)\n';
    const rows = txns.map(t =>
      `"${fmtDate(t.createdAt)}","${TYPE_LABELS[t.type]?.label || t.type}","${t.description || ''}",${isCredit(t.type) ? '+' : '-'}${t.amount},${t.balanceAfter}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bell24h-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!user) return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><p className="text-white">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <a href="/dashboard" className="hover:text-white">Dashboard</a>
          <span>/</span>
          <a href="/wallet" className="hover:text-white">Wallet</a>
          <span>/</span>
          <span className="text-white">Ledger</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transaction Ledger</h1>
            <p className="text-slate-400 text-sm mt-1">Current balance: <span className="text-white font-semibold">{fmt(balance)}</span></p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Range filter */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              {[['7d','Last 7 Days'],['30d','30 Days'],['90d','90 Days'],['all','All Time']].map(([v,l]) => (
                <button key={v} onClick={() => setRange(v)}
                  className={`px-3 py-2 text-xs font-medium transition-colors min-h-[40px] ${range === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} disabled={txns.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-lg text-sm transition-colors min-h-[44px] disabled:opacity-40">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white rounded-lg text-sm transition-colors min-h-[44px]">
              <FileText className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {error && <div className="bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>}

        {/* Table */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : txns.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No transactions in this period
                  </td></tr>
                ) : txns.map(tx => {
                  const credit = isCredit(tx.type);
                  const meta = TYPE_LABELS[tx.type] || { label: tx.type, color: 'text-slate-400 bg-slate-800 border-slate-700' };
                  return (
                    <tr key={tx.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtDate(tx.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 max-w-[240px] truncate">{tx.description || tx.reference || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                        <span className="flex items-center justify-end gap-1">
                          {credit
                            ? <ArrowDownLeft className="w-3 h-3 text-green-400" />
                            : <ArrowUpRight className="w-3 h-3 text-red-400" />}
                          <span className={credit ? 'text-green-400' : 'text-red-400'}>
                            {credit ? '+' : '-'}{fmt(tx.amount)}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 whitespace-nowrap">{fmt(tx.balanceAfter)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {txns.length > 0 && (
          <p className="text-slate-500 text-xs text-center mt-3">{txns.length} transactions shown</p>
        )}
      </div>
    </div>
  );
}
