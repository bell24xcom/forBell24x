'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Settings,
  RefreshCw,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';

// Mock payment gateway data
const mockPaymentData = {
  gateways: [
    {
      id: 'razorpay',
      name: 'Razorpay',
      status: 'active',
      type: 'domestic',
      region: 'India',
      transactions: 1247,
      successRate: 98.5,
      averageAmount: 25000,
      totalVolume: 31175000,
      fees: 2.0,
      lastSync: '2024-09-28T10:30:00Z',
      apiKey: 'rzp_test_***',
      webhookUrl: 'https://bell24h.com/api/webhooks/razorpay',
      supportedMethods: ['card', 'netbanking', 'upi', 'wallet'],
    },
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'active',
      type: 'international',
      region: 'Global',
      transactions: 892,
      successRate: 97.8,
      averageAmount: 45000,
      totalVolume: 40140000,
      fees: 2.9,
      lastSync: '2024-09-28T09:15:00Z',
      apiKey: 'sk_test_***',
      webhookUrl: 'https://bell24h.com/api/webhooks/stripe',
      supportedMethods: ['card', 'bank_transfer', 'sepa', 'ideal'],
    },
    {
      id: 'payu',
      name: 'PayU',
      status: 'inactive',
      type: 'domestic',
      region: 'India',
      transactions: 0,
      successRate: 0,
      averageAmount: 0,
      totalVolume: 0,
      fees: 1.8,
      lastSync: '2024-09-20T14:20:00Z',
      apiKey: 'payu_***',
      webhookUrl: 'https://bell24h.com/api/webhooks/payu',
      supportedMethods: ['card', 'netbanking', 'upi'],
    },
  ],
  transactions: [
    {
      id: 'TXN-001',
      gateway: 'Razorpay',
      amount: 50000,
      currency: 'INR',
      status: 'success',
      method: 'UPI',
      customer: 'SteelWorks Ltd',
      timestamp: '2024-09-28T10:30:00Z',
      fees: 1000,
      netAmount: 49000,
      reference: 'rzp_123456789',
    },
    {
      id: 'TXN-002',
      gateway: 'Stripe',
      amount: 75000,
      currency: 'USD',
      status: 'success',
      method: 'Card',
      customer: 'AutoParts Inc',
      timestamp: '2024-09-27T15:45:00Z',
      fees: 2175,
      netAmount: 72825,
      reference: 'pi_123456789',
    },
    {
      id: 'TXN-003',
      gateway: 'Razorpay',
      amount: 25000,
      currency: 'INR',
      status: 'failed',
      method: 'Net Banking',
      customer: 'TechSolutions',
      timestamp: '2024-09-26T11:20:00Z',
      fees: 0,
      netAmount: 0,
      reference: 'rzp_987654321',
    },
  ],
  stats: {
    totalGateways: 3,
    activeGateways: 2,
    totalTransactions: 2139,
    totalVolume: 71315000,
    averageSuccessRate: 98.15,
    totalFees: 1250000,
    averageTransactionValue: 33300,
  },
};

export default function PaymentGatewaysPage() {
  const [activeTab, setActiveTab] = useState('gateways');
  const [data, setData] = useState(mockPaymentData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGateway, setSelectedGateway] = useState<any>(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Zap className="w-4 h-4" />;
      case 'netbanking':
        return <Shield className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const filteredGateways = data.gateways.filter(gateway => {
    const matchesSearch = gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gateway.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || gateway.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Gateways</h1>
          <p className="text-gray-600 mt-2">Configure and monitor global payment gateways for transactions</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Add Gateway
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gateways</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalGateways}</p>
              <p className="text-sm text-green-600">{data.stats.activeGateways} Active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.stats.totalVolume.toLocaleString()}</p>
              <p className="text-sm text-gray-600">All time</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.averageSuccessRate}%</p>
              <p className="text-sm text-green-600">Average across gateways</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.stats.totalFees.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Processing fees</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'gateways', name: 'Gateways' },
              { id: 'transactions', name: 'Transactions' },
              { id: 'analytics', name: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

        <div className="p-6">
          {/* Gateways Tab */}
          {activeTab === 'gateways' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search gateways, regions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Gateways Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGateways.map((gateway) => (
                  <div key={gateway.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{gateway.name}</h3>
                          <p className="text-sm text-gray-600">{gateway.region} • {gateway.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(gateway.status)}`}>
                        {getStatusIcon(gateway.status)}
                        <span className="ml-1">{gateway.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions</span>
                        <span className="font-medium">{gateway.transactions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-medium text-green-600">{gateway.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Volume</span>
                        <span className="font-medium">₹{gateway.totalVolume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fees</span>
                        <span className="font-medium">{gateway.fees}%</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Supported Methods</p>
                      <div className="flex flex-wrap gap-1">
                        {gateway.supportedMethods.map((method, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedGateway(gateway)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sync
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 font-mono">{transaction.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.gateway}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.currency} {transaction.amount.toLocaleString()}
                          </span>
                          <p className="text-xs text-gray-500">
                            Fee: {transaction.currency} {transaction.fees.toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMethodIcon(transaction.method)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{transaction.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{transaction.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.customer}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Gateway Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razorpay</span>
                      <span className="font-medium">98.5% success</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stripe</span>
                      <span className="font-medium">97.8% success</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PayU</span>
                      <span className="font-medium">Inactive</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">UPI</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Banking</span>
                      <span className="font-medium">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gateway Configuration Modal */}
      {selectedGateway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Configure {selectedGateway.name}</h3>
              <button 
                onClick={() => setSelectedGateway(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">API Key</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedGateway.apiKey}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Webhook URL</label>
                  <p className="text-sm text-gray-900">{selectedGateway.webhookUrl}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-sm text-gray-900">{selectedGateway.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Sync</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedGateway.lastSync).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Supported Payment Methods</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGateway.supportedMethods.map((method, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
