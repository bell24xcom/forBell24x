'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, IndianRupee, Truck, ArrowRight, Lock } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { dealId } = useParams();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetch(`/api/deal/${dealId}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load deal');
        setDeal(data.deal);
      } catch (err) {
        setError('Failed to load deal details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [dealId]);

  const handlePayment = async () => {
    try {
      const res = await fetch('/api/monetization/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId })
      });
      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "VyaparSethu Marketplace",
        description: `Escrow for Deal #${dealId.toString().substring(0,8)}`,
        order_id: order.orderId,
        handler: function (response: any) {
          window.location.href = `/payment/success?dealId=${dealId}&paymentId=${response.razorpay_payment_id}`;
        },
        prefill: {
          name: deal?.buyer_name || '',
          contact: deal?.buyer_phone || '',
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Payment initialization failed.');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Securing Checkout...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">B</div>
          <span className="text-2xl font-black tracking-tighter">BELL24H <span className="text-indigo-500">PAY</span></span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 md:p-12 space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black mb-2">Secure Escrow Payment</h1>
                <p className="text-slate-400">Funds are held by VyaparSethu and only released to the supplier after you confirm delivery.</p>
              </div>
              <Lock className="text-indigo-500 w-8 h-8 mt-2" />
            </div>

            <div className="bg-black/40 rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Deal Value</span>
                <span className="text-2xl font-black">₹{deal?.deal_value}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Commission Fee (Included)</span>
                <span className="text-emerald-500 font-bold">5% Secured</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Protection Plan</span>
                <span className="text-blue-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Refundable
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/20">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center">
                  <Truck className="text-indigo-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">Verified Supplier Delivery</p>
                  <p className="text-xs text-slate-500">Estimated delivery in {deal?.delivery_days || 7} days</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 text-lg"
            >
              Pay ₹{deal?.deal_value} Securely
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              Powered by Razorpay • Protected by VyaparSethu AI
            </p>
          </div>
        </div>
      </div>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
}
