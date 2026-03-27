'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface FinanceOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  features: string[];
}

interface Transaction {
  id: string;
  type: 'kredx' | 'razorpayx' | 'escrow';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'completed' | 'failed';
  date: string;
  referenceId: string;
}

export default function FinancePage() {
  const {
    data: session,
    status,
  } = () => ({
    data: { user: { id: 'user', email: 'user@company.com', name: 'Business User' } },
    status: 'authenticated',
  });
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Removed unauthenticated check since mock auth always returns 'authenticated'
    if (session?.user) {
      loadFinanceData();
    }
  }, [session, status]);

  const loadFinanceData = async () => {
    try {
      // Simulate loading transaction history
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransactions([
        {
          id: 'TXN001',
          type: 'kredx',
          amount: 150000,
          currency: 'INR',
          status: 'completed',
          date: '2024-01-15',
          referenceId: 'KRX123456',
        },
        {
          id: 'TXN002',
          type: 'razorpayx',
          amount: 75000,
          currency: 'INR',
          status: 'pending',
          date: '2024-01-16',
          referenceId: 'RPX789012',
        },
      ]);
    } catch (error) {
      console.error('Failed to load finance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const financeOptions: FinanceOption[] = [
    {
      id: 'kredx',
      name: 'KredX Invoice Discounting',
      description: 'Get instant cash against your pending invoices with competitive rates',
      icon: <span>📄</span>,
      available: true,
      minAmount: 100000,
      maxAmount: 10000000,
      processingTime: '24-48 hours',
      features: [
        'Instant invoice verification',
        'Competitive discount rates (8-12% annually)',
        'No collateral required',
        'Digital process with minimal documentation',
        'Real-time status tracking',
      ],
    },
    {
      id: 'razorpayx',
      name: 'RazorpayX Business Banking',
      description: 'Advanced business banking with automated payouts and expense management',
      icon: <span>💳</span>,
      available: true,
      minAmount: 1000,
      maxAmount: 50000000,
      processingTime: 'Instant',
      features: [
        'Instant business account opening',
        'Automated vendor payments',
        'Multi-currency support',
        'Advanced reporting and analytics',
        'API-driven banking operations',
      ],
    },
    {
      id: 'escrow',
      name: 'Smart Escrow Services',
      description: 'Blockchain-powered escrow for secure high-value transactions',
      icon: <span>🛡️</span>,
      available: true,
      minAmount: 50000,
      maxAmount: 100000000,
      processingTime: '2-4 hours',
      features: [
        'Blockchain-based security',
        'Multi-party escrow support',
        'Automated release conditions',
        'Smart contract integration',
        'Dispute resolution mechanism',
      ],
    },
    {
      id: 'trading',
      name: 'Commodity Trading',
      description: 'Spot and forward trading with real-time market integration',
      icon: <span>📈</span>,
      available: true,
      minAmount: 25000,
      maxAmount: 25000000,
      processingTime: 'Real-time',
      features: [
        'Real-time commodity pricing',
        'Spot and forward contracts',
        'Multi-currency trading',
        'Market analytics and insights',
        'Risk management tools',
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span>$</span>
            </div>
          </div>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>Loading Financial Services</h2>
          <p className='text-gray-600'>Preparing your financial dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-green-50'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b-2 border-green-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <div className='flex items-center space-x-6'>
              <div className='h-12 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                <span>$</span>
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
                  Financial Services
                </h1>
                <p className='text-sm text-gray-500'>
                  Advanced financial solutions for your business
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className='px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition font-medium'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Navigation Tabs */}
        <div className='mb-8'>
          <div className='bg-white rounded-xl shadow-lg p-2'>
            <nav className='flex space-x-2'>
              {['overview', 'services', 'transactions', 'analytics'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedService(tab)}
                  className={`px-6 py-3 rounded-lg font-medium text-sm capitalize transition-all ${
                    selectedService === tab
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'overview'
                    ? '🏠 Overview'
                    : tab === 'services'
                      ? '💳 Services'
                      : tab === 'transactions'
                        ? '📊 Transactions'
                        : '📈 Analytics'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedService === 'overview' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-green-100 text-sm font-medium'>KredX Credit</p>
                    <p className='text-3xl font-bold'>₹25L</p>
                    <p className='text-green-200 text-xs'>Available</p>
                  </div>
                  <span>📄</span>
                </div>
              </div>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-sm font-medium'>RazorpayX</p>
                    <p className='text-3xl font-bold'>₹18L</p>
                    <p className='text-blue-200 text-xs'>Monthly volume</p>
                  </div>
                  <span>💳</span>
                </div>
              </div>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-purple-100 text-sm font-medium'>Escrow</p>
                    <p className='text-3xl font-bold'>₹5.2L</p>
                    <p className='text-purple-200 text-xs'>Secured</p>
                  </div>
                  <span>🛡️</span>
                </div>
              </div>
              <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-orange-100 text-sm font-medium'>Trading P&L</p>
                    <p className='text-3xl font-bold'>+₹32K</p>
                    <p className='text-orange-200 text-xs'>This month</p>
                  </div>
                  <span>📈</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4'>Quick Actions</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <button
                  onClick={() => setSelectedService('services')}
                  className='p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition group'
                >
                  <span>📄</span>
                  <div className='text-sm font-medium text-gray-800'>Submit Invoice</div>
                  <div className='text-xs text-gray-500'>KredX discounting</div>
                </button>
                <button
                  onClick={() => setSelectedService('services')}
                  className='p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition group'
                >
                  <span>💳</span>
                  <div className='text-sm font-medium text-gray-800'>Make Payment</div>
                  <div className='text-xs text-gray-500'>RazorpayX banking</div>
                </button>
                <button
                  onClick={() => setSelectedService('services')}
                  className='p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition group'
                >
                  <span>🛡️</span>
                  <div className='text-sm font-medium text-gray-800'>Create Escrow</div>
                  <div className='text-xs text-gray-500'>Secure transactions</div>
                </button>
                <button
                  onClick={() => setSelectedService('services')}
                  className='p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition group'
                >
                  <span>📈</span>
                  <div className='text-sm font-medium text-gray-800'>Start Trading</div>
                  <div className='text-xs text-gray-500'>Commodity markets</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {selectedService === 'services' && (
          <div className='space-y-6'>
            {financeOptions.map(option => (
              <div
                key={option.id}
                className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-4'>
                    <div className='p-3 bg-gray-100 rounded-lg'>{option.icon}</div>
                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-gray-800 mb-2'>{option.name}</h3>
                      <p className='text-gray-600 mb-4'>{option.description}</p>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>Amount Range</p>
                          <p className='text-lg font-bold text-gray-800'>
                            ₹{option.minAmount / 1000}K - ₹{option.maxAmount / 1000000}M
                          </p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>Processing Time</p>
                          <p className='text-lg font-bold text-gray-800'>{option.processingTime}</p>
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-500'>Status</p>
                          <div className='flex items-center space-x-2'>
                            {option.available ? (
                              <span>✅</span>
                            ) : (
                              <AlertCircle className='h-5 w-5 text-red-600' />
                            )}
                            <span
                              className={`font-medium ${
                                option.available ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {option.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-500 mb-2'>Key Features</p>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                          {option.features.map((feature, index) => (
                            <div key={index} className='flex items-center space-x-2'>
                              <span>✅</span>
                              <span className='text-sm text-gray-600'>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!option.available}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      option.available
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {option.available ? 'Get Started' : 'Coming Soon'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions Tab */}
        {selectedService === 'transactions' && (
          <div className='bg-white rounded-xl shadow-lg'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-lg font-bold text-gray-800'>Transaction History</h3>
              <p className='text-sm text-gray-500'>View and manage your financial transactions</p>
            </div>
            <div className='p-6'>
              {transactions.length > 0 ? (
                <div className='space-y-4'>
                  {transactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === 'kredx'
                              ? 'bg-green-100'
                              : transaction.type === 'razorpayx'
                                ? 'bg-blue-100'
                                : 'bg-purple-100'
                          }`}
                        >
                          {transaction.type === 'kredx' ? (
                            <span>📄</span>
                          ) : transaction.type === 'razorpayx' ? (
                            <span>💳</span>
                          ) : (
                            <span>🛡️</span>
                          )}
                        </div>
                        <div>
                          <p className='font-medium text-gray-800'>
                            {transaction.type === 'kredx'
                              ? 'KredX Invoice Discounting'
                              : transaction.type === 'razorpayx'
                                ? 'RazorpayX Payment'
                                : 'Smart Escrow'}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {transaction.referenceId} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-lg font-bold text-gray-800'>
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        <div
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : transaction.status === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <PiggyBank className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No transactions yet</p>
                  <p className='text-sm text-gray-400'>
                    Start using our financial services to see transactions here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedService === 'analytics' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4'>Financial Analytics</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-500'>Credit Utilization</span>
                    <span>📈</span>
                  </div>
                  <div className='text-2xl font-bold text-gray-800'>68%</div>
                  <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                    <div className='bg-green-600 h-2 rounded-full' style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div className='p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-500'>Average Payment Time</span>
                    <AlertCircle className='h-4 w-4 text-blue-600' />
                  </div>
                  <div className='text-2xl font-bold text-gray-800'>2.3 days</div>
                  <div className='text-xs text-gray-500 mt-1'>Faster than industry average</div>
                </div>
                <div className='p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-500'>Cost Savings</span>
                    <span>$</span>
                  </div>
                  <div className='text-2xl font-bold text-gray-800'>₹45K</div>
                  <div className='text-xs text-gray-500 mt-1'>
                    This month vs traditional banking
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
