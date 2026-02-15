'use client';

import {
  Activity,
  BarChart3,
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  const analyticsData = {
    revenue: {
      total: 125000000,
      growth: 15.3,
      monthlyData: [
        { month: 'Jan', amount: 8500000 },
        { month: 'Feb', amount: 9200000 },
        { month: 'Mar', amount: 10100000 },
        { month: 'Apr', amount: 11500000 },
        { month: 'May', amount: 12800000 },
        { month: 'Jun', amount: 14200000 }
      ]
    },
    users: {
      total: 1250,
      growth: 12.5,
      breakdown: {
        suppliers: 847,
        buyers: 403
      }
    },
    transactions: {
      total: 2341,
      growth: 18.7,
      avgValue: 534000
    }
  };

  const topCategories = [
    { name: 'Textiles & Garments', revenue: 45000000, percentage: 36 },
    { name: 'Electronics', revenue: 28000000, percentage: 22 },
    { name: 'Machinery', revenue: 22000000, percentage: 18 },
    { name: 'Chemicals', revenue: 18000000, percentage: 14 },
    { name: 'Others', revenue: 12000000, percentage: 10 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ₹{(analyticsData.revenue.total / 10000000).toFixed(1)}Cr
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +{analyticsData.revenue.growth}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analyticsData.users.total.toLocaleString()}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +{analyticsData.users.growth}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analyticsData.transactions.total.toLocaleString()}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +{analyticsData.transactions.growth}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Transaction</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ₹{(analyticsData.transactions.avgValue / 1000).toFixed(0)}K
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        +8.4%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart and Top Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend</h3>
              <div className="space-y-4">
                {analyticsData.revenue.monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-900">₹{(month.amount / 10000000).toFixed(1)}Cr</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(month.amount / 15000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Categories by Revenue</h3>
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-500">{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      ₹{(category.revenue / 10000000).toFixed(1)}Cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Growth and Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Suppliers</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{analyticsData.users.breakdown.suppliers}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Buyers</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{analyticsData.users.breakdown.buyers}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">API Response Time</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">142ms</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">System Uptime</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">99.8%</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Active Sessions</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">847</span>
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
