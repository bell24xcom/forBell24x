import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular?: boolean;
  trialDays: number;
}

const plans: Plan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    currency: '₹',
    period: '30 days',
    features: [
      '5 Voice RFQ requests',
      '20 supplier contacts',
      '100 AI searches',
      'Basic analytics',
      'Email support',
    ],
    trialDays: 30,
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 15000,
    currency: '₹',
    period: 'month',
    features: [
      '50 Voice RFQ requests',
      '200 supplier contacts',
      '500 AI searches',
      'Advanced analytics',
      'Priority support',
      'Custom reports',
    ],
    trialDays: 0,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 75000,
    currency: '₹',
    period: 'month',
    features: [
      '500 Voice RFQ requests',
      '1000 supplier contacts',
      'Unlimited AI searches',
      'Predictive analytics',
      'Dedicated support',
      'API access',
      'Custom integrations',
    ],
    popular: true,
    trialDays: 0,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 175000,
    currency: '₹',
    period: 'month',
    features: [
      'Unlimited Voice RFQ requests',
      'Unlimited supplier contacts',
      'Unlimited AI searches',
      'Advanced AI insights',
      'Dedicated account manager',
      'Custom development',
      'White-label options',
      'SLA guarantee',
    ],
    trialDays: 0,
  },
];

interface SubscriptionPlansProps {
  currentPlan?: string;
  onPlanSelect: (planId: string) => void;
}

export default function SubscriptionPlans({ currentPlan, onPlanSelect }: SubscriptionPlansProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);

    try {
      if (planId === 'trial') {
        // Start free trial
        await startTrial();
      } else {
        // Proceed to payment
        await initiatePayment(planId);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'trial' }),
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  };

  const initiatePayment = async (planId: string) => {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.success) {
        // Initialize Razorpay
        const options = {
          key: data.razorpayKey,
          amount: data.amount,
          currency: data.currency,
          name: 'Bell24H',
          description: `Subscription: ${plans.find(p => p.id === planId)?.name}`,
          order_id: data.orderId,
          handler: function (response: any) {
            handlePaymentSuccess(response, planId);
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
            contact: '+91-98765-43210',
          },
          theme: {
            color: '#3B82F6',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('Failed to initiate payment:', error);
    }
  };

  const handlePaymentSuccess = async (response: any, planId: string) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          planId,
        }),
      });

      if (verifyResponse.ok) {
        router.push('/dashboard?subscription=success');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `${plans[0].currency}${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className='bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Choose Your Plan</h2>
          <p className='text-lg text-gray-600'>Start with our free trial and upgrade as you grow</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-6 ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              } ${currentPlan === plan.id ? 'border-2 border-green-500' : ''}`}
            >
              {plan.popular && (
                <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                    Most Popular
                  </span>
                </div>
              )}

              {currentPlan === plan.id && (
                <div className='absolute -top-3 right-4'>
                  <span className='bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                    Current Plan
                  </span>
                </div>
              )}

              <div className='text-center'>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>{plan.name}</h3>

                <div className='mb-6'>
                  <span className='text-4xl font-bold text-gray-900'>
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && <span className='text-gray-600'>/{plan.period}</span>}
                </div>

                {plan.trialDays > 0 && (
                  <div className='mb-4'>
                    <span className='text-sm text-green-600 font-medium'>
                      {plan.trialDays} days free trial
                    </span>
                  </div>
                )}

                <ul className='text-left space-y-3 mb-8'>
                  {plan.features.map((feature, index) => (
                    <li key={index} className='flex items-center'>
                      <svg
                        className='h-5 w-5 text-green-500 mr-3'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading || currentPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {loading && selectedPlan === plan.id
                    ? 'Processing...'
                    : currentPlan === plan.id
                    ? 'Current Plan'
                    : plan.price === 0
                    ? 'Start Free Trial'
                    : 'Choose Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-12 text-center'>
          <p className='text-gray-600 mb-4'>
            All plans include our 98.5% accurate AI-powered features
          </p>
          <div className='flex justify-center space-x-8 text-sm text-gray-500'>
            <span>✓ 24/7 Support</span>
            <span>✓ 99.9% Uptime</span>
            <span>✓ Data Security</span>
            <span>✓ Easy Cancellation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
