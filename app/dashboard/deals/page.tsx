'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, IndianRupee, Users2 } from 'lucide-react';

interface Deal {
  id: string;
  rfqTitle: string;
  otherParty: string;
  amount: number;
  status: 'QUOTE_ACCEPTED' | 'PAYMENT_PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED';
  timeline: string;
  createdAt: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/dashboard/deals');
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

  return (
      <div className="max-w-7xl">
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

              return (
                <div key={deal.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{deal.rfqTitle}</h3>
                      <p className="text-slate-400 text-sm">
                        With: <span className="text-white">{deal.otherParty}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ₹{deal.amount.toLocaleString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${getStatusColor(deal.status)}`}>
                        {steps[currentIndex]?.label || deal.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isPending = index > currentIndex;

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

                  {/* Timeline Info */}
                  <p className="text-slate-400 text-sm mt-4">
                    Timeline: {deal.timeline}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
