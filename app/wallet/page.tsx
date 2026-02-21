'use client';
import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/AuthContext';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet');
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      } else {
        setError(data.error || 'Failed to load wallet data');
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          description: depositDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add funds');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Funds added successfully!');
        setDepositAmount('');
        setDepositDescription('');
        fetchWalletData();
      } else {
        setError(data.error || 'Failed to add funds');
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
      COMPLETED: 'text-green-500',
      PENDING: 'text-yellow-500',
      FAILED: 'text-red-500',
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
              <span className="text-white">Wallet</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Wallet</h1>
          <p className="text-slate-400">
            Manage your wallet balance and transaction history
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

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Balance</h2>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(balance)}
          </div>
          <p className="text-slate-400 mt-2">
            Last updated: {formatDate(new Date())}
          </p>
        </div>

        {/* Deposit Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Funds</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (₹)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1000"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={depositDescription}
                onChange={(e) => setDepositDescription(e.target.value)}
                placeholder="Top-up for RFQ purchases"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : null}
                Add Funds
              </button>
            </div>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <span className="text-sm text-slate-400">
              Showing last 50 transactions
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-400">
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Type</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Amount</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Description</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {tx.type}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
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
