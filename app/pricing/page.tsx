'use client';

import { useState } from 'react';
import Link from 'next/link';
import DynamicPricingCalculator from '@/components/DynamicPricingCalculator';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  period: string;
  features: string[];
  limitations: string[];
  color: string;
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline';
  maxRFQs: number;
  maxSuppliers: number;
  aiFeatures: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  analytics: boolean;
  escrowProtection: boolean;
  voiceRFQ: boolean;
  videoRFQ: boolean;
  hindiSupport: boolean;
  gstVerification: boolean;
  trustScoring: boolean;
  mobileApp: boolean;
  whiteLabel: boolean;
  dedicatedManager: boolean;
  customIntegrations: boolean;
  sla: string;
  uptime: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 0,
    currency: '₹',
    period: 'month',
    features: [
      'Up to 5 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Mobile app access',
      'Basic analytics',
      'GST verification',
      'Text RFQ only'
    ],
    limitations: [
      'Limited AI features',
      'No priority support',
      'Basic reporting only'
    ],
    color: 'gray',
    buttonText: 'Get Started Free',
    buttonVariant: 'outline',
    maxRFQs: 5,
    maxSuppliers: 50,
    aiFeatures: false,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
    analytics: true,
    escrowProtection: false,
    voiceRFQ: false,
    videoRFQ: false,
    hindiSupport: false,
    gstVerification: true,
    trustScoring: false,
    mobileApp: true,
    whiteLabel: false,
    dedicatedManager: false,
    customIntegrations: false,
    sla: '24 hours',
    uptime: '99.5%'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses with higher volume needs',
    price: 2999,
    originalPrice: 4999,
    currency: '₹',
    period: 'month',
    features: [
      'Up to 50 RFQs per month',
      'Advanced AI matching',
      'Voice & Video RFQs',
      'Priority support',
      'Advanced analytics',
      'Escrow protection',
      'Hindi language support',
      'Trust scoring',
      'API access',
      'Custom integrations'
    ],
    limitations: [
      'Limited custom branding',
      'Standard SLA'
    ],
    color: 'blue',
    popular: true,
    buttonText: 'Start Professional',
    buttonVariant: 'primary',
    maxRFQs: 50,
    maxSuppliers: 500,
    aiFeatures: true,
    prioritySupport: true,
    customDomain: false,
    apiAccess: true,
    analytics: true,
    escrowProtection: true,
    voiceRFQ: true,
    videoRFQ: true,
    hindiSupport: true,
    gstVerification: true,
    trustScoring: true,
    mobileApp: true,
    whiteLabel: false,
    dedicatedManager: false,
    customIntegrations: true,
    sla: '12 hours',
    uptime: '99.9%'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex requirements',
    price: 9999,
    originalPrice: 14999,
    currency: '₹',
    period: 'month',
    features: [
      'Unlimited RFQs',
      'Full AI suite with SHAP/LIME',
      'White-label solution',
      'Dedicated account manager',
      'Custom domain',
      'Advanced reporting',
      'Full escrow protection',
      'Multi-language support',
      'Custom integrations',
      'SLA guarantee',
      'Training & onboarding',
      '24/7 phone support'
    ],
    limitations: [],
    color: 'purple',
    buttonText: 'Contact Sales',
    buttonVariant: 'secondary',
    maxRFQs: -1, // Unlimited
    maxSuppliers: -1, // Unlimited
    aiFeatures: true,
    prioritySupport: true,
    customDomain: true,
    apiAccess: true,
    analytics: true,
    escrowProtection: true,
    voiceRFQ: true,
    videoRFQ: true,
    hindiSupport: true,
    gstVerification: true,
    trustScoring: true,
    mobileApp: true,
    whiteLabel: true,
    dedicatedManager: true,
    customIntegrations: true,
    sla: '4 hours',
    uptime: '99.99%'
  }
];

