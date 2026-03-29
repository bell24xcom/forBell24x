'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, CheckCircle, Tag, ChevronRight, Star, AlertCircle } from 'lucide-react';

export default function BuyerQuotesInbox() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch buyer's own RFQs
        const rfqsRes = await fetch('/api/dashboard/rfqs', { credentials: 'include' });
        const rfqsData = await rfqsRes.json();
        if (!rfqsData.success) return;

        const rfqList = rfqsData.rfqs;
        setRfqs(rfqList);

        // Fetch quotes for each RFQ in parallel
        const quoteResults = await Promise.all(
          rfqList.map(async (rfq: any) => {
            try {
              const res = await fetch(`/api/rfq/${rfq.id}/quotes`, { credentials: 'include' });
              const data = await res.json();
              return { rfqId: rfq.id, quotes: data.success ? data.quotes : [] };
            } catch {
              return { rfqId: rfq.id, quotes: [] };
            }
          })
        );

        const grouped: Record<string, any[]> = {};
        quoteResults.forEach(({ rfqId, quotes }) => {
          grouped[rfqId] = quotes;
        });
        setQuotes(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = async (quoteId: string) => {
    setAccepting(quoteId);
    try {
      const res = await fetch('/api/deal/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quoteId }),
      });
      const data = await res.json();
      if (data.success && data.deal?.id) {
        router.push(`/checkout/${data.deal.id}`);
      } else {
        alert(data.error || 'Failed to accept quote.');
      }
    } catch {
      alert('Selection failed.');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-slate-500 min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-white">Loading your inbox...</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 min-h-screen bg-[#0F172A]">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tighter">
          QUOTES <span className="text-indigo-500">INBOX</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review and accept quotes from verified suppliers</p>
      </div>

      {rfqs.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-700" />
          <p>No RFQs yet. <a href="/rfq/create" className="text-indigo-400 hover:underline">Post your first RFQ</a></p>
        </div>
      )}

      <div className="space-y-6">
        {rfqs.map(rfq => (
          <div key={rfq.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold">{rfq.title}</h3>
                <div className="flex gap-3 mt-1 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-indigo-500" /> {rfq.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(rfq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-indigo-500/20">
                {quotes[rfq.id]?.length || 0} Quotes
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {(!quotes[rfq.id] || quotes[rfq.id].length === 0) ? (
                <div className="col-span-2 py-8 text-center text-slate-600 text-sm italic">
                  AI is currently matching suppliers for this request...
                </div>
              ) : (
                quotes[rfq.id].map((quote: any) => (
                  <div key={quote.id} className="p-5 bg-black/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Supplier Price</p>
                        <p className="text-2xl font-black text-white">
                          ₹{Number(quote.price).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {quote.supplier?.company || quote.supplier?.name || 'Supplier'}
                        </p>
                      </div>
                      {quote.status === 'ACCEPTED' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mb-6">
                      {quote.notes && (
                        <p className="text-slate-400 text-xs line-clamp-2 italic">"{quote.notes}"</p>
                      )}
                      {quote.deliveryDays && (
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase">
                          <Clock className="w-3 h-3" /> Delivery: {quote.deliveryDays} days
                        </p>
                      )}
                    </div>
                    {quote.status !== 'ACCEPTED' ? (
                      <button
                        onClick={() => handleSelect(quote.id)}
                        disabled={accepting === quote.id}
                        className="w-full bg-white text-black font-black py-3 rounded-xl transition-all hover:bg-indigo-500 hover:text-white flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        {accepting === quote.id ? 'Processing...' : 'Accept Quote & Pay Escrow'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-full text-center py-3 text-green-400 font-bold text-sm">
                        Quote Accepted ✓
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
