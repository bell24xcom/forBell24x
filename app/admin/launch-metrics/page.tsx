'use client';

// Removed broken lucide-react import - using emojis instead
import { useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'paid' | 'content';
  status: 'active' | 'paused' | 'completed';
  budget: string;
  spent: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  startDate: string;
  endDate: string;
}

interface Metric {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

export default function LaunchMetricsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  const metrics: Metric[] = [
    {
      name: 'Total Campaigns',
      value: '24',
      change: 12.5,
      trend: 'up',
      icon: '🎯',
      color: 'text-blue-600'
    },
    {
      name: 'Total Spend',
      value: '₹2.4L',
      change: 8.3,
      trend: 'up',
      icon: '💰',
      color: 'text-green-600'
    },
    {
      name: 'Impressions',
      value: '1.2M',
      change: 15.7,
      trend: 'up',
      icon: '👁️',
      color: 'text-purple-600'
    },
    {
      name: 'Click-Through Rate',
      value: '3.2%',
      change: -2.1,
      trend: 'down',
      icon: '↗️',
      color: 'text-orange-600'
    },
    {
      name: 'Cost Per Click',
      value: '₹12.50',
      change: 5.4,
      trend: 'up',
      icon: '📊',
      color: 'text-red-600'
    },
    {
      name: 'Return on Ad Spend',
      value: '4.2x',
      change: 18.9,
      trend: 'up',
      icon: '📊',
      color: 'text-indigo-600'
    }
  ];

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Q4 Product Launch',
      type: 'paid',
      status: 'active',
      budget: '₹50,000',
      spent: '₹32,500',
      impressions: 125000,
      clicks: 4200,
      conversions: 156,
      ctr: 3.36,
      cpc: 7.74,
      roas: 4.8,
      startDate: '2024-08-01',
      endDate: '2024-09-30'
    },
    {
      id: '2',
      name: 'Supplier Onboarding',
      type: 'email',
      status: 'active',
      budget: '₹25,000',
      spent: '₹18,200',
      impressions: 85000,
      clicks: 2100,
      conversions: 89,
      ctr: 2.47,
      cpc: 8.67,
      roas: 3.2,
      startDate: '2024-08-15',
      endDate: '2024-09-15'
    },
    {
      id: '3',
      name: 'Brand Awareness',
      type: 'social',
      status: 'paused',
      budget: '₹75,000',
      spent: '₹45,000',
      impressions: 320000,
      clicks: 8900,
      conversions: 234,
      ctr: 2.78,
      cpc: 5.06,
      roas: 2.8,
      startDate: '2024-07-01',
      endDate: '2024-08-31'
    },
    {
      id: '4',
      name: 'Content Marketing',
      type: 'content',
      status: 'completed',
      budget: '₹30,000',
      spent: '₹28,500',
      impressions: 180000,
      clicks: 5400,
      conversions: 167,
      ctr: 3.00,
      cpc: 5.28,
      roas: 5.1,
      startDate: '2024-06-01',
      endDate: '2024-07-31'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <span className="text-lg">💬</span>;
      case 'social':
        return <span className="text-lg">🔗</span>;
      case 'paid':
        return <span className="text-lg">💰</span>;
      case 'content':
        return <span className="text-lg">📊</span>;
      default:
        return <span className="text-lg">📊</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-600">↗️</span>;
      case 'down':
        return <span className="text-red-600">↘️</span>;
      default:
        return <span className="text-neutral-600">📊</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Launch Metrics</h1>
          <p className="mt-2 text-neutral-600">Track marketing campaign performance and launch metrics</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-neutral-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'campaigns', name: 'Campaigns', icon: '🎯' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-neutral-100 rounded-lg">
                        <span className={`text-2xl ${metric.color}`}>{metric.icon}</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-neutral-600">{metric.name}</p>
                        <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' : 'text-neutral-600'
                        }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Performance Trends</h3>
              <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl text-gray-400 mx-auto mb-4">📊</span>
                  <p className="text-neutral-500">Performance chart would be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-900">Marketing Campaigns</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Impressions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">CTR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{campaign.name}</div>
                            <div className="text-sm text-neutral-500">{campaign.startDate} - {campaign.endDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(campaign.type)}
                            <span className="ml-2 text-sm text-neutral-900 capitalize">{campaign.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {campaign.budget}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {campaign.spent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {campaign.impressions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {campaign.ctr}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {campaign.roas}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Top Performing Campaigns</h3>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-900">{campaign.name}</p>
                          <p className="text-sm text-neutral-500">{campaign.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900">{campaign.roas}x ROAS</p>
                        <p className="text-sm text-neutral-500">{campaign.ctr}% CTR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Channel Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Paid Advertising</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-neutral-900">4.2x ROAS</span>
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Email Marketing</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-neutral-900">3.2x ROAS</span>
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Social Media</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-neutral-900">2.8x ROAS</span>
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Content Marketing</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-neutral-900">5.1x ROAS</span>
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}