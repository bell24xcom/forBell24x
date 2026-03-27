'use client';

import React, { useState } from 'react';
import { Wallet, CreditCard, Plus, Minus, ArrowUpRight, ArrowDownLeft, History, Settings } from 'lucide-react';

// Mock data for wallet
const walletData = {
  balance: 50000,
  escrowBalance: 120000,
  totalTransactions: 156,
  monthlySpent: 85000,
  recentTransactions: [
    { id: 1, type: 'credit', amount: 25000, description: 'Payment received from SteelWorks Ltd', date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'debit', amount: 15000, description: 'RFQ payment to AutoParts Inc', date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'credit', amount: 50000, description: 'Escrow release for Order #1234', date: '2024-01-13', status: 'completed' },
    { id: 4, type: 'debit', amount: 8000, description: 'Platform fee for RFQ #5678', date: '2024-01-12', status: 'completed' },
    { id: 5, type: 'credit', amount: 30000, description: 'Refund from cancelled order', date: '2024-01-11', status: 'completed' },
  ],
  paymentMethods: [
    { id: 1, type: 'bank', name: 'HDFC Bank', account: '****1234', isDefault: true },
    { id: 2, type: 'upi', name: 'UPI ID', account: 'rajesh@paytm', isDefault: false },
    { id: 3, type: 'card', name: 'Visa Card', account: '****5678', isDefault: false },
  ]
};

const TransactionCard = ({ transaction }) => {
  const isCredit = transaction.type === 'credit';
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCredit ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isCredit ? (
            <ArrowDownLeft className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowUpRight className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">{transaction.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}₹{transaction.amount.toLocaleString()}
        </p>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

const PaymentMethodCard = ({ method }) => (
  <div className={`p-4 rounded-lg border-2 ${method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CreditCard className="w-8 h-8 text-gray-600 mr-3" />
        <div>
          <p className="text-sm font-medium text-gray-900">{method.name}</p>
          <p className="text-xs text-gray-500">{method.account}</p>
        </div>
      </div>
      {method.isDefault && (
        <span className="text-xs font-medium text-blue-600">Default</span>
      )}
    </div>
  </div>
);

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
          <p className="text-gray-600">Manage your funds, transactions, and payment methods</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Funds
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(walletData.balance)}</p>
            </div>
            <Wallet className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Escrow Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(walletData.escrowBalance)}</p>
            </div>
            <CreditCard className="w-12 h-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Monthly Spent</p>
              <p className="text-3xl font-bold">{formatCurrency(walletData.monthlySpent)}</p>
            </div>
            <History className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'transactions', name: 'Transactions' },
            { id: 'payment-methods', name: 'Payment Methods' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                Add Funds
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Transfer to Bank
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <History className="w-5 h-5 mr-2" />
                View All Transactions
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {walletData.recentTransactions.slice(0, 3).map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
              <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            <p className="text-sm text-gray-600">All your wallet transactions</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {walletData.recentTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment-methods' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add New Method
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {walletData.paymentMethods.map((method) => (
                <PaymentMethodCard key={method.id} method={method} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}