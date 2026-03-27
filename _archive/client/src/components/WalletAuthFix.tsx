'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function WalletAuthFix() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [walletData, setWalletData] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login with wallet redirect
      router.push('/auth/login?redirect=/dashboard/wallet');
      return;
    }

    if (isAuthenticated && user) {
      loadWalletData();
    }
  }, [isAuthenticated, user, loading, router]);

  const loadWalletData = async () => {
    try {
      setWalletLoading(true);
      
      // Fetch wallet data from API
      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWalletData(data);
      } else {
        throw new Error('Failed to load wallet data');
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  if (loading || walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access your wallet.</p>
          <button
            onClick={() => router.push('/auth/login?redirect=/dashboard/wallet')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <h1 className="text-2xl font-bold mb-6">Wallet & Payments</h1>
      
      {walletData ? (
        <div className="wallet-content">
          <div className="balance-card">
            <h2 className="text-lg font-semibold mb-2">Current Balance</h2>
            <p className="text-3xl font-bold text-green-600">
              ₹{walletData.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="transactions-section mt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            {walletData.transactions?.length > 0 ? (
              <div className="transactions-list">
                {walletData.transactions.map((tx: any, index: number) => (
                  <div key={index} className="transaction-item">
                    <div className="flex justify-between items-center">
                      <span>{tx.description}</span>
                      <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </div>
                    <small className="text-gray-500">{tx.date}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No transactions yet</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      )}
    </div>
  );
}
