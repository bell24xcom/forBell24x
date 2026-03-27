// app/wallet/page.tsx - Digital Wallet Services Page
'use client';

import { Wallet, CreditCard, ArrowRight, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function WalletPage() {
  const [balance] = useState(25000); // Mock balance
  const [transactions] = useState([
    { id: 1, type: 'credit', amount: 5000, description: 'Payment received from ABC Corp', date: '2025-09-10', status: 'completed' },
    { id: 2, type: 'debit', amount: 1500, description: 'Payment to XYZ Suppliers', date: '2025-09-09', status: 'completed' },
    { id: 3, type: 'credit', amount: 12000, description: 'Refund from DEF Industries', date: '2025-09-08', status: 'completed' },
    { id: 4, type: 'debit', amount: 800, description: 'Platform fee', date: '2025-09-07', status: 'completed' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Digital Wallet</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your B2B payments with our secure digital wallet. Fast, convenient, and secure transactions.
          </p>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Wallet Balance</h2>
              <p className="text-4xl font-bold">₹{balance.toLocaleString()}</p>
              <p className="text-blue-100 mt-2">Available for transactions</p>
            </div>
            <div className="text-right">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors mb-2">
                Add Money
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Add Money</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <ArrowRight className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Send Money</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <span className="font-medium">Security Settings</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <span className="font-medium">Transaction History</span>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Wallet Features */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Wallet Features</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Secure Transactions</h3>
                  <p className="text-gray-600 text-sm">Bank-level encryption and fraud protection</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Instant Transfers</h3>
                  <p className="text-gray-600 text-sm">Real-time money transfers between users</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Easy Integration</h3>
                  <p className="text-gray-600 text-sm">Seamless integration with B2B transactions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Transaction Limits</h3>
                  <p className="text-gray-600 text-sm">Flexible limits based on verification level</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                    <td className="py-3 px-4 text-gray-700">{transaction.date}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wallet Limits */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Wallet Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Daily Limit</h3>
              <p className="text-2xl font-bold text-blue-600">₹1,00,000</p>
              <p className="text-gray-600 text-sm">Per day</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Monthly Limit</h3>
              <p className="text-2xl font-bold text-blue-600">₹10,00,000</p>
              <p className="text-gray-600 text-sm">Per month</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Max Balance</h3>
              <p className="text-2xl font-bold text-blue-600">₹50,00,000</p>
              <p className="text-gray-600 text-sm">Maximum balance</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Use Digital Wallet?</h2>
            <p className="text-gray-600 mb-6">
              Start making secure and convenient B2B payments today.
            </p>
            <div className="space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Activate Wallet
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}