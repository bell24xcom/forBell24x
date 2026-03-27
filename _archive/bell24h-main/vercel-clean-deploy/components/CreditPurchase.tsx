'use client';

import React, { useState } from 'react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 100,
    price: 999,
    description: 'Perfect for small businesses',
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 500,
    price: 3999,
    description: 'Best for growing companies',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 1000,
    price: 6999,
    description: 'For large organizations',
  },
];

export default function CreditPurchase() {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (pkg: CreditPackage) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: pkg.id,
          credits: pkg.credits,
          amount: pkg.price,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          alert('Purchase successful!');
        }
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Credit Package
        </h2>
        <p className="text-lg text-gray-600">
          Buy credits to unlock premium features and grow your business
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-lg shadow-lg p-6 border-2 ${
              pkg.popular ? 'border-indigo-500' : 'border-gray-200'
            } ${selectedPackage?.id === pkg.id ? 'ring-2 ring-indigo-500' : ''}`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {pkg.name}
              </h3>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-indigo-600">
                  ₹{pkg.price.toLocaleString()}
                </span>
                <div className="text-sm text-gray-500">
                  {pkg.credits} credits
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {pkg.description}
              </p>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-md font-medium ${
                  pkg.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } disabled:opacity-50`}
              >
                {isProcessing ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Credits never expire and can be used for all premium features
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Need a custom package? <a href="/contact" className="text-indigo-600 hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  );
}