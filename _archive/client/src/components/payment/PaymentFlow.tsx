'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentFlowProps {
  planId: string;
  amount: number;
  planName: string;
  onSuccess?: (data: any) => void;
  onFailure?: (error: any) => void;
  onCancel?: () => void;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

export default function PaymentFlow({
  planId,
  amount,
  planName,
  onSuccess,
  onFailure,
  onCancel,
}: PaymentFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const steps: PaymentStep[] = [
    {
      id: 'plan-confirmation',
      title: 'Plan Confirmation',
      description: 'Confirm your selected plan',
      status: 'current',
    },
    {
      id: 'payment-initiation',
      title: 'Payment Initiation',
      description: 'Creating payment order',
      status: 'pending',
    },
    {
      id: 'payment-processing',
      title: 'Payment Processing',
      description: 'Processing your payment',
      status: 'pending',
    },
    {
      id: 'verification',
      title: 'Payment Verification',
      description: 'Verifying payment details',
      status: 'pending',
    },
    {
      id: 'activation',
      title: 'Subscription Activation',
      description: 'Activating your subscription',
      status: 'pending',
    },
  ];

  useEffect(() => {
    // Start the payment flow
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);
    updateStepStatus(0, 'current');

    try {
      // Step 1: Plan Confirmation
      updateStepStatus(0, 'completed');
      updateStepStatus(1, 'current');

      // Step 2: Create payment order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userId: 'current_user', // In real app, get from auth context
          amount,
          currency: 'INR',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      setPaymentData(orderData);
      updateStepStatus(1, 'completed');
      updateStepStatus(2, 'current');

      // Step 3: Initialize Razorpay
      await initializeRazorpay(orderData);
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error instanceof Error ? error.message : 'Payment initiation failed');
      updateStepStatus(currentStep, 'error');
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  };

  const initializeRazorpay = async (orderData: any) => {
    try {
      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        await loadRazorpayScript();
      }

      const options = {
        key: orderData.razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Bell24H',
        description: `Subscription: ${planName}`,
        order_id: orderData.orderId,
        handler: function (response: any) {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function () {
            onCancel?.();
          },
        },
        prefill: {
          name: 'User Name', // In real app, get from user profile
          email: 'user@example.com',
          contact: '+91-98765-43210',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      setError('Failed to initialize payment gateway');
      updateStepStatus(2, 'error');
      onFailure?.(error);
    }
  };

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      updateStepStatus(2, 'completed');
      updateStepStatus(3, 'current');

      // Step 4: Verify payment
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          planId,
          userId: 'current_user',
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();
      updateStepStatus(3, 'completed');
      updateStepStatus(4, 'current');

      // Step 5: Subscription activation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate activation
      updateStepStatus(4, 'completed');

      // Success
      onSuccess?.(verifyData);
      router.push('/payment/success?subscription=success');
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Payment verification failed');
      updateStepStatus(3, 'error');
      onFailure?.(error);
      router.push(
        '/payment/failure?error_code=VERIFICATION_FAILED&error_message=Payment verification failed'
      );
    }
  };

  const updateStepStatus = (stepIndex: number, status: PaymentStep['status']) => {
    steps[stepIndex].status = status;
    setCurrentStep(stepIndex);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStepIcon = (step: PaymentStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <svg
            className='h-6 w-6 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        );
      case 'current':
        return (
          <div className='h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
        );
      case 'error':
        return (
          <svg
            className='h-6 w-6 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        );
      default:
        return <div className='h-6 w-6 border-2 border-gray-300 rounded-full'></div>;
    }
  };

  const getStepClass = (step: PaymentStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'current':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Complete Your Payment</h2>
        <p className='text-gray-600'>You're just a few steps away from accessing Bell24H</p>
      </div>

      {/* Plan Summary */}
      <div className='bg-blue-50 rounded-lg p-6 mb-8'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Plan Summary</h3>
        <div className='flex justify-between items-center'>
          <div>
            <p className='font-medium text-gray-900'>{planName}</p>
            <p className='text-sm text-gray-600'>Monthly subscription</p>
          </div>
          <div className='text-right'>
            <p className='text-2xl font-bold text-gray-900'>{formatAmount(amount)}</p>
            <p className='text-sm text-gray-600'>+ 18% GST</p>
          </div>
        </div>
      </div>

      {/* Payment Steps */}
      <div className='space-y-6 mb-8'>
        {steps.map((step, index) => (
          <div key={step.id} className='flex items-center space-x-4'>
            <div className={`flex-shrink-0 ${getStepClass(step)}`}>{getStepIcon(step)}</div>
            <div className='flex-1'>
              <h4 className={`font-medium ${getStepClass(step)}`}>{step.title}</h4>
              <p className='text-sm text-gray-500'>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
          <div className='flex'>
            <svg
              className='h-5 w-5 text-red-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>Payment Error</h3>
              <p className='text-sm text-red-700 mt-1'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Processing your payment...</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-between'>
        <button
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
        >
          Cancel
        </button>

        {error && (
          <button
            onClick={initiatePayment}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Try Again
          </button>
        )}
      </div>

      {/* Security Notice */}
      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-center space-x-2'>
          <svg
            className='h-5 w-5 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
            />
          </svg>
          <span className='text-sm text-gray-600'>
            Your payment is secured with bank-level encryption
          </span>
        </div>
      </div>
    </div>
  );
}
