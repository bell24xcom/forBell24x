'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw, IndianRupee, Tag, Package,
  User, CheckCircle2, ChevronDown,
  ChevronUp, Activity, AlertTriangle
} from 'lucide-react';

interface Quote {
  id: string;
  rfq_id: string;
  supplier_id: string;
  price: string;
  delivery_days: number;
  message: string;
  status: string;
  created_at: string;
}

interface RFQ {
  id: string;
  rfq_text: string;
  category: string;
  quantity: string;
  location: string;
  status: string;
  created_at: string;
}

export default function RevenueControlPage() {
  const [rfqs,        setRfqs]        = useState<RFQ[]>([]);
  const [quotes,      setQuotes]      = useState<Record<string, Quote[]>>({});
  const [loading,     setLoading]     = useState(true);
  const [degraded,    setDegraded]    = useState(false);
  const [degradedMsg, setDegradedMsg] = useState('');
  const [expandedRfq, setExpandedRfq] = useState<string | null>(null);
  const [refreshing,  setRefreshing]  = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    setDegraded(false);
    try {
      // Fetch RFQs with 8s client-side timeout
      const rfqsCtrl = new AbortController();
      const rfqsTimer = setTimeout(() => rfqsCtrl.abort(), 8000);
      let rfqArray: RFQ[] = [];
      try {
        const rfqsRes  = await fetch('/api/admin/marketing/rfqs', { signal: rfqsCtrl.signal });
        clearTimeout(rfqsTimer);
        const rfqsData = await rfqsRes.json();
        if (Array.isArray(rfqsData)) {
          rfqArray = rfqsData;
        } else if (Array.isArray(rfqsData?.rfqs)) {
          rfqArray = rfqsData.rfqs;
          if (rfqsData.serviceDegraded) {
            setDegraded(true);
            setDegradedMsg(rfqsData.reason || 'InsForge unavailable — showing empty dataset.');
          }
        }
      } catch (e: any) {
        clearTimeout(rfqsTimer);
        setDegraded(true);
        setDegradedMsg(e?.name === 'AbortError' ? 'InsForge timed out after 8s.' : String(e?.message));
      }
      setRfqs(rfqArray);

      // Fetch quotes — gracefully handle 501/error responses
      let quotesArray: Quote[] = [];
      try {
        const quotesRes  = await fetch('/api/admin/marketing/quotes');
        if (quotesRes.ok) {
          const quotesData = await quotesRes.json();
          if (Array.isArray(quotesData)) quotesArray = quotesData;
        }
      } catch { /* quotes are non-critical */ }

      // Group by RFQ id
      const grouped = quotesArray.reduce((acc: Record<string, Quote[]>, q: Quote) => {
        if (!acc[q.rfq_id]) acc[q.rfq_id] = [];
        acc[q.rfq_id].push(q);
        return acc;
      }, {});
      setQuotes(grouped);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const selectQuote = async (rfqId: string, quoteId: string) => {
    try {
      await fetch('/api/admin/marketing/select-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId, quoteId }),
      });
      fetchData();
    } catch (err) {
      console.error('Selection error:', err);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
      Loading Revenue Control…
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Degraded-service banner */}
      {degraded && (
        <div className="flex items-start gap-3 bg-amber-900/30 border border-amber-600/40 text-amber-300 rounded-xl px-5 py-4 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">InsForge backend unavailable</p>
            <p className="text-amber-400/80 text-xs mt-0.5">{degradedMsg} Quotes are served from the primary Prisma DB.</p>
          </div>
        </div>
      )}

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total RFQs</p>
          <h2 className="text-3xl font-bold text-white">{rfqs.length}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-500 text-xs font-bold uppercase mb-1">Quotes Received</p>
          <h2 className="text-3xl font-bold text-indigo-500">{Object.values(quotes).flat().length}</h2>
        </div>
        <div className="bg-indigo-600/10 border border-indigo-500/30 p-6 rounded-3xl">
          <p className="text-indigo-400 text-xs font-bold uppercase mb-1">Conversion Rate</p>
          <h2 className="text-3xl font-bold text-white">
            {rfqs.length > 0
              ? ((rfqs.filter(r => r.status === 'closed').length / rfqs.length) * 100).toFixed(1)
              : 0}%
          </h2>
        </div>
        <div className="bg-emerald-600/10 border border-emerald-500/30 p-6 rounded-3xl">
          <p className="text-emerald-400 text-xs font-bold uppercase mb-1">Marketplace Health</p>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle2 className={`w-5 h-5 ${degraded ? 'text-amber-400' : 'text-emerald-500'}`} />
            <span className={`text-sm font-bold uppercase ${degraded ? 'text-amber-400' : 'text-emerald-500'}`}>
              {degraded ? 'DEGRADED' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* RFQ Lifecycle Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              RFQ → Quote Pipeline
            </h3>
            <p className="text-slate-500 text-xs">Track every step from lead to deal</p>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {rfqs.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm">{degraded ? 'InsForge unavailable — no RFQs to display.' : 'No RFQs found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">RFQ Details</th>
                  <th className="px-6 py-4">Quotes</th>
                  <th className="px-6 py-4">Market Info</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {rfqs.map(rfq => (
                  <React.Fragment key={rfq.id}>
                    <tr
                      className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${expandedRfq === rfq.id ? 'bg-indigo-500/5' : ''}`}
                      onClick={() => setExpandedRfq(expandedRfq === rfq.id ? null : rfq.id)}
                    >
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          rfq.status === 'new'    ? 'border-slate-700 text-slate-500' :
                          rfq.status === 'quoted' ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10' :
                          rfq.status === 'closed' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' :
                          'border-amber-500/50 text-amber-400 bg-amber-500/10'
                        }`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-bold text-sm line-clamp-1">{rfq.rfq_text}</p>
                        <p className="text-slate-500 text-[10px] uppercase font-mono mt-1">{rfq.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {(quotes[rfq.id] || []).slice(0, 3).map((_, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                                <User className="w-3 h-3 text-slate-500" />
                              </div>
                            ))}
                          </div>
                          <span className="text-white font-bold text-sm">{quotes[rfq.id]?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Tag className="w-3 h-3 text-indigo-500" /> {rfq.category}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Package className="w-3 h-3" /> {rfq.quantity}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expandedRfq === rfq.id
                          ? <ChevronUp className="w-4 h-4 ml-auto" />
                          : <ChevronDown className="w-4 h-4 ml-auto" />}
                      </td>
                    </tr>
                    {expandedRfq === rfq.id && (
                      <tr>
                        <td colSpan={5} className="bg-slate-950/50 p-6 border-t border-slate-800">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <IndianRupee className="w-3 h-3" /> Quotes Comparison
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(quotes[rfq.id] || []).length === 0 ? (
                                <div className="col-span-3 text-center py-8 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                                  No quotes submitted yet for this RFQ.
                                </div>
                              ) : (
                                quotes[rfq.id].map(quote => (
                                  <div key={quote.id} className={`p-5 rounded-2xl border transition-all ${quote.status === 'accepted' ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Supplier Price</p>
                                        <p className="text-2xl font-black text-white">₹{quote.price}</p>
                                      </div>
                                      <div className={`p-2 rounded-lg ${quote.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                        <CheckCircle2 className="w-5 h-5" />
                                      </div>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Delivery</span>
                                        <span className="text-white font-bold">{quote.delivery_days} Days</span>
                                      </div>
                                      <p className="text-slate-400 text-xs italic line-clamp-3">"{quote.message}"</p>
                                    </div>
                                    <button
                                      onClick={() => selectQuote(rfq.id, quote.id)}
                                      disabled={quote.status === 'accepted' || rfq.status === 'closed'}
                                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all"
                                    >
                                      {quote.status === 'accepted' ? 'Winner Selected' : 'Select This Quote'}
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
