'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentFailureData {
  errorCode?: string;
  errorMessage?: string;
  orderId?: string;
  planId?: string;
}

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failureData, setFailureData] = useState<PaymentFailureData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract error details from URL params
    const errorCode = searchParams?.get('error_code');
    const errorMessage = searchParams?.get('error_message');
    const orderId = searchParams?.get('order_id');
    const planId = searchParams?.get('plan_id');

    setFailureData({
      errorCode: errorCode || 'PAYMENT_FAILED',
      errorMessage: errorMessage || 'Payment processing failed',
      orderId: orderId || undefined,
      planId: planId || undefined,
    });

    setLoading(false);
  }, [searchParams]);

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: { [key: string]: string } = {
      PAYMENT_FAILED: 'Your payment could not be processed. Please try again.',
      INSUFFICIENT_FUNDS: 'Insufficient funds in your account. Please check your balance.',
      CARD_DECLINED: 'Your card was declined. Please try a different payment method.',
      NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
      TIMEOUT: 'Payment request timed out. Please try again.',
      INVALID_CARD: 'Invalid card details. Please check and try again.',
      BANK_DECLINE: 'Your bank declined the transaction. Please contact your bank.',
      DEFAULT: 'An unexpected error occurred. Please try again or contact support.',
    };

    return errorMessages[errorCode] || errorMessages['DEFAULT'];
  };

  const getErrorIcon = (errorCode: string) => {
    switch (errorCode) {
      case 'INSUFFICIENT_FUNDS':
        return (
          <svg
            className='h-8 w-8 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
            />
          </svg>
        );
      case 'CARD_DECLINED':
        return (
          <svg
            className='h-8 w-8 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
            />
          </svg>
        );
      case 'NETWORK_ERROR':
        return (
          <svg
            className='h-8 w-8 text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0'
            />
          </svg>
        );
      default:
        return (
          <svg
            className='h-8 w-8 text-red-600'
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
        );
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Processing payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Failure Header */}
        <div className='text-center mb-12'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6'>
            {getErrorIcon(failureData.errorCode || 'DEFAULT')}
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Payment Failed</h1>

          <p className='text-lg text-gray-600 mb-8'>
            {getErrorMessage(failureData.errorCode || 'DEFAULT')}
          </p>
        </div>

        {/* Error Details */}
        <div className='bg-white rounded-lg shadow-lg p-8 mb-8'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Error Details</h2>

          <div className='space-y-4'>
            {failureData.errorCode && (
              <div className='flex justify-between items-center py-3 border-b border-gray-200'>
                <span className='text-gray-600 font-medium'>Error Code:</span>
                <span className='font-mono text-sm bg-red-50 text-red-700 px-3 py-1 rounded'>
                  {failureData.errorCode}
                </span>
              </div>
            )}

            {failureData.errorMessage && (
              <div className='flex justify-between items-center py-3 border-b border-gray-200'>
                <span className='text-gray-600 font-medium'>Error Message:</span>
                <span className='text-gray-900 max-w-md text-right'>
                  {failureData.errorMessage}
                </span>
              </div>
            )}

            {failureData.orderId && (
              <div className='flex justify-between items-center py-3 border-b border-gray-200'>
                <span className='text-gray-600 font-medium'>Order ID:</span>
                <span className='font-mono text-sm text-gray-700'>{failureData.orderId}</span>
              </div>
            )}

            {failureData.planId && (
              <div className='flex justify-between items-center py-3'>
                <span className='text-gray-600 font-medium'>Plan:</span>
                <span className='text-gray-900 capitalize'>{failureData.planId} Plan</span>
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className='bg-yellow-50 rounded-lg p-8 mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>Troubleshooting Tips</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-medium text-gray-900 mb-3'>Check Your Payment Method</h3>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>• Verify your card details are correct</li>
                <li>• Ensure sufficient funds in your account</li>
                <li>• Check if your card supports online payments</li>
                <li>• Try a different payment method</li>
              </ul>
            </div>

            <div>
              <h3 className='font-medium text-gray-900 mb-3'>Common Solutions</h3>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try using a different browser</li>
                <li>• Check your internet connection</li>
                <li>• Contact your bank if needed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <Link
            href='/subscription'
            className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors'
          >
            Try Payment Again
          </Link>

          <Link
            href='/contact'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            Contact Support
          </Link>

          <Link
            href='/'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            Back to Home
          </Link>
        </div>

        {/* Support Information */}
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>
            Still having trouble? Our support team is here to help
          </p>
          <div className='flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500'>
            <span>📧 support@bell24h.com</span>
            <span>📞 +91-1800-BELL24</span>
            <span>💬 Live Chat Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading payment status...</p>
          </div>
        </div>
      }
    >
      <PaymentFailureContent />
    </Suspense>
  );
}
