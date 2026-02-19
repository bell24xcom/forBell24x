'use client';
import { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EscrowTxn {
  id: string;
  escrowId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  rfq: { id: string; title: string; category: string } | null;
  quote: { id: string; price: number } | null;
  buyer: { name: string; company: string } | null;
  supplier: { name: string; company: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-900/40',
  COMPLETED: 'text-green-400 bg-green-900/40',
  REFUNDED: 'text-blue-400 bg-blue-900/40',
  FAILED: 'text-red-400 bg-red-900/40',
};

export default function EscrowPage() {
  const [escrows, setEscrows] = useState<EscrowTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchEscrows(); }, []);

  async function fetchEscrows() {
    setLoading(true);
    try {
      const res = await fetch('/api/escrow');
      const data = await res.json();
      if (data.success) setEscrows(data.escrows);
    } catch {
      setError('Failed to load escrow transactions');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(transactionId: string, action: 'release' | 'refund') {
    setActing(transactionId + action);
    try {
      const res = await fetch('/api/escrow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setEscrows(prev =>
          prev.map(e => e.id === transactionId ? { ...e, status: data.transaction.status } : e)
        );
      } else {
        setError(data.error || 'Action failed');
      }
    } catch {
      setError('Action failed');
    } finally {
      setActing(null);
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-indigo-400" />
          <h1 className="text-2xl font-bold">Escrow Transactions</h1>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-red-300 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-slate-400 py-8 text-center">Loading escrow transactions…</div>
        ) : escrows.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="font-medium">No escrow transactions yet</p>
            <p className="text-sm mt-1">Escrow holds are created when you accept a quote.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {escrows.map(esc => (
              <div key={esc.id} className="bg-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-semibold text-lg">{esc.rfq?.title ?? 'Unnamed RFQ'}</div>
                    <div className="text-slate-400 text-sm">{esc.rfq?.category}</div>
                    <div className="text-slate-500 text-xs mt-1">
                      Escrow ID: {esc.escrowId} · {new Date(esc.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[esc.status] ?? 'text-slate-400 bg-slate-700'}`}>
                    {esc.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-slate-400 text-xs mb-1">Amount</div>
                    <div className="font-bold text-indigo-300">{fmt(esc.amount)}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-slate-400 text-xs mb-1">Buyer</div>
                    <div className="font-medium text-sm truncate">{esc.buyer?.company ?? esc.buyer?.name ?? '—'}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3 text-center">
                    <div className="text-slate-400 text-xs mb-1">Supplier</div>
                    <div className="font-medium text-sm truncate">{esc.supplier?.company ?? esc.supplier?.name ?? '—'}</div>
                  </div>
                </div>

                {esc.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(esc.id, 'release')}
                      disabled={acting !== null}
                      className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {acting === esc.id + 'release' ? 'Releasing…' : 'Release Funds'}
                    </button>
                    <button
                      onClick={() => handleAction(esc.id, 'refund')}
                      disabled={acting !== null}
                      className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      {acting === esc.id + 'refund' ? 'Refunding…' : 'Refund'}
                    </button>
                  </div>
                )}

                {esc.status === 'COMPLETED' && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" /> Funds released to supplier
                  </div>
                )}

                {esc.status === 'REFUNDED' && (
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <Clock className="w-4 h-4" /> Refunded to buyer
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
