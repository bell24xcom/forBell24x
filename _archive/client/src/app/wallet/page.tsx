'use client';

import React, { useState } from 'react';
import { Wallet, Shield, Clock, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownLeft, Eye, Lock, Unlock, CreditCard, Download } from 'lucide-react';

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
  counterparty?: string;
}

interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  status: 'initiated' | 'funded' | 'disputed' | 'released' | 'refunded';
  createdAt: string;
  milestones: Array<{
    id: string;
    description: string;
    amount: number;
    status: 'pending' | 'completed' | 'disputed';
    completedAt?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    uploadedBy: 'buyer' | 'seller';
  }>;
}

export default function WalletEscrowSystem() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [walletBalance, setWalletBalance] = useState(2850000); // ₹28.5L
  const [escrowBalance, setEscrowBalance] = useState(1200000); // ₹12L

  // Sample wallet transactions
  const walletTransactions: WalletTransaction[] = [
    {
      id: 'TXN001',
      type: 'credit',
      amount: 500000,
      description: 'Payment received from Reliance Industries',
      timestamp: '2025-07-28 14:30:00',
      status: 'completed',
      orderId: 'ORD-2025-101',
      counterparty: 'Reliance Industries Ltd'
    },
    {
      id: 'TXN002',
      type: 'escrow_hold',
      amount: 1200000,
      description: 'Escrow hold for Steel Bars Order',
      timestamp: '2025-07-27 11:15:00',
      status: 'completed',
      orderId: 'ORD-2025-102',
      counterparty: 'Maharashtra Steel Industries'
    },
    {
      id: 'TXN003',
      type: 'debit',
      amount: 300000,
      description: 'Payment to Tata Steel Ltd',
      timestamp: '2025-07-26 16:45:00',
      status: 'completed',
      orderId: 'ORD-2025-099',
      counterparty: 'Tata Steel Ltd'
    }
  ];

  // Sample escrow transactions
  const escrowTransactions: EscrowTransaction[] = [
    {
      id: 'ESC001',
      orderId: 'ORD-2025-102',
      buyerName: 'Mumbai Constructions Pvt Ltd',
      sellerName: 'Maharashtra Steel Industries',
      amount: 1200000,
      status: 'funded',
      createdAt: '2025-07-27 11:15:00',
      milestones: [
        {
          id: 'MS001',
          description: 'Material Dispatch Confirmation',
          amount: 600000,
          status: 'completed',
          completedAt: '2025-07-28 09:30:00'
        },
        {
          id: 'MS002',
          description: 'Delivery & Quality Verification',
          amount: 600000,
          status: 'pending'
        }
      ],
      documents: [
        {
          id: 'DOC001',
          name: 'Purchase Order.pdf',
          type: 'purchase_order',
          uploadedAt: '2025-07-27 11:20:00',
          uploadedBy: 'buyer'
        },
        {
          id: 'DOC002',
          name: 'Dispatch Certificate.pdf',
          type: 'dispatch_document',
          uploadedAt: '2025-07-28 09:30:00',
          uploadedBy: 'seller'
        }
      ]
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'debit': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'escrow_hold': return <Lock className="w-5 h-5 text-orange-600" />;
      case 'escrow_release': return <Unlock className="w-5 h-5 text-blue-600" />;
      default: return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'funded': return 'text-blue-600 bg-blue-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      case 'released': return 'text-green-600 bg-green-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Manage your digital wallet and high-value escrow transactions</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Wallet Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8" />
                <span className="text-lg font-semibold">Digital Wallet</span>
              </div>
              <button className="text-white/80 hover:text-white">
                <Eye className="w-5 h-5" />
              </button>
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(walletBalance)}</div>
            <div className="text-blue-100 text-sm">Available Balance</div>
          </div>

          {/* Escrow Balance */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <span className="text-lg font-semibold">Escrow Holdings</span>
              </div>
              <button className="text-white/80 hover:text-white">
                <Eye className="w-5 h-5" />
              </button>
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(escrowBalance)}</div>
            <div className="text-orange-100 text-sm">In Escrow</div>
          </div>

          {/* Total Portfolio */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8" />
                <span className="text-lg font-semibold">Total Portfolio</span>
              </div>
              <button className="text-white/80 hover:text-white">
                <Download className="w-5 h-5" />
              </button>
            </div>
            <div className="text-3xl font-bold mb-2">{formatCurrency(walletBalance + escrowBalance)}</div>
            <div className="text-green-100 text-sm">Combined Value</div>
          </div>
        </div>

        {/* High Value Transaction Alert */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-1">High-Value Transaction Protection</h3>
              <p className="text-purple-700 text-sm">
                All transactions above ₹5 Lakhs are automatically protected with escrow services and enhanced security protocols.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">₹5L+</div>
              <div className="text-xs text-purple-600">Auto Escrow</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'wallet', label: 'Wallet', icon: '💰' },
                { id: 'escrow', label: 'Escrow Transactions', icon: '🛡️' },
                { id: 'compliance', label: 'Compliance', icon: '📋' },
                { id: 'analytics', label: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid md:grid-cols-4 gap-4">
                  <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-all text-center">
                    <div className="text-xl mb-2">💳</div>
                    <div className="font-semibold">Add Money</div>
                  </button>
                  <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-all text-center">
                    <div className="text-xl mb-2">📤</div>
                    <div className="font-semibold">Send Money</div>
                  </button>
                  <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-all text-center">
                    <div className="text-xl mb-2">🏦</div>
                    <div className="font-semibold">Bank Transfer</div>
                  </button>
                  <button className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-all text-center">
                    <div className="text-xl mb-2">📊</div>
                    <div className="font-semibold">Statements</div>
                  </button>
                </div>

                {/* Recent Transactions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Recent Transactions</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
                  </div>

                  <div className="space-y-3">
                    {walletTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <div className="font-semibold">{transaction.description}</div>
                            <div className="text-sm text-gray-600">
                              {transaction.counterparty} • {transaction.timestamp}
                            </div>
                            {transaction.orderId && (
                              <div className="text-xs text-blue-600">Order: {transaction.orderId}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-semibold text-lg ${
                            transaction.type === 'credit' ? 'text-green-600' : 
                            transaction.type === 'debit' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                            {transaction.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'escrow' && (
              <div className="space-y-6">
                {/* Escrow Overview */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">Active Escrows</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">₹12L</div>
                    <div className="text-sm text-gray-600">Total in Escrow</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">24hr</div>
                    <div className="text-sm text-gray-600">Avg Resolution</div>
                  </div>
                </div>

                {/* Active Escrow Transactions */}
                <div className="space-y-4">
                  {escrowTransactions.map((escrow) => (
                    <div key={escrow.id} className="border rounded-lg p-6 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">Order {escrow.orderId}</div>
                            <div className="text-sm text-gray-600">
                              {escrow.buyerName} ↔ {escrow.sellerName}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-xl">{formatCurrency(escrow.amount)}</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(escrow.status)}`}>
                            {escrow.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3">Payment Milestones</h4>
                        <div className="space-y-3">
                          {escrow.milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                milestone.status === 'completed' ? 'bg-green-100' :
                                milestone.status === 'disputed' ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : milestone.status === 'disputed' ? (
                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{milestone.description}</div>
                                <div className="text-sm text-gray-600">{formatCurrency(milestone.amount)}</div>
                                {milestone.completedAt && (
                                  <div className="text-xs text-green-600">Completed: {milestone.completedAt}</div>
                                )}
                              </div>
                              {milestone.status === 'pending' && (
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm">
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3">Transaction Documents</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {escrow.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <Download className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{doc.name}</div>
                                <div className="text-xs text-gray-600">
                                  By {doc.uploadedBy} • {doc.uploadedAt}
                                </div>
                              </div>
                              <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all">
                          Release Funds
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                          Raise Dispute
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-6">
                {/* KYC Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-bold text-green-800">KYC Verified</h3>
                      <p className="text-green-700 text-sm">Your account is fully verified for high-value transactions</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Identity Verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Business Registration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Bank Account Verification</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Limits */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Transaction Limits</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-semibold">Daily Transaction Limit</div>
                        <div className="text-sm text-gray-600">Maximum transactions per day</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-xl">₹1 Crore</div>
                        <div className="text-sm text-blue-600">Verified Account</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                      <div>
                        <div className="font-semibold">Escrow Threshold</div>
                        <div className="text-sm text-gray-600">Auto-escrow activation amount</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-xl">₹5 Lakhs</div>
                        <div className="text-sm text-orange-600">Automatic Protection</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Documents */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Compliance Documents</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">GST Certificate</div>
                      <div className="text-sm text-gray-600 mb-3">Valid until: Dec 2025</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">PAN Card</div>
                      <div className="text-sm text-gray-600 mb-3">Business PAN verified</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">Bank Statement</div>
                      <div className="text-sm text-gray-600 mb-3">Last updated: July 2025</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Update</button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">Trade License</div>
                      <div className="text-sm text-gray-600 mb-3">Valid license on file</div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Renew</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
