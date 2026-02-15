'use client';

import { useState } from 'react';
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Star,
    color: 'bg-gray-100 text-gray-800',
    features: [
      'Up to 5 campaigns',
      'Basic analytics',
      'Email support',
      '1 user account',
      'Standard templates'
    ],
    limitations: [
      'Limited AI features',
      'No multi-channel publishing',
      'Basic reporting only'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: '₹1,500',
    period: 'per month',
    description: 'For growing businesses',
    icon: Zap,
    color: 'bg-blue-100 text-blue-800',
    features: [
      'Unlimited campaigns',
      'Advanced analytics',
      'Priority support',
      'Up to 5 user accounts',
      'Premium templates',
      'AI content generation',
      'Basic automation'
    ],
    limitations: [
      'Limited multi-channel publishing',
      'Standard reporting'
    ],
    popular: true
  },
  {
    name: 'Pro+Marketing',
    price: '₹3,500',
    period: 'per month',
    description: 'Complete marketing solution',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800',
    features: [
      'Everything in Pro',
      'Multi-channel publishing',
      'Advanced AI features',
      'Up to 15 user accounts',
      'Custom templates',
      'Advanced automation',
      'Real-time analytics',
      'A/B testing',
      'Social media integration'
    ],
    limitations: [
      'Limited custom integrations'
    ],
    popular: false
  },
  {
    name: 'Enterprise',
    price: '₹50,000',
    period: 'per month',
    description: 'For large organizations',
    icon: Rocket,
    color: 'bg-gold-100 text-gold-800',
    features: [
      'Everything in Pro+Marketing',
      'Unlimited user accounts',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'Advanced security',
      'Custom reporting',
      'API access',
      'Priority feature requests',
      'Dedicated account manager'
    ],
    limitations: [],
    popular: false
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getDiscountedPrice = (price: string) => {
    if (billingPeriod === 'yearly' && price !== '₹0') {
      const numericPrice = parseInt(price.replace('₹', '').replace(',', ''));
      const discountedPrice = Math.round(numericPrice * 10 * 0.8); // 20% discount for yearly
      return `₹${discountedPrice.toLocaleString()}`;
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Scale your business with our powerful marketing platform. 
            From startups to enterprises, we have the right plan for you.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${billingPeriod === 'yearly' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
                } transition-all duration-300 hover:shadow-xl`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${plan.color} mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {getDiscountedPrice(plan.price)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingPeriod === 'yearly' ? 'year' : plan.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Limitations:</p>
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start">
                          <span className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0">•</span>
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.name === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              All Plans Include
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">30-Day Free Trial</h4>
                <p className="text-gray-600 text-sm">Try any paid plan risk-free for 30 days</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Cancel Anytime</h4>
                <p className="text-gray-600 text-sm">No long-term contracts or hidden fees</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Get help whenever you need it</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards, UPI, net banking, and digital wallets through Razorpay.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600">No setup fees for any plan. You only pay the monthly or yearly subscription fee.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
