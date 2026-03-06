'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, IndianRupee, Users2, Loader2, Wallet } from 'lucide-react';

interface Deal {
  id: string;
  rfqTitle: string;
  otherParty: string;
  amount: number;
  status: 'QUOTE_ACCEPTED' | 'PAYMENT_PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED';
  timeline: string;
  createdAt: string;
  role: 'buyer' | 'supplier';
}

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/dashboard/deals', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (dealId: string, action: string) => {
    setActionLoading(dealId + action);
    try {
      const res = await fetch('/api/dashboard/deals', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        const statusMap: Record<string, Deal['status']> = {
          ACTIVE: 'QUOTE_ACCEPTED', PAYMENT_PENDING: 'PAYMENT_PENDING',
          PAID: 'PAID', SHIPPING: 'SHIPPING', DELIVERED: 'DELIVERED', COMPLETED: 'COMPLETED',
        };
        setDeals(prev => prev.map(d =>
          d.id === dealId ? { ...d, status: statusMap[data.newStatus] || d.status } : d
        ));
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = [
      { key: 'QUOTE_ACCEPTED', label: 'Quote Accepted', icon: CheckCircle },
      { key: 'PAYMENT_PENDING', label: 'Payment Pending', icon: Clock },
      { key: 'PAID', label: 'Payment Done', icon: IndianRupee },
      { key: 'SHIPPING', label: 'Shipping', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: Package },
      { key: 'COMPLETED', label: 'Completed', icon: CheckCircle },
    ];
    const currentIndex = steps.findIndex(s => s.key === status);
    return { steps, currentIndex };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUOTE_ACCEPTED': return 'bg-blue-900/40 text-blue-300';
      case 'PAYMENT_PENDING': return 'bg-yellow-900/40 text-yellow-300';
      case 'PAID': return 'bg-green-900/40 text-green-300';
      case 'SHIPPING': return 'bg-purple-900/40 text-purple-300';
      case 'DELIVERED': return 'bg-teal-900/40 text-teal-300';
      case 'COMPLETED': return 'bg-green-900/40 text-green-300';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getActionButton = (deal: Deal) => {
    const { role, status, id, amount } = deal;
    const isLoading = (action: string) => actionLoading === id + action;

    if (role === 'buyer') {
      if (status === 'QUOTE_ACCEPTED' || status === 'PAYMENT_PENDING') {
        return (
          <button
            onClick={() => handleAction(id, 'pay_wallet')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isLoading('pay_wallet') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Pay ₹{amount.toLocaleString('en-IN')} from Wallet
          </button>
        );
      }
      if (status === 'SHIPPING') {
        return (
          <button
            onClick={() => handleAction(id, 'confirm_delivery')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isLoading('confirm_delivery') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            Confirm Delivery Received
          </button>
        );
      }
      if (status === 'DELIVERED') {
        return (
          <button
            onClick={() => handleAction(id, 'complete')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isLoading('complete') ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Close Deal
          </button>
        );
      }
    }

    if (role === 'supplier') {
      if (status === 'PAID') {
        return (
          <button
            onClick={() => handleAction(id, 'mark_shipped')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isLoading('mark_shipped') ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Mark as Shipped
          </button>
        );
      }
      if (status === 'QUOTE_ACCEPTED' || status === 'PAYMENT_PENDING') {
        return (
          <span className="text-sm text-yellow-400 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Waiting for buyer payment
          </span>
        );
      }
      if (status === 'SHIPPING') {
        return (
          <span className="text-sm text-purple-400 flex items-center gap-2">
            <Truck className="w-4 h-4" /> Order in transit — buyer will confirm delivery
          </span>
        );
      }
    }

    if (status === 'COMPLETED') {
      return (
        <span className="text-sm text-green-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Deal completed
        </span>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-700' : 'bg-red-700'
        }`}>
          {toast.msg}
        </div>
      )}

      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer">
        ← Back
      </button>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Active Deals</h1>
        <p className="text-slate-400">Track your ongoing transactions from quote to delivery</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your deals...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
          <Users2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Deals</h3>
          <p className="text-slate-400 mb-6">
            Your first deal starts when you accept a supplier's quote.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard/quotes"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View Quotes →
            </a>
            <a
              href="/rfq/create"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Post New RFQ
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {deals.map((deal) => {
            const { steps, currentIndex } = getStatusStep(deal.status);
            const actionBtn = getActionButton(deal);

            return (
              <div key={deal.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        deal.role === 'buyer' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                      }`}>
                        {deal.role === 'buyer' ? 'You are Buyer' : 'You are Supplier'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{deal.rfqTitle}</h3>
                    <p className="text-slate-400 text-sm">
                      With: <span className="text-white">{deal.otherParty}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      ₹{deal.amount.toLocaleString('en-IN')}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${getStatusColor(deal.status)}`}>
                      {steps[currentIndex]?.label || deal.status}
                    </span>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="relative mb-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={step.key} className="flex-1 relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                isCompleted ? 'bg-green-600 text-white' :
                                isCurrent ? 'bg-blue-600 text-white' :
                                'bg-slate-700 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <p className={`text-xs text-center ${
                              isCurrent ? 'text-white font-medium' : 'text-slate-400'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                              isCompleted ? 'bg-green-600' : 'bg-slate-700'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer: timeline + action */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    Delivery: <span className="text-slate-300">{deal.timeline}</span>
                  </p>
                  {actionBtn}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