const addOns = [
  {
    name: 'Additional RFQs',
    description: 'Extra RFQs beyond your plan limit',
    price: 50,
    currency: '₹',
    unit: 'per RFQ',
    features: ['Same quality matching', 'Priority processing']
  },
  {
    name: 'Advanced Analytics',
    description: 'Enhanced reporting and insights',
    price: 999,
    currency: '₹',
    unit: 'per month',
    features: ['Custom dashboards', 'Export capabilities', 'Advanced metrics']
  },
  {
    name: 'API Access',
    description: 'Full API access for integrations',
    price: 1999,
    currency: '₹',
    unit: 'per month',
    features: ['REST API', 'Webhooks', 'Documentation', 'Support']
  },
  {
    name: 'White Label',
    description: 'Custom branding and domain',
    price: 4999,
    currency: '₹',
    unit: 'per month',
    features: ['Custom domain', 'Your branding', 'Custom colors', 'Logo integration']
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const getDiscountedPrice = (tier: PricingTier) => {
    if (billingPeriod === 'yearly') {
      return Math.round(tier.price * 10); // 2 months free
    }
    return tier.price;
  };

  const getSavings = (tier: PricingTier) => {
    if (billingPeriod === 'yearly' && tier.price > 0) {
      return Math.round(tier.price * 2); // 2 months savings
    }
    return 0;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="page-title">
              Choose Your Perfect Plan
            </h1>
            <p className="page-subtitle mb-8">
              Scale your B2B operations with our flexible pricing plans
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                Yearly
              </span>
              {billingPeriod === 'yearly' && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Save 17%
                </span>
              )}
            </div>

            {/* Dynamic Pricing Calculator Toggle */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  showCalculator
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {showCalculator ? 'Hide Calculator' : '🎯 Dynamic Pricing Calculator'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                tier.popular ? 'ring-2 ring-indigo-500 transform scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="page-header">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{tier.name}</h3>
                <p className="text-neutral-600 mb-6">{tier.description}</p>
                
                <div className="mb-4">
                  <span className="text-5xl font-bold text-neutral-900">
                    {tier.price === 0 ? 'Free' : `${tier.currency}${getDiscountedPrice(tier).toLocaleString()}`}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-neutral-500 ml-2">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                  )}
                </div>
                
                {tier.originalPrice && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="text-lg text-neutral-500 line-through">
                      {tier.currency}{tier.originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      Save {tier.currency}{getSavings(tier).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limitations */}
              {tier.limitations.length > 0 && (
                <div className="space-y-2 mb-8">
                  <h4 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Limitations</h4>
                  {tier.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-gray-400 mr-3 mt-1">✗</span>
                      <span className="text-neutral-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  tier.buttonVariant === 'primary'
                    ? 'bg-indigo-600 text-white hover:bg-primary-700'
                    : tier.buttonVariant === 'secondary'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="page-title">
              Compare All Features
            </h2>
            <p className="page-subtitle">
              See what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-neutral-500 uppercase tracking-wide">
                      Features
                    </th>
                    {pricingTiers.map((tier) => (
                      <th key={tier.id} className="px-6 py-4 text-center text-sm font-medium text-neutral-900">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">Monthly RFQs</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.maxRFQs === -1 ? 'Unlimited' : tier.maxRFQs}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">AI Matching</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.aiFeatures ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">Voice RFQ</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.voiceRFQ ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">Video RFQ</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.videoRFQ ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">Escrow Protection</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.escrowProtection ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">API Access</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.apiAccess ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">White Label</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.whiteLabel ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">Dedicated Manager</td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center text-sm text-neutral-500">
                        {tier.dedicatedManager ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Pricing Calculator */}
      {showCalculator && (
        <div className="py-16 bg-gray-50">
          <DynamicPricingCalculator 
            onPlanSelect={handleTierSelect}
            showRevenueProjection={true}
          />
        </div>
      )}

      {/* Add-ons */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="page-title">
              Add-ons & Extensions
            </h2>
            <p className="page-subtitle">
              Enhance your plan with additional features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{addon.name}</h3>
                <p className="feature-description">{addon.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-neutral-900">
                    {addon.currency}{addon.price.toLocaleString()}
                  </span>
                  <span className="text-neutral-500 ml-1">{addon.unit}</span>
                </div>
                <ul className="space-y-2">
                  {addon.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                  Add to Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="page-title">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-neutral-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                What happens if I exceed my RFQ limit?
              </h3>
              <p className="text-neutral-600">
                You can purchase additional RFQs as add-ons, or upgrade to a higher plan. We'll notify you when you're approaching your limit.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-neutral-600">
                Yes, all paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-neutral-600">
                We accept all major credit cards, UPI, net banking, and Razorpay. Enterprise customers can also pay via bank transfer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of businesses already using Bell24h</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100">
              Start Free Trial
            </Link>
            <Link href="/contact" className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}