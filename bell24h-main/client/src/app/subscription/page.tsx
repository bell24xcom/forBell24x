'use client';

import React, { useState } from 'react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { Check, Zap, Crown, CreditCard, Calendar } from 'lucide-react';
import Link from 'next/link';

const plans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    icon: Zap,
    color: 'gray',
    features: [
      'Basic profile listing',
      'Up to 10 products',
      'Basic RFQ matching',
      'Email support',
      'Standard matching'
    ],
    cta: 'Current Plan'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1500,
    priceYearly: 15000,
    icon: Crown,
    color: 'blue',
    popular: true,
    features: [
      'Unlimited products',
      'Unlimited RFQs',
      'AI-powered matching',
      'SHAP/LIME explainability',
      'Priority support',
      'Featured listing',
      'Advanced analytics',
      'API access'
    ],
    cta: 'Upgrade to Pro',
    earlyAdopter: 'Free for 6 months (First 100)'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 5000,
    priceYearly: 50000,
    icon: Crown,
    color: 'purple',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Priority matching',
      'Advanced reporting',
      'Multi-user accounts'
    ],
    cta: 'Contact Sales'
  }
};

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    
    try {
      const response = await fetch('/api/subscription/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // TODO: Get from auth context
          planId,
          billingCycle
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment page or show Razorpay checkout
        if (data.payment) {
          // TODO: Initialize Razorpay checkout
          alert('Redirecting to payment...');
        } else {
          alert('Subscription activated!');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to process subscription');
    } finally {
      setLoading(null);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg mb-6">
            Start free, upgrade when you're ready to scale
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-[#0070f3]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 text-green-600 font-semibold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.values(plans).map((plan) => {
            const PlanIcon = plan.icon;
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
            const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.price;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
                  plan.popular ? 'border-[#0070f3] scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="bg-[#0070f3] text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-${plan.color}-100 rounded-lg flex items-center justify-center`}>
                      <PlanIcon className={`w-6 h-6 text-${plan.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      {plan.earlyAdopter && (
                        <p className="text-xs text-green-600 font-medium mt-1">{plan.earlyAdopter}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                      {billingCycle === 'yearly' && (
                        <span className="ml-2 text-gray-500 text-lg">/year</span>
                      )}
                      {billingCycle === 'monthly' && (
                        <span className="ml-2 text-gray-500 text-lg">/month</span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && price > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{monthlyEquivalent.toLocaleString()}/month billed annually
                      </p>
                    )}
                    {price === 0 && (
                      <p className="text-sm text-gray-500 mt-1">Forever free</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id || plan.id === 'free'}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-[#0070f3] text-white hover:bg-[#0051cc]'
                        : plan.id === 'free'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.id !== 'free' && <CreditCard className="w-5 h-5" />}
                        {plan.cta}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            All plans include secure payments, 24/7 support, and regular updates
          </p>
          <Link href="/legal/terms" className="text-sm text-[#0070f3] hover:underline">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </UserDashboardLayout>
  );
}

