"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Shield, TrendingUp, Globe, Rupee } from 'lucide-react';

interface WalletData {
  balance: {
    inr: number;
    usd: number;
    eur: number;
  };
  transactions: Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    currency: string;
    description: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    gateway: 'razorpay' | 'stripe';
  }>;
  escrow: {
    active: number;
    released: number;
    pending: number;
  };
}

export default function EnhancedWallet() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: {
      inr: 250000,
      usd: 3200,
      eur: 2800
    },
    transactions: [
      {
        id: 'TXN_001',
        type: 'credit',
        amount: 50000,
        currency: 'INR',
        description: 'RFQ Payment - Steel Pipes',
        date: '2024-01-15',
        status: 'completed',
        gateway: 'razorpay'
      },
      {
        id: 'TXN_002',
        type: 'debit',
        amount: 25000,
        currency: 'INR',
        description: 'Escrow Release - Electronics',
        date: '2024-01-14',
        status: 'completed',
        gateway: 'razorpay'
      },
      {
        id: 'TXN_003',
        type: 'credit',
        amount: 1500,
        currency: 'USD',
        description: 'International Payment - Machinery',
        date: '2024-01-13',
        status: 'completed',
        gateway: 'stripe'
      }
    ],
    escrow: {
      active: 125000,
      released: 75000,
      pending: 50000
    }
  });

  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = async (amount: number, currency: string) => {
    try {
      if (selectedGateway === 'razorpay') {
        // Razorpay integration for Indian payments
        const options = {
          key: 'rzp_live_mk8XL8QrrZ4rjn',
          amount: amount * 100, // Razorpay expects amount in paise
          currency: currency,
          name: 'Bell24H',
          description: 'B2B Marketplace Payment',
          handler: function (response: any) {
            console.log('Payment successful:', response);
            // Update wallet balance
            setWalletData(prev => ({
              ...prev,
              balance: {
                ...prev.balance,
                inr: prev.balance.inr + amount
              }
            }));
          },
          prefill: {
            name: 'Buyer Name',
            email: 'buyer@example.com',
            contact: '+91 9999999999'
          },
          theme: {
            color: '#2563eb'
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Stripe integration for international payments
        console.log('Stripe payment flow for international transactions');
        // Implement Stripe payment flow
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const getGatewayIcon = (gateway: string) => {
    return gateway === 'razorpay' ? <Rupee className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Wallet Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enhanced Wallet</h2>
            <p className="text-gray-600">Dual Gateway: Razorpay (India) + Stripe (Global)</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedGateway('razorpay')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGateway === 'razorpay'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Rupee className="h-4 w-4 inline mr-2" />
              Razorpay (India)
            </button>
            <button
              onClick={() => setSelectedGateway('stripe')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGateway === 'stripe'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Globe className="h-4 w-4 inline mr-2" />
              Stripe (Global)
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">INR Balance</p>
                <p className="text-2xl font-bold">₹{walletData.balance.inr.toLocaleString()}</p>
              </div>
              <Rupee className="h-8 w-8 text-blue-200" />
            </div>
            <p className="text-blue-100 text-sm mt-2">Razorpay Gateway</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">USD Balance</p>
                <p className="text-2xl font-bold">${walletData.balance.usd.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
            <p className="text-green-100 text-sm mt-2">Stripe Gateway</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">EUR Balance</p>
                <p className="text-2xl font-bold">€{walletData.balance.eur.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
            <p className="text-purple-100 text-sm mt-2">International</p>
          </div>
        </div>

        {/* Escrow Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Escrow Protection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">₹{walletData.escrow.active.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Active Escrow</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{walletData.escrow.released.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Released</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">₹{walletData.escrow.pending.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handlePayment(10000, 'INR')}
            className="flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-blue-600 font-medium">Add ₹10,000 (Razorpay)</span>
          </button>
          <button
            onClick={() => handlePayment(500, 'USD')}
            className="flex items-center justify-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-green-600 font-medium">Add $500 (Stripe)</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {walletData.transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-4">
                {getGatewayIcon(transaction.gateway)}
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}{transaction.currency} {transaction.amount.toLocaleString()}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Features */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Rupee className="h-4 w-4 mr-2" />
              Razorpay (India)
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• UPI Compliance</li>
              <li>• GST Integration</li>
              <li>• Business Accounts</li>
              <li>• Milestone Escrow</li>
              <li>• NetBanking & Cards</li>
            </ul>
          </div>
          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Stripe (Global)
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Multi-Currency Support</li>
              <li>• Cross-Border Payments</li>
              <li>• International Compliance</li>
              <li>• Advanced Analytics</li>
              <li>• Digital Wallets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
