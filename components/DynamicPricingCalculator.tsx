'use client';

import { useState, useEffect } from 'react';
import { 
  DYNAMIC_PRICING_TIERS, 
  PricingCalculator, 
  REVENUE_OPTIMIZATION_STRATEGIES,
  type RevenueProjection 
} from '@/lib/dynamic-pricing';

interface PricingCalculatorProps {
  onPlanSelect?: (planId: string) => void;
  showRevenueProjection?: boolean;
}

export default function PricingCalculatorComponent({ 
  onPlanSelect, 
  showRevenueProjection = false 
}: PricingCalculatorProps) {
  const [selectedTier, setSelectedTier] = useState('professional');
  const [businessSize, setBusinessSize] = useState<'startup' | 'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [monthlyTransactions, setMonthlyTransactions] = useState(25);
  const [avgTransactionValue, setAvgTransactionValue] = useState(50000);
  const [revenueProjection, setRevenueProjection] = useState<RevenueProjection | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculate dynamic pricing
  const dynamicPricing = PricingCalculator.calculateDynamicPricing(
    selectedTier,
    monthlyTransactions,
    avgTransactionValue
  );

  // Get pricing recommendation
  const recommendation = PricingCalculator.getPricingRecommendation(
    businessSize,
    monthlyTransactions,
    avgTransactionValue
  );

  // Calculate revenue projection
  useEffect(() => {
    if (showRevenueProjection) {
      const projection = PricingCalculator.calculateFirstMonthRevenue(
        1000, // 1000 users
        avgTransactionValue,
        monthlyTransactions,
        { starter: 0.4, professional: 0.5, enterprise: 0.1 }
      );
      setRevenueProjection(projection);
    }
  }, [monthlyTransactions, avgTransactionValue, showRevenueProjection]);

  const selectedTierData = DYNAMIC_PRICING_TIERS.find(tier => tier.id === selectedTier);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Dynamic Pricing Calculator
        </h2>
        <p className="text-lg text-gray-600">
          Get personalized pricing based on your business needs and transaction volume
        </p>
      </div>

      {/* Business Profile Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Business Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Size
            </label>
            <select
              value={businessSize}
              onChange={(e) => setBusinessSize(e.target.value as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Business Size"
            >
              <option value="startup">Startup (1-10 employees)</option>
              <option value="small">Small (11-50 employees)</option>
              <option value="medium">Medium (51-200 employees)</option>
              <option value="large">Large (201-1000 employees)</option>
              <option value="enterprise">Enterprise (1000+ employees)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Transactions
            </label>
            <input
              type="number"
              value={monthlyTransactions}
              onChange={(e) => setMonthlyTransactions(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="1000"
              aria-label="Monthly Transactions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avg Transaction Value (₹)
            </label>
            <input
              type="number"
              value={avgTransactionValue}
              onChange={(e) => setAvgTransactionValue(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1000"
              step="1000"
              aria-label="Average Transaction Value"
            />
          </div>
        </div>
      </div>

      {/* Pricing Recommendation */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">
          💡 Recommended Plan: {recommendation.recommendedTier.charAt(0).toUpperCase() + recommendation.recommendedTier.slice(1)}
        </h3>
        <p className="text-blue-800 mb-4">{recommendation.reasoning}</p>
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Projected Monthly Cost:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{recommendation.projectedMonthlyCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {DYNAMIC_PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative bg-white rounded-lg shadow-lg p-6 ${
              tier.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
            } ${selectedTier === tier.id ? 'ring-2 ring-green-500' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
              <p className="text-gray-600 mb-4">{tier.description}</p>
              
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {tier.monthlyPrice === 0 ? 'Free' : `₹${tier.monthlyPrice.toLocaleString()}`}
                </div>
                <div className="text-gray-600">per month</div>
                {tier.annualPrice > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    Save ₹{(tier.monthlyPrice * 12 - tier.annualPrice).toLocaleString()} with annual billing
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Pricing Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Your Dynamic Fees:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="font-medium">{dynamicPricing.transactionFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Fee:</span>
                  <span className="font-medium">{dynamicPricing.escrowFee}%</span>
                </div>
                {tier.commissionRate > 0 && (
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <span className="font-medium">{dynamicPricing.commission}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {tier.features.slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                setSelectedTier(tier.id);
                onPlanSelect?.(tier.id);
              }}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                tier.id === selectedTier
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : tier.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              {tier.id === selectedTier ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Revenue Projection */}
      {showRevenueProjection && revenueProjection && (
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-900">
            📈 First Month Revenue Projection
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{revenueProjection.monthlyRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                ₹{revenueProjection.transactionFees.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Transaction Fees</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{revenueProjection.escrowFees.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Escrow Fees</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹{revenueProjection.subscriptionRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Subscriptions</div>
            </div>
          </div>
        </div>
      )}

      {/* Early Bird Offer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">🎉</span>
          <h3 className="text-xl font-semibold text-yellow-900">Early Bird Special</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Professional Plan</h4>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-yellow-600">
                ₹{REVENUE_OPTIMIZATION_STRATEGIES.EARLY_BIRD.professional.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 ml-2">/month</span>
              <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded ml-2">
                33% OFF
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Regular price: ₹{DYNAMIC_PRICING_TIERS[1].monthlyPrice.toLocaleString()}/month
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Enterprise Plan</h4>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-yellow-600">
                ₹{REVENUE_OPTIMIZATION_STRATEGIES.EARLY_BIRD.enterprise.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 ml-2">/month</span>
              <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded ml-2">
                30% OFF
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Regular price: ₹{DYNAMIC_PRICING_TIERS[2].monthlyPrice.toLocaleString()}/month
            </p>
          </div>
        </div>
        <p className="text-sm text-yellow-700 mt-4">
          ⏰ Limited time offer for first {REVENUE_OPTIMIZATION_STRATEGIES.EARLY_BIRD.maxUsers} users. 
          Valid until {new Date(REVENUE_OPTIMIZATION_STRATEGIES.EARLY_BIRD.validUntil).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
