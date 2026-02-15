'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserSubscription {
  id: string;
  plan: string;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  startDate: string;
  endDate: string;
  features: string[];
  limitations: string[];
  usage: {
    rfqsUsed: number;
    rfqsLimit: number;
    suppliersUsed: number;
    suppliersLimit: number;
    apiCallsUsed: number;
    apiCallsLimit: number;
  };
  billing: {
    amount: number;
    currency: string;
    nextBilling: string;
    paymentMethod: string;
  };
}

interface DashboardFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  usage?: {
    current: number;
    limit: number;
  };
  upgradeRequired?: boolean;
}

export default function SubscriptionDashboard() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    // Mock subscription data - in production, fetch from API
    const mockSubscription: UserSubscription = {
      id: 'sub_123456789',
      plan: 'professional',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      features: [
        'Advanced AI matching',
        'Voice & Video RFQs',
        'Priority support',
        'Advanced analytics',
        'Escrow protection',
        'API access'
      ],
      limitations: [
        'Limited custom branding',
        'Standard SLA'
      ],
      usage: {
        rfqsUsed: 23,
        rfqsLimit: 50,
        suppliersUsed: 156,
        suppliersLimit: 500,
        apiCallsUsed: 1247,
        apiCallsLimit: 10000
      },
      billing: {
        amount: 2999,
        currency: '₹',
        nextBilling: '2025-02-01',
        paymentMethod: 'Razorpay - Card ending in 4242'
      }
    };

    setSubscription(mockSubscription);
    setLoading(false);
  }, []);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'gray';
      case 'professional': return 'blue';
      case 'enterprise': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'trial': return 'blue';
      case 'expired': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'yellow';
    return 'green';
  };

  const dashboardFeatures: DashboardFeature[] = [
    {
      id: 'rfq-creation',
      name: 'RFQ Creation',
      description: 'Create and manage your RFQs',
      icon: '📝',
      available: true,
      usage: {
        current: subscription?.usage.rfqsUsed || 0,
        limit: subscription?.usage.rfqsLimit || 0
      }
    },
    {
      id: 'ai-matching',
      name: 'AI Matching',
      description: 'Advanced AI-powered supplier matching',
      icon: '🤖',
      available: subscription?.plan !== 'free',
      upgradeRequired: subscription?.plan === 'free'
    },
    {
      id: 'voice-rfq',
      name: 'Voice RFQ',
      description: 'Create RFQs using voice recording',
      icon: '🎤',
      available: subscription?.plan !== 'free',
      upgradeRequired: subscription?.plan === 'free'
    },
    {
      id: 'video-rfq',
      name: 'Video RFQ',
      description: 'Create RFQs using video recording',
      icon: '📹',
      available: subscription?.plan !== 'free',
      upgradeRequired: subscription?.plan === 'free'
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights and reporting',
      icon: '📊',
      available: true,
      usage: {
        current: subscription?.usage.apiCallsUsed || 0,
        limit: subscription?.usage.apiCallsLimit || 0
      }
    },
    {
      id: 'escrow',
      name: 'Escrow Protection',
      description: 'Secure payment protection',
      icon: '🔒',
      available: subscription?.plan !== 'free',
      upgradeRequired: subscription?.plan === 'free'
    },
    {
      id: 'api-access',
      name: 'API Access',
      description: 'Full API access for integrations',
      icon: '🔌',
      available: subscription?.plan !== 'free',
      upgradeRequired: subscription?.plan === 'free'
    },
    {
      id: 'white-label',
      name: 'White Label',
      description: 'Custom branding and domain',
      icon: '🎨',
      available: subscription?.plan === 'enterprise',
      upgradeRequired: subscription?.plan !== 'enterprise'
    }
  ];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Subscription Found</h2>
          <p className="text-neutral-600 mb-8">Please contact support if you believe this is an error.</p>
          <Link href="/pricing" className="btn-primary">
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Subscription Dashboard</h1>
              <p className="text-neutral-600">Manage your Bell24h subscription and usage</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/pricing" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                Upgrade Plan
              </Link>
              <button className="bg-neutral-200 text-neutral-800 px-4 py-2 rounded-lg hover:bg-gray-300">
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
              </h2>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(subscription.status)}-100 text-${getStatusColor(subscription.status)}-800`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
                <span className="text-neutral-600">
                  {subscription.billing.currency}{subscription.billing.amount.toLocaleString()}/month
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Next billing</p>
              <p className="text-lg font-semibold text-neutral-900">{subscription.billing.nextBilling}</p>
            </div>
          </div>

          {/* Usage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600">RFQs Used</span>
                <span className="text-sm text-neutral-500">
                  {subscription.usage.rfqsUsed} / {subscription.usage.rfqsLimit === -1 ? '∞' : subscription.usage.rfqsLimit}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={`bg-${getUsageColor(getUsagePercentage(subscription.usage.rfqsUsed, subscription.usage.rfqsLimit))}-500 h-2 rounded-full`}
                  style={{ width: `${Math.min(100, getUsagePercentage(subscription.usage.rfqsUsed, subscription.usage.rfqsLimit))}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600">Suppliers</span>
                <span className="text-sm text-neutral-500">
                  {subscription.usage.suppliersUsed} / {subscription.usage.suppliersLimit === -1 ? '∞' : subscription.usage.suppliersLimit}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={`bg-${getUsageColor(getUsagePercentage(subscription.usage.suppliersUsed, subscription.usage.suppliersLimit))}-500 h-2 rounded-full`}
                  style={{ width: `${Math.min(100, getUsagePercentage(subscription.usage.suppliersUsed, subscription.usage.suppliersLimit))}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600">API Calls</span>
                <span className="text-sm text-neutral-500">
                  {subscription.usage.apiCallsUsed.toLocaleString()} / {subscription.usage.apiCallsLimit === -1 ? '∞' : subscription.usage.apiCallsLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className={`bg-${getUsageColor(getUsagePercentage(subscription.usage.apiCallsUsed, subscription.usage.apiCallsLimit))}-500 h-2 rounded-full`}
                  style={{ width: `${Math.min(100, getUsagePercentage(subscription.usage.apiCallsUsed, subscription.usage.apiCallsLimit))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                !feature.available ? 'opacity-50' : ''
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.name}</h3>
                <p className="text-neutral-600 text-sm mb-4">{feature.description}</p>
                
                {feature.available ? (
                  <div className="space-y-2">
                    {feature.usage && (
                      <div className="text-sm text-neutral-500">
                        {feature.usage.current} / {feature.usage.limit === -1 ? '∞' : feature.usage.limit}
                      </div>
                    )}
                    <Link
                      href={`/dashboard/${feature.id}`}
                      className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"
                    >
                      Access
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="inline-block bg-neutral-200 text-neutral-600 px-3 py-1 rounded-full text-sm">
                      {feature.upgradeRequired ? 'Upgrade Required' : 'Not Available'}
                    </span>
                    {feature.upgradeRequired && (
                      <Link
                        href="/pricing"
                        className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                      >
                        Upgrade
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Plan Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Included Features */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Included Features</h3>
            <div className="space-y-4">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Limitations */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Limitations</h3>
            <div className="space-y-4">
              {subscription.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-gray-400 mr-3">✗</span>
                  <span className="text-neutral-700">{limitation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Payment Method</h4>
              <p className="text-neutral-600">{subscription.billing.paymentMethod}</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Next Billing Date</h4>
              <p className="text-neutral-600">{subscription.billing.nextBilling}</p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Amount</h4>
              <p className="text-neutral-600">
                {subscription.billing.currency}{subscription.billing.amount.toLocaleString()}/month
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Status</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(subscription.status)}-100 text-${getStatusColor(subscription.status)}-800`}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
