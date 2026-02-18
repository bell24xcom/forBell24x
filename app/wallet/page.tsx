'use client';
import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';

interface WalletTxn {
  id: string;
  type: string;
  amount: number;
  description: string;
  reference: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState('INR');
  const [transactions, setTransactions] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  async function fetchWallet() {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success) {
        setBalance(data.wallet.balance);
        setCurrency(data.wallet.currency);
        setTransactions(data.wallet.transactions || []);
      }
    } catch {
      setError('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setDepositing(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(depositAmount), description: 'Manual deposit' }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setDepositAmount('');
        fetchWallet();
      } else {
        setError(data.error || 'Deposit failed');
      }
    } catch {
      setError('Deposit failed');
    } finally {
      setDepositing(false);
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">My Wallet</h1>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-7 h-7" />
            <span className="text-lg font-semibold">Available Balance</span>
          </div>
          {loading ? (
            <div className="text-3xl font-bold animate-pulse">Loading…</div>
          ) : (
            <div className="text-4xl font-bold">{fmt(balance)}</div>
          )}
          <div className="text-indigo-200 text-sm mt-1">{currency}</div>
        </div>

        {/* Deposit form */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Funds
          </h2>
          <form onSubmit={handleDeposit} className="flex gap-3">
            <input
              type="number"
              placeholder="Amount (₹)"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              min="1"
            />
            <button
              type="submit"
              disabled={depositing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2 rounded-lg font-medium transition-colors"
            >
              {depositing ? 'Processing…' : 'Deposit'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Transaction history */}
        <div className="bg-slate-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : transactions.length === 0 ? (
            <p className="text-slate-400 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      txn.type === 'credit' ? 'bg-green-900' : 'bg-red-900'
                    }`}>
                      {txn.type === 'credit'
                        ? <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{txn.description || txn.type}</div>
                      <div className="text-slate-400 text-xs">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${txn.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{fmt(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
