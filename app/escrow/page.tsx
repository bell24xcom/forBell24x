'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/AuthContext';

export default function EscrowPage() {
  const [escrows, setEscrows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [releaseAction, setReleaseAction] = useState('');
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    fetchEscrowData();
  }, []);

  const fetchEscrowData = async () => {
    try {
      const response = await fetch('/api/escrow');
      const data = await response.json();
      if (data.success) {
        setEscrows(data.escrows);
      } else {
        setError(data.error || 'Failed to load escrow data');
      }
    } catch (err) {
      console.error('Error fetching escrow data:', err);
      setError('Failed to load escrow data');
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
    return colors[status] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-400">
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
          <p className="text-slate-400">
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Escrow Transactions</h2>
            <span className="text-sm text-slate-400">
              Showing all escrow transactions
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-400">
              <p>Loading escrow transactions...</p>
            </div>
          ) : escrows.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No escrow transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Quote</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Buyer</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Supplier</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Amount</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Status</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {escrows.map((escrow: any) => (
                    <tr key={escrow.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900">
                        <div className="font-medium">{escrow.quote.rfq.title}</div>
                        <div className="text-xs text-slate-400">
                          #{escrow.quote.rfqId}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        <div className="font-medium">{escrow.buyer.company}</div>
                        <div className="text-xs text-slate-400">
                          {escrow.buyer.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        <div className="font-medium">{escrow.supplier.company}</div>
                        <div className="text-xs text-slate-400">
                          {escrow.supplier.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
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