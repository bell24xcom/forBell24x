'use client';

import { useState } from 'react';

interface CreditPurchaseProps {
  userId: string;
  onSuccess?: () => void;
}

const packages = {
  'starter': { credits: 2, amount: 1000, name: 'Starter Pack' },
  'pro': { credits: 12, amount: 5000, name: 'Pro Pack' },
  'enterprise': { credits: 30, amount: 10000, name: 'Enterprise Pack' }
};

export default function CreditPurchase({ userId, onSuccess }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    if (!userId) {
      setMessage('Please login to purchase credits');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Load Razorpay script
      await loadRazorpayScript();

      // Create purchase order
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          package: selectedPackage
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create purchase order');
      }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: result.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Bell24h Credits',
        description: `${packages[selectedPackage].name} - ${packages[selectedPackage].credits} credits`,
        order_id: result.orderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/credits/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: result.orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchaseId: result.purchaseId
            })
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResponse.ok) {
            setMessage(verifyResult.message);
            onSuccess?.();
          } else {
            setMessage(verifyResult.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Buyer',
          email: 'buyer@example.com',
          contact: '+91 98765 43210'
        },
        theme: {
          color: '#2563eb'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Purchase Credits</h3>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(packages).map(([key, pkg]) => (
          <div
            key={key}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPackage === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPackage(key)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                <p className="text-sm text-gray-600">{pkg.credits} credits</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">₹{pkg.amount}</p>
                <p className="text-sm text-gray-600">₹{Math.round(pkg.amount / pkg.credits)} per credit</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">What you get:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Unlock verified buyer leads</li>
          <li>• Access to contact details</li>
          <li>• Priority support</li>
          <li>• Credits never expire</li>
        </ul>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isProcessing || !userId}
        className="w-full mt-6 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isProcessing ? 'Processing...' : `Buy ${packages[selectedPackage].name} - ₹${packages[selectedPackage].amount}`}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Secure payment powered by Razorpay
      </p>
    </div>
  );
}
