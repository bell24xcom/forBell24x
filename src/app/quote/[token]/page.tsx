'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, CheckCircle, Clock, IndianRupee, ShieldCheck } from 'lucide-react';

export default function PublicQuotePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for decoded data
  const [context, setContext] = useState<{ rfq_id: string; supplier_id: string } | null>(null);

  const [formData, setFormData] = useState({
    price: '',
    delivery_days: '7',
    message: ''
  });

  useEffect(() => {
    try {
      const token = params.token as string;
      if (!token) throw new Error('Invalid Link');
      
      // Basic decoding (In production, use JWT verification)
      const decoded = JSON.parse(atob(token));
      setContext(decoded);
    } catch (err) {
      setError('Invalid or expired quote link.');
    }
  }, [params.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;

    setLoading(true);
    try {
      const res = await fetch('/api/marketing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rfq_id: context.rfq_id,
          supplier_id: context.supplier_id
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500 w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Quote Submitted!</h1>
          <p className="text-slate-400">The buyer has been notified. We will reach out to you via WhatsApp if your quote is selected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">B</div>
          <span className="text-xl font-bold tracking-tighter">BELL24H <span className="text-indigo-500">MARKETPLACE</span></span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold mb-1">Submit Your Quote</h2>
            <p className="text-slate-400 text-sm">Fill in your best price and timeline for this RFQ.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-3 h-3" /> Total Price (INR)
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. 45,000"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all text-lg font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" /> Delivery Timeline (Days)
              </label>
              <select 
                value={formData.delivery_days}
                onChange={e => setFormData({...formData, delivery_days: e.target.value})}
                className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
              >
                <option value="1">1-2 Days (Express)</option>
                <option value="3">3-5 Days</option>
                <option value="7">7 Days (Standard)</option>
                <option value="14">14 Days</option>
                <option value="30">30+ Days</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Send className="w-3 h-3" /> Additional Message
              </label>
              <textarea 
                rows={4}
                placeholder="Include details about quality, shipping, or special terms..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-white focus:border-indigo-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading || !context}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3"
              >
                {loading ? 'Submitting...' : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Quote to Buyer
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">
              <ShieldCheck className="w-3 h-3" /> Verified Secure B2B Transaction
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
