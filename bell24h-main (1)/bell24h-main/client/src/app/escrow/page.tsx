'use client';
import { AlertTriangle, Unlock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface EscrowTransaction {
  id: string;
  transactionId: string;
  buyer: string;
  seller: string;
  amount: number;
  currency: string;
  status: 'funded' | 'in_progress' | 'disputed' | 'released' | 'cancelled';
  createdAt: string;
  expectedDelivery: string;
  description: string;
  disputeWindow: number; // hours remaining
  autoReleaseDate: string;
  termsAccepted: boolean;
  documents: string[];
}

export default function EscrowPage() {
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([
    {
      id: 'ESC-001',
      transactionId: 'ESC-2024-001',
      buyer: 'Manufacturing Co Ltd',
      seller: 'TechCorp Industries',
      amount: 150000,
      currency: 'INR',
      status: 'funded',
      createdAt: '2024-01-15T10:30:00Z',
      expectedDelivery: '2024-02-15T10:30:00Z',
      description: 'Industrial machinery parts order',
      disputeWindow: 48,
      autoReleaseDate: '2024-01-22T10:30:00Z',
      termsAccepted: true,
      documents: ['invoice.pdf', 'purchase_order.pdf'],
    },
    {
      id: 'ESC-002',
      transactionId: 'ESC-2024-002',
      buyer: 'Agri Business Ltd',
      seller: 'AgriSolutions Ltd',
      amount: 75000,
      currency: 'INR',
      status: 'in_progress',
      createdAt: '2024-01-14T15:45:00Z',
      expectedDelivery: '2024-02-10T15:45:00Z',
      description: 'Agricultural equipment supply',
      disputeWindow: 24,
      autoReleaseDate: '2024-01-21T15:45:00Z',
      termsAccepted: true,
      documents: ['contract.pdf', 'specifications.pdf'],
    },
    {
      id: 'ESC-003',
      transactionId: 'ESC-2024-003',
      buyer: 'Global Corp',
      seller: 'International Suppliers',
      amount: 5000,
      currency: 'USD',
      status: 'disputed',
      createdAt: '2024-01-13T09:20:00Z',
      expectedDelivery: '2024-02-05T09:20:00Z',
      description: 'Cross-border electronics order',
      disputeWindow: 0,
      autoReleaseDate: '2024-01-20T09:20:00Z',
      termsAccepted: true,
      documents: ['invoice.pdf', 'dispute_form.pdf'],
    },
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return `${symbols[currency as keyof typeof symbols]}${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'disputed':
        return 'text-red-600 bg-red-100';
      case 'released':
        return 'text-purple-600 bg-purple-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'funded':
        return <span>🛡️</span>;
      case 'in_progress':
        return <span>🕐</span>;
      case 'disputed':
        return <AlertTriangle className='h-5 w-5' />;
      case 'released':
        return <span>✅</span>;
      case 'cancelled':
        return <AlertCircle className='h-5 w-5' />;
      default:
        return <span>🕐</span>;
    }
  };

  const handleReleaseFunds = async (transactionId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setEscrowTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, status: 'released' as const } : t))
    );
    setIsLoading(false);
  };

  const handleDispute = async (transactionId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setEscrowTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, status: 'disputed' as const } : t))
    );
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const totalAmount = escrowTransactions.reduce((sum, t) => sum + t.amount, 0);
  const activeTransactions = escrowTransactions.filter(
    t => t.status === 'funded' || t.status === 'in_progress'
  ).length;
  const disputedTransactions = escrowTransactions.filter(t => t.status === 'disputed').length;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Escrow Management</h1>
              <p className='text-gray-600 mt-1'>Secure transactions for ₹5 lakh+ orders</p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className='p-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>🔄</span>
              </button>
              <button className='p-2 text-gray-600 hover:text-blue-600 transition-colors'>
                <span>📊</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-3'>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Total Escrow Amount</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {showBalance ? formatCurrency(totalAmount, 'INR') : '••••••••'}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <span>$</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Active Transactions</p>
                    <p className='text-2xl font-bold text-gray-900'>{activeTransactions}</p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <span>🛡️</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Disputed Transactions</p>
                    <p className='text-2xl font-bold text-gray-900'>{disputedTransactions}</p>
                  </div>
                  <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                    <AlertTriangle className='h-6 w-6 text-red-600' />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className='bg-white rounded-xl shadow-sm'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-gray-900'>Escrow Transactions</h2>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    {showBalance ? <span>👁️</span> : <span>👁️</span>}
                  </button>
                </div>
              </div>

              <div className='divide-y divide-gray-200'>
                {escrowTransactions.map(transaction => (
                  <div key={transaction.id} className='p-6 hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>{transaction.description}</h3>
                          <p className='text-sm text-gray-500'>
                            {transaction.buyer} → {transaction.seller}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Created: {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className='text-right'>
                        <p className='text-lg font-semibold text-gray-900'>
                          {showBalance
                            ? formatCurrency(transaction.amount, transaction.currency)
                            : '••••••••'}
                        </p>
                        <div className='flex items-center space-x-2 mt-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status.replace('_', ' ')}
                          </span>
                          {transaction.disputeWindow > 0 && (
                            <span className='text-xs text-gray-500'>
                              {transaction.disputeWindow}h dispute window
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                      <div className='flex items-center space-x-4'>
                        <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                          View Details
                        </button>
                        <button className='text-sm text-gray-600 hover:text-gray-700'>
                          Download Documents
                        </button>
                      </div>

                      <div className='flex items-center space-x-2'>
                        {transaction.status === 'funded' && (
                          <>
                            <button
                              onClick={() => handleReleaseFunds(transaction.id)}
                              disabled={isLoading}
                              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2'
                            >
                              <Unlock className='h-4 w-4' />
                              <span>Release Funds</span>
                            </button>
                            <button
                              onClick={() => handleDispute(transaction.id)}
                              disabled={isLoading}
                              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2'
                            >
                              <AlertTriangle className='h-4 w-4' />
                              <span>Dispute</span>
                            </button>
                          </>
                        )}
                        {transaction.status === 'disputed' && (
                          <button className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
                            Resolve Dispute
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Escrow Info */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>Escrow Information</h3>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <span>🛡️</span>
                  <div>
                    <div className='font-medium'>₹5L+ Transactions Only</div>
                    <div className='text-sm text-gray-500'>Escrow activated automatically</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>🕐</span>
                  <div>
                    <div className='font-medium'>48-Hour Dispute Window</div>
                    <div className='text-sm text-gray-500'>Time to raise concerns</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>📅</span>
                  <div>
                    <div className='font-medium'>7-Day Auto Release</div>
                    <div className='text-sm text-gray-500'>If no disputes raised</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
              <div className='space-y-3'>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span>📄</span>
                    <span className='font-medium'>Terms & Conditions</span>
                  </div>
                  <span>→</span>
                </button>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span>⬇️</span>
                    <span className='font-medium'>Download Reports</span>
                  </div>
                  <span>→</span>
                </button>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span>👤</span>
                    <span className='font-medium'>Support Team</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Compliance Status */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>Compliance Status</h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>RBI Compliant</div>
                    <div className='text-sm text-gray-500'>Payment regulations</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>FEMA Compliant</div>
                    <div className='text-sm text-gray-500'>Foreign exchange</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>PCI DSS Certified</div>
                    <div className='text-sm text-gray-500'>Data security</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
