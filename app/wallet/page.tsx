'use client';
import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, IndianRupee } from 'lucide-react';
import { useSession } from '@/app/contexts/AuthContext';
import Script from 'next/script';

export const dynamic = 'force-dynamic';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useSession();

  useEffect(() => {
    if (user === null) {
      window.location.href = '/auth/phone-email';
      return;
    }
    fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        setTransactions(data.transactions || []);
      } else {
        setError(data.error || 'Failed to load wallet data');
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 1) {
      setError('Minimum deposit is ₹1');
      return;
    }
    if (amount > 500000) {
      setError('Maximum deposit is ₹5,00,000');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setError(orderData.error || 'Failed to create payment order');
        setProcessing(false);
        return;
      }

      // Step 2: Test mode — skip Razorpay popup, verify directly
      if (orderData.testMode) {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            amount,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setSuccess(`₹${amount.toLocaleString('en-IN')} added (test mode — Razorpay keys not configured)`);
          setDepositAmount('');
          fetchWalletData();
        } else {
          setError(verifyData.error || 'Failed to add funds');
        }
        setProcessing(false);
        return;
      }

      // Step 2: Live mode — open Razorpay checkout
      if (!window.Razorpay) {
        setError('Payment gateway loading. Please try again in a moment.');
        setProcessing(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Bell24h',
        description: 'Wallet Top-up',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment via dedicated verify endpoint
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(verifyData.message || 'Funds added successfully!');
              setDepositAmount('');
              fetchWalletData();
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          } catch {
            setError('Payment verification failed. Contact support if amount was deducted.');
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#2563EB' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-300">
            <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            <li><span className="text-white">Wallet</span></li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-slate-300">Manage your wallet balance and transactions</p>
        </div>

        {success && (
          <div className="bg-green-900/50 border border-green-700 rounded-lg p-4 mb-6 text-green-300">{success}</div>
        )}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300">{error}</div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-semibold">Current Balance</h2>
          </div>
          <div className="text-4xl font-bold text-white">
            {formatCurrency(balance)}
          </div>
        </div>

        {/* Add Funds */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" /> Add Funds
          </h2>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => setDepositAmount(String(amt))}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  depositAmount === String(amt)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {'\u20B9'}{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max="500000"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={processing || !depositAmount}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {processing ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2">Payments secured by Razorpay. UPI, Cards, Net Banking accepted.</p>
        </div>

        {/* Transaction History */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Transaction History</h2>
            <a href="/wallet/ledger" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              View Full Ledger →
            </a>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-400"><p>Loading transactions...</p></div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Add funds to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'CREDIT' ? 'bg-green-900/40' : 'bg-red-900/40'
                    }`}>
                      {tx.type === 'CREDIT'
                        ? <ArrowDownLeft className="w-5 h-5 text-green-400" />
                        : <ArrowUpRight className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-slate-500 text-xs">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
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
