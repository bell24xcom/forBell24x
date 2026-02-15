'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentSuccessData {
  subscription: {
    planId: string;
    planName: string;
    activatedAt: string;
    expiresAt: string;
  };
  invoice: {
    invoiceId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have payment data in URL params
    const subscription = searchParams?.get('subscription');

    if (subscription === 'success') {
      // Fetch payment details from session/localStorage or API
      fetchPaymentDetails();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentDetails = async () => {
    try {
      // In a real implementation, fetch from API or session
      // For now, simulate successful payment data
      const mockData: PaymentSuccessData = {
        subscription: {
          planId: 'professional',
          planName: 'Professional Plan',
          activatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        invoice: {
          invoiceId: `INV_${Date.now()}`,
          amount: 75000,
          currency: 'INR',
          status: 'paid',
        },
      };

      setPaymentData(mockData);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Success Header */}
        <div className='text-center mb-12'>
          <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6'>
            <svg
              className='h-8 w-8 text-green-600'
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
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>Payment Successful!</h1>

          <p className='text-lg text-gray-600 mb-8'>
            Welcome to Bell24H! Your subscription has been activated successfully.
          </p>
        </div>

        {/* Subscription Details */}
        {paymentData && (
          <div className='bg-white rounded-lg shadow-lg p-8 mb-8'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-6'>Subscription Details</h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Plan Information</h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Plan:</span>
                    <span className='font-medium'>{paymentData.subscription.planName}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Activated:</span>
                    <span className='font-medium'>
                      {formatDate(paymentData.subscription.activatedAt)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Expires:</span>
                    <span className='font-medium'>
                      {formatDate(paymentData.subscription.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Payment Information</h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Amount:</span>
                    <span className='font-medium'>{formatAmount(paymentData.invoice.amount)}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Invoice ID:</span>
                    <span className='font-medium text-sm'>{paymentData.invoice.invoiceId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Status:</span>
                    <span className='font-medium text-green-600'>Paid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className='bg-blue-50 rounded-lg p-8 mb-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>What's Next?</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4'>
                <svg
                  className='h-6 w-6 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <h3 className='font-medium text-gray-900 mb-2'>Explore Dashboard</h3>
              <p className='text-sm text-gray-600'>
                Access your personalized dashboard with AI-powered insights
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4'>
                <svg
                  className='h-6 w-6 text-green-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
                  />
                </svg>
              </div>
              <h3 className='font-medium text-gray-900 mb-2'>Try Voice RFQ</h3>
              <p className='text-sm text-gray-600'>
                Experience our revolutionary voice-based request for quotation
              </p>
            </div>

            <div className='text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4'>
                <svg
                  className='h-6 w-6 text-purple-600'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                  />
                </svg>
              </div>
              <h3 className='font-medium text-gray-900 mb-2'>AI Analytics</h3>
              <p className='text-sm text-gray-600'>
                Discover market trends with our advanced AI analytics
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <Link
            href='/dashboard'
            className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors'
          >
            Go to Dashboard
          </Link>

          <Link
            href='/voice-rfq'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            Try Voice RFQ
          </Link>

          <Link
            href='/'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors'
          >
            Back to Home
          </Link>
        </div>

        {/* Welcome Message */}
        <div className='text-center'>
          <p className='text-gray-600 mb-4'>
            Thank you for choosing Bell24H! We're excited to help you grow your business.
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading payment status...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
