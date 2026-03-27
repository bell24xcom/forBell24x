'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/src/app/contexts/AuthContext';
import { Printer, ArrowLeft } from 'lucide-react';

interface Receipt {
  deal: {
    id: string;
    price: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    buyer: { name: string | null; company: string | null; gstNumber: string | null; phone: string | null; email: string | null };
    supplier: { name: string | null; company: string | null; gstNumber: string | null; phone: string | null; email: string | null };
    rfq: { title: string; category: string; description: string | null };
    quote: { deliveryDays: number | null; terms: string | null; timeline: string | null };
  };
  escrowTxns: Array<{ id: string; type: string; amount: number; createdAt: string }>;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

export default function DealReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const [data, setData] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === null) { window.location.href = '/auth/phone-email'; return; }
    fetch(`/api/deals/${id}/receipt`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else setError(d.error || 'Not found'); })
      .catch(() => setError('Failed to load receipt'))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (!user || loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <a href="/dashboard" className="text-indigo-400 underline">Back to Dashboard</a>
      </div>
    </div>
  );

  if (!data) return null;
  const { deal, escrowTxns } = data;
  const receiptNo = `DEAL-${deal.id.slice(-8).toUpperCase()}`;
  const escrowLocked = escrowTxns.find(t => t.type === 'ESCROW_LOCK');
  const escrowReleased = escrowTxns.find(t => t.type === 'ESCROW_RELEASE');

  return (
    <>
      {/* Print CSS */}
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } .receipt-box { border: 1px solid #ccc !important; box-shadow: none !important; } }`}</style>

      <div className="min-h-screen bg-[#0F172A] text-white py-8 px-4">
        {/* Controls — hidden on print */}
        <div className="no-print max-w-3xl mx-auto flex items-center justify-between mb-6">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors min-h-[44px]">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>

        {/* Receipt Card */}
        <div className="receipt-box max-w-3xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 border-b border-slate-700 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Bell24h</h1>
              <p className="text-slate-400 text-xs mt-1">Digitex Studio — B2B Procurement Platform</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase tracking-wider">Deal Receipt</p>
              <p className="text-white font-mono font-bold text-lg">{receiptNo}</p>
              <p className="text-slate-400 text-xs mt-1">{fmtDate(deal.createdAt)}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 mb-8">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${deal.status === 'COMPLETED' ? 'bg-green-900/40 text-green-400 border border-green-700/50' : 'bg-amber-900/40 text-amber-400 border border-amber-700/50'}`}>
              {deal.status}
            </span>
            <span className="text-slate-400 text-sm">Payment Method: Bell24h Wallet</span>
          </div>

          {/* RFQ Summary */}
          <div className="bg-slate-800/60 rounded-xl p-4 mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">RFQ</p>
            <p className="text-white font-semibold">{deal.rfq.title}</p>
            <p className="text-slate-400 text-sm">{deal.rfq.category}</p>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Buyer</p>
              <p className="text-white font-semibold">{deal.buyer.name || '—'}</p>
              {deal.buyer.company && <p className="text-slate-300 text-sm">{deal.buyer.company}</p>}
              {deal.buyer.gstNumber && <p className="text-slate-400 text-xs mt-1">GST: {deal.buyer.gstNumber}</p>}
              {deal.buyer.phone && <p className="text-slate-400 text-xs">{deal.buyer.phone}</p>}
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Supplier</p>
              <p className="text-white font-semibold">{deal.supplier.name || '—'}</p>
              {deal.supplier.company && <p className="text-slate-300 text-sm">{deal.supplier.company}</p>}
              {deal.supplier.gstNumber && <p className="text-slate-400 text-xs mt-1">GST: {deal.supplier.gstNumber}</p>}
              {deal.supplier.phone && <p className="text-slate-400 text-xs">{deal.supplier.phone}</p>}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-300">Deal Amount</p>
              <p className="text-3xl font-bold text-white">{fmt(deal.price)}</p>
            </div>
            {deal.quote.deliveryDays && (
              <p className="text-slate-400 text-sm mt-2">Delivery: {deal.quote.deliveryDays} days</p>
            )}
            {deal.quote.terms && (
              <p className="text-slate-400 text-sm">Terms: {deal.quote.terms}</p>
            )}
          </div>

          {/* Escrow */}
          {escrowTxns.length > 0 && (
            <div className="mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Escrow History</p>
              <div className="space-y-2">
                {escrowLocked && (
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-400">Escrow Locked</span>
                    <span className="text-slate-300">{fmtDate(escrowLocked.createdAt)}</span>
                  </div>
                )}
                {escrowReleased && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Escrow Released</span>
                    <span className="text-slate-300">{fmtDate(escrowReleased.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-700 pt-6 text-center">
            <p className="text-slate-500 text-xs">This is a computer-generated receipt from Bell24h (Digitex Studio)</p>
            <p className="text-slate-300 text-xs mt-1">GSTIN: 27AAPFU0939F1ZV · bell24h.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
