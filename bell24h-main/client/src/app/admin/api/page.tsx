'use client';

import React, { useState, useEffect } from 'react';
import {
  Code,
  Activity,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Settings,
  RefreshCw,
  Globe,
  Database,
  Server,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// Mock API data
const mockAPIData = {
  endpoints: [
    {
      id: 'api-001',
      name: 'RFQ Creation',
      path: '/api/rfq/create',
      method: 'POST',
      status: 'active',
      calls: 1247,
      successRate: 98.5,
      averageResponseTime: 245,
      lastCalled: '2024-09-28T10:30:00Z',
      rateLimit: 1000,
      rateLimitPeriod: 'hour',
      authentication: 'JWT',
      version: 'v1',
    },
    {
      id: 'api-002',
      name: 'Supplier Search',
      path: '/api/suppliers/search',
      method: 'GET',
      status: 'active',
      calls: 3456,
      successRate: 99.2,
      averageResponseTime: 180,
      lastCalled: '2024-09-28T09:15:00Z',
      rateLimit: 5000,
      rateLimitPeriod: 'hour',
      authentication: 'JWT',
      version: 'v1',
    },
    {
      id: 'api-003',
      name: 'Payment Processing',
      path: '/api/payments/process',
      method: 'POST',
      status: 'maintenance',
      calls: 892,
      successRate: 97.8,
      averageResponseTime: 1200,
      lastCalled: '2024-09-27T14:20:00Z',
      rateLimit: 500,
      rateLimitPeriod: 'hour',
      authentication: 'API Key',
      version: 'v2',
    },
    {
      id: 'api-004',
      name: 'User Authentication',
      path: '/api/auth/login',
      method: 'POST',
      status: 'active',
      calls: 5678,
      successRate: 99.8,
      averageResponseTime: 95,
      lastCalled: '2024-09-28T11:45:00Z',
      rateLimit: 10000,
      rateLimitPeriod: 'hour',
      authentication: 'None',
      version: 'v1',
    },
  ],
  integrations: [
    {
      id: 'int-001',
      name: 'KredX Escrow',
      type: 'external',
      status: 'active',
      calls: 156,
      successRate: 99.5,
      lastSync: '2024-09-28T10:30:00Z',
      apiKey: 'kredx_***',
      baseUrl: 'https://api.kredx.com/v1',
      rateLimit: 100,
      rateLimitPeriod: 'minute',
    },
    {
      id: 'int-002',
      name: 'OpenAI Transcription',
      type: 'external',
      status: 'active',
      calls: 234,
      successRate: 98.7,
      lastSync: '2024-09-28T09:45:00Z',
      apiKey: 'sk-***',
      baseUrl: 'https://api.openai.com/v1',
      rateLimit: 60,
      rateLimitPeriod: 'minute',
    },
    {
      id: 'int-003',
      name: 'Razorpay Payments',
      type: 'external',
      status: 'active',
      calls: 1247,
      successRate: 98.2,
      lastSync: '2024-09-28T10:15:00Z',
      apiKey: 'rzp_***',
      baseUrl: 'https://api.razorpay.com/v1',
      rateLimit: 1000,
      rateLimitPeriod: 'hour',
    },
  ],
  logs: [
    {
      id: 'log-001',
      timestamp: '2024-09-28T10:30:00Z',
      level: 'info',
      endpoint: '/api/rfq/create',
      method: 'POST',
      statusCode: 200,
      responseTime: 245,
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      message: 'RFQ created successfully',
    },
    {
      id: 'log-002',
      timestamp: '2024-09-28T10:25:00Z',
      level: 'error',
      endpoint: '/api/payments/process',
      method: 'POST',
      statusCode: 500,
      responseTime: 1200,
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      message: 'Payment gateway timeout',
    },
    {
      id: 'log-003',
      timestamp: '2024-09-28T10:20:00Z',
      level: 'warning',
      endpoint: '/api/suppliers/search',
      method: 'GET',
      statusCode: 429,
      responseTime: 50,
      ip: '192.168.1.102',
      userAgent: 'Mozilla/5.0...',
      message: 'Rate limit exceeded',
    },
  ],
  stats: {
    totalEndpoints: 24,
    activeEndpoints: 22,
    totalCalls: 12567,
    averageResponseTime: 285,
    successRate: 98.7,
    errorRate: 1.3,
    totalIntegrations: 8,
    activeIntegrations: 7,
  },
};

export default function APIManagementPage() {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [data, setData] = useState(mockAPIData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-green-600 bg-green-100';
      case 'POST':
        return 'text-blue-600 bg-blue-100';
      case 'PUT':
        return 'text-yellow-600 bg-yellow-100';
      case 'DELETE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredEndpoints = data.endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLogs = data.logs.filter(log => {
    const matchesSearch = log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600 mt-2">Monitor and configure API usage, rate limits, and integrations</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Add Endpoint
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalEndpoints}</p>
              <p className="text-sm text-green-600">{data.stats.activeEndpoints} Active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalCalls.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Last 24 hours</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.successRate}%</p>
              <p className="text-sm text-green-600">API reliability</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.averageResponseTime}ms</p>
              <p className="text-sm text-gray-600">Performance metric</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'endpoints', name: 'Endpoints' },
              { id: 'integrations', name: 'Integrations' },
              { id: 'logs', name: 'Logs' },
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
          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search endpoints, paths..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center" aria-label="Open more filters">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calls
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEndpoints.map((endpoint) => (
                      <tr key={endpoint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{endpoint.path}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}>
                            {getStatusIcon(endpoint.status)}
                            <span className="ml-1">{endpoint.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{endpoint.calls.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-green-600 font-medium">{endpoint.successRate}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{endpoint.averageResponseTime}ms</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {endpoint.rateLimit}/{endpoint.rateLimitPeriod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900" aria-label="View endpoint details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900" aria-label="Configure endpoint">
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

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.integrations.map((integration) => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.type} • {integration.status}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                      {getStatusIcon(integration.status)}
                      <span className="ml-1">{integration.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Calls</span>
                      <span className="font-medium">{integration.calls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">{integration.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rate Limit</span>
                      <span className="font-medium">{integration.rateLimit}/{integration.rateLimitPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync</span>
                      <span className="font-medium">
                        {new Date(integration.lastSync).toLocaleDateString()}
                      </span>
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
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search logs, endpoints, messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select aria-label="Filter by level"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center" aria-label="Open more log filters">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 font-mono">{log.endpoint}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(log.method)}`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-600' :
                            log.statusCode >= 400 && log.statusCode < 500 ? 'text-yellow-600' :
                            log.statusCode >= 500 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{log.responseTime}ms</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{log.message}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900" aria-label="View log details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Response Time</span>
                      <span className="font-medium">285ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium text-green-600">98.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error Rate</span>
                      <span className="font-medium text-red-600">1.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Requests</span>
                      <span className="font-medium">12,567</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">/api/auth/login</span>
                      <span className="font-medium">5,678 calls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">/api/suppliers/search</span>
                      <span className="font-medium">3,456 calls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">/api/rfq/create</span>
                      <span className="font-medium">1,247 calls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">/api/payments/process</span>
                      <span className="font-medium">892 calls</span>
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
