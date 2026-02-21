'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  Info,
} from 'lucide-react';

interface DashboardStats {
  totalEarned: number;
  totalSpent: number;
}

type TransactionType = 'credit' | 'debit' | 'escrow_hold' | 'escrow_release';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: string;
  status: TransactionStatus;
  orderId?: string;
  counterparty?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === 'credit' || tx.type === 'escrow_release';

  const statusClasses: Record<TransactionStatus, string> = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };

  const typeLabel: Record<TransactionType, string> = {
    credit: 'Credit',
    debit: 'Debit',
    escrow_hold: 'Escrow Hold',
    escrow_release: 'Escrow Release',
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <span className="text-sm text-gray-500">{formatDateTime(tx.timestamp)}</span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-gray-900">{tx.description}</p>
        {tx.counterparty && (
          <p className="text-xs text-gray-500 mt-0.5">{tx.counterparty}</p>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}
        >
          {isCredit ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          {isCredit ? (
            <ArrowDownLeft className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-red-500" />
          )}
          <span className="text-xs text-gray-600">{typeLabel[tx.type]}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusClasses[tx.status]}`}
        >
          {tx.status}
        </span>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

const PLACEHOLDER_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-1',
    type: 'credit',
    amount: 50000,
    description: 'Payment received for RFQ #001',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    counterparty: 'Demo Supplier Pvt Ltd',
  },
  {
    id: 'demo-2',
    type: 'debit',
    amount: 15000,
    description: 'Platform subscription fee',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
  },
];

export default function WalletPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [addingFunds, setAddingFunds] = useState(false);
  const [addFundsError, setAddFundsError] = useState<string | null>(null);
  const [showWithdrawTooltip, setShowWithdrawTooltip] = useState(false);

  const balance = stats ? Math.max(0, stats.totalEarned - stats.totalSpent) : 0;

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to load balance');
      setStats({ totalEarned: data.stats.totalEarned, totalSpent: data.stats.totalSpent });
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Failed to load balance');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTxns(true);
    try {
      const res = await fetch('/api/payment/personal', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.transactions)) {
          setTransactions(data.transactions as Transaction[]);
          return;
        }
      }
      // Fall back to placeholder data if endpoint not yet returning transaction list
      setTransactions(PLACEHOLDER_TRANSACTIONS);
    } catch {
      setTransactions(PLACEHOLDER_TRANSACTIONS);
    } finally {
      setLoadingTxns(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [fetchStats, fetchTransactions]);

  const handleAddFunds = async () => {
    setAddingFunds(true);
    setAddFundsError(null);
    try {
      const amount = 100000; // ₹1,000 default – in paise for Razorpay

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          description: 'Wallet top-up — Bell24h',
          customerName: 'Bell24h User',
          customerEmail: '',
          customerPhone: '',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to create payment order');

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay could not be loaded. Check your internet connection.');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'Bell24h',
        description: 'Wallet Top-up',
        order_id: data.data.id,
        theme: { color: '#2563EB' },
        handler: () => {
          // On success, refresh stats and transactions
          fetchStats();
          fetchTransactions();
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setAddFundsError(err instanceof Error ? err.message : 'Failed to open payment');
    } finally {
      setAddingFunds(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">Wallet</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your balance and transaction history</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 text-blue-200" />
            <span className="text-blue-100 text-sm font-medium">Available Balance</span>
          </div>
          {loadingStats ? (
            <div className="h-10 w-40 bg-blue-500 animate-pulse rounded-lg" />
          ) : statsError ? (
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{statsError}</span>
            </div>
          ) : (
            <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Add Funds */}
            <button
              onClick={handleAddFunds}
              disabled={addingFunds}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {addingFunds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Funds
            </button>

            {/* Withdraw — Coming Soon */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowWithdrawTooltip(true)}
                onMouseLeave={() => setShowWithdrawTooltip(false)}
                onFocus={() => setShowWithdrawTooltip(true)}
                onBlur={() => setShowWithdrawTooltip(false)}
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-lg cursor-not-allowed opacity-60"
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
              {showWithdrawTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-10">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-yellow-400" />
                    Coming soon
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>

            <button
              onClick={() => { fetchStats(); fetchTransactions(); }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {addFundsError && (
            <p className="mt-3 text-red-300 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {addFundsError}
            </p>
          )}
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Earned</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalEarned)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Description', 'Amount', 'Type', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {loadingTxns && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}
                {!loadingTxns && transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No transactions yet</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loadingTxns && transactions.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
