'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-900/40',
  COMPLETED: 'text-green-400 bg-green-900/40',
  REFUNDED: 'text-blue-400 bg-blue-900/40',
  FAILED: 'text-red-400 bg-red-900/40',
};

export default function EscrowPage() {
  const router = useRouter();
  const [escrows, setEscrows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [releaseAction, setReleaseAction] = useState('');

  useEffect(() => {
    fetchEscrowData();
  }, []);

  const fetchEscrowData = async () => {
    try {
      const response = await fetch('/api/escrow', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setEscrows(data.escrows || []);
      } else if (response.status === 401) {
        setError('Please login to view escrow transactions');
      } else {
        // Don't show error for empty state
        setEscrows([]);
      }
    } catch (err) {
      console.error('Error fetching escrow data:', err);
      setEscrows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async (escrowId: string, action: string) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this escrow?`)) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/escrow', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          escrowId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process escrow action');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(`Escrow ${action.toLowerCase()} successfully!`);
        fetchEscrowData();
      } else {
        setError(data.error || 'Failed to process escrow action');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      HELD: 'text-yellow-500',
      RELEASED: 'text-green-500',
      REFUNDED: 'text-red-500',
    };
    return colors[status] || 'text-slate-400';
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm transition-colors"
        >
          ← Back
        </button>

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-300">
            <li>
              <a href="/dashboard" className="hover:text-white">Dashboard</a>
            </li>
            <li>
              <span className="text-white">Escrow</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Escrow</h1>
          <p className="text-slate-300">
            Manage your escrow transactions for secure payments
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-900/50 rounded-lg p-4 mb-6 text-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Escrow List */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Escrow Transactions</h2>
            <span className="text-sm text-gray-400">
              Showing all escrow transactions
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-300">
              <p>Loading escrow transactions...</p>
            </div>
          ) : escrows.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-white font-semibold mb-2">No Escrow Transactions</p>
              <p className="text-gray-400 text-sm mb-4">Secure escrow payments will appear here once you complete a deal</p>
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-amber-400 text-sm">Razorpay escrow integration coming soon</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Quote</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Buyer</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Supplier</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {escrows.map((escrow: any) => (
                    <tr key={escrow.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-white">
                        <div className="font-medium">{escrow.quote.rfq.title}</div>
                        <div className="text-xs text-gray-400">
                          #{escrow.quote.rfqId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        <div className="font-medium">{escrow.buyer.company}</div>
                        <div className="text-xs text-gray-400">
                          {escrow.buyer.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        <div className="font-medium">{escrow.supplier.company}</div>
                        <div className="text-xs text-gray-400">
                          {escrow.supplier.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        {formatCurrency(escrow.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`font-medium ${getStatusColor(escrow.status)}`}>
                          {escrow.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {escrow.status === 'HELD' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRelease(escrow.id, 'RELEASE')}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {isLoading ? (
                                <svg className="animate-spin h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : null}
                              Release
                            </button>
                            <button
                              onClick={() => handleRelease(escrow.id, 'REFUND')}
                              disabled={isLoading}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {isLoading ? (
                                <svg className="animate-spin h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : null}
                              Refund
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
