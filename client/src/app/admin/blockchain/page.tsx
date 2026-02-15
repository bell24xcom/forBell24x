'use client';

import React, { useState, useEffect } from 'react';
import {
  Link,
  Shield,
  Activity,
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
  Database,
  Zap,
  Globe,
  BarChart3,
  DollarSign,
  Users,
} from 'lucide-react';

// Mock blockchain data
const mockBlockchainData = {
  networks: [
    {
      id: 'polygon-mainnet',
      name: 'Polygon Mainnet',
      status: 'active',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com',
      blockHeight: 45678912,
      gasPrice: 30,
      lastBlock: '2024-09-28T10:30:00Z',
      transactions: 1247,
      successRate: 99.2,
      averageGasUsed: 21000,
    },
    {
      id: 'polygon-testnet',
      name: 'Polygon Mumbai',
      status: 'active',
      chainId: 80001,
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      blockHeight: 34567890,
      gasPrice: 1,
      lastBlock: '2024-09-28T10:25:00Z',
      transactions: 892,
      successRate: 98.8,
      averageGasUsed: 25000,
    },
    {
      id: 'ethereum-mainnet',
      name: 'Ethereum Mainnet',
      status: 'inactive',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/***',
      blockHeight: 0,
      gasPrice: 0,
      lastBlock: null,
      transactions: 0,
      successRate: 0,
      averageGasUsed: 0,
    },
  ],
  contracts: [
    {
      id: 'contract-001',
      name: 'BELL Token',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      network: 'Polygon Mainnet',
      type: 'ERC-20',
      status: 'active',
      balance: 1000000,
      totalSupply: 10000000,
      decimals: 18,
      lastInteraction: '2024-09-28T10:30:00Z',
      gasUsed: 150000,
    },
    {
      id: 'contract-002',
      name: 'BELL Escrow',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      network: 'Polygon Mainnet',
      type: 'Smart Contract',
      status: 'active',
      balance: 2500000,
      totalSupply: 0,
      decimals: 0,
      lastInteraction: '2024-09-28T09:15:00Z',
      gasUsed: 300000,
    },
    {
      id: 'contract-003',
      name: 'BELL Marketplace',
      address: '0x9876543210fedcba9876543210fedcba98765432',
      network: 'Polygon Mumbai',
      type: 'Smart Contract',
      status: 'testing',
      balance: 50000,
      totalSupply: 0,
      decimals: 0,
      lastInteraction: '2024-09-27T14:20:00Z',
      gasUsed: 200000,
    },
  ],
  transactions: [
    {
      id: 'tx-001',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
      from: '0x1111111111111111111111111111111111111111',
      to: '0x1234567890abcdef1234567890abcdef12345678',
      value: 1000000000000000000,
      gasUsed: 21000,
      gasPrice: 30000000000,
      status: 'success',
      blockNumber: 45678912,
      timestamp: '2024-09-28T10:30:00Z',
      network: 'Polygon Mainnet',
    },
    {
      id: 'tx-002',
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      from: '0x2222222222222222222222222222222222222222',
      to: '0xabcdef1234567890abcdef1234567890abcdef12',
      value: 2500000000000000000,
      gasUsed: 150000,
      gasPrice: 30000000000,
      status: 'success',
      blockNumber: 45678911,
      timestamp: '2024-09-28T10:25:00Z',
      network: 'Polygon Mainnet',
    },
    {
      id: 'tx-003',
      hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98',
      from: '0x3333333333333333333333333333333333333333',
      to: '0x9876543210fedcba9876543210fedcba98765432',
      value: 50000000000000000000,
      gasUsed: 200000,
      gasPrice: 1000000000,
      status: 'failed',
      blockNumber: 34567890,
      timestamp: '2024-09-27T14:20:00Z',
      network: 'Polygon Mumbai',
    },
  ],
  stats: {
    totalNetworks: 3,
    activeNetworks: 2,
    totalContracts: 8,
    activeContracts: 6,
    totalTransactions: 2139,
    totalVolume: 1500000000000000000000,
    averageGasPrice: 15,
    successRate: 98.5,
  },
};

export default function BlockchainManagementPage() {
  const [activeTab, setActiveTab] = useState('networks');
  const [data, setData] = useState(mockBlockchainData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'testing':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'testing':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: number, decimals: number = 18) => {
    return (value / Math.pow(10, decimals)).toFixed(4);
  };

  const filteredNetworks = data.networks.filter(network => {
    const matchesSearch = network.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || network.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContracts = data.contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Management</h1>
          <p className="text-gray-600 mt-2">Manage blockchain networks, smart contracts, and transaction transparency</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Link className="w-4 h-4 mr-2" />
            Add Network
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
              <p className="text-sm font-medium text-gray-600">Active Networks</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.activeNetworks}</p>
              <p className="text-sm text-gray-600">Out of {data.stats.totalNetworks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Smart Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.activeContracts}</p>
              <p className="text-sm text-green-600">Active contracts</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalTransactions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">All time</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.successRate}%</p>
              <p className="text-sm text-green-600">Transaction success</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'networks', name: 'Networks' },
              { id: 'contracts', name: 'Smart Contracts' },
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
          {/* Networks Tab */}
          {activeTab === 'networks' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search networks..."
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
                    <option value="testing">Testing</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Networks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNetworks.map((network) => (
                  <div key={network.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{network.name}</h3>
                          <p className="text-sm text-gray-600">Chain ID: {network.chainId}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(network.status)}`}>
                        {getStatusIcon(network.status)}
                        <span className="ml-1">{network.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Block Height</span>
                        <span className="font-medium">{network.blockHeight.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Gas Price</span>
                        <span className="font-medium">{network.gasPrice} Gwei</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions</span>
                        <span className="font-medium">{network.transactions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-medium text-green-600">{network.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Gas Used</span>
                        <span className="font-medium">{network.averageGasUsed.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center">
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

          {/* Smart Contracts Tab */}
          {activeTab === 'contracts' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search contracts, addresses..."
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
                    <option value="testing">Testing</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Contracts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contract
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Network
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Interaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 text-blue-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{contract.name}</div>
                              <div className="text-sm text-gray-500">{contract.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 font-mono">{formatAddress(contract.address)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{contract.network}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{contract.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusIcon(contract.status)}
                            <span className="ml-1">{contract.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {formatValue(contract.balance, contract.decimals)} {contract.type === 'ERC-20' ? 'BELL' : 'ETH'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {contract.lastInteraction ? new Date(contract.lastInteraction).toLocaleDateString() : 'Never'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gas Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">{formatAddress(tx.hash)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">{formatAddress(tx.from)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">{formatAddress(tx.to)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatValue(tx.value)} ETH</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          <span className="ml-1">{tx.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{tx.gasUsed.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{tx.blockNumber.toLocaleString()}</span>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Polygon Mainnet</span>
                      <span className="font-medium">99.2% uptime</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Polygon Mumbai</span>
                      <span className="font-medium">98.8% uptime</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Gas Price</span>
                      <span className="font-medium">15 Gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Volume</span>
                      <span className="font-medium">1.5 ETH</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">BELL Token</span>
                      <span className="font-medium">1,247 interactions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BELL Escrow</span>
                      <span className="font-medium">892 interactions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BELL Marketplace</span>
                      <span className="font-medium">456 interactions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">98.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
