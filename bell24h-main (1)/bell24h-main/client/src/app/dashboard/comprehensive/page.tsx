'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import MinimalLayout from '@/components/layouts/MinimalLayout';

// **REMOVE ALL COLORFUL CARDS - IMPLEMENT MINIMALIST DESIGN**

interface MetricData {
  title: string;
  value: string;
  change: number;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}

interface ChartDataItem {
  month: string;
  revenue: number;
  orders: number;
  suppliers: number;
}

interface CategoryData {
  name: string;
  value: number;
  volume: string;
}

interface AnalyticsInsight {
  type: 'market' | 'recommendation' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export default function ComprehensiveDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // **CLEAN DATA STRUCTURE - NO COLOR PROPERTIES**
  const metrics: MetricData[] = [
    {
      title: 'Total Revenue',
      value: '₹32.5L',
      change: 12.5,
      description: 'Monthly performance',
      trend: 'up',
    },
    {
      title: 'Active Orders',
      value: '2,847',
      change: 8.3,
      description: 'Current active orders',
      trend: 'up',
    },
    {
      title: 'Verified Suppliers',
      value: '1,293',
      change: 15.2,
      description: 'Network growth',
      trend: 'up',
    },
    {
      title: 'Pending RFQs',
      value: '89',
      change: -5.1,
      description: 'Awaiting response',
      trend: 'down',
    },
  ];

  const chartData: ChartDataItem[] = [
    { month: 'January', revenue: 2850000, orders: 245, suppliers: 18 },
    { month: 'February', revenue: 3100000, orders: 289, suppliers: 22 },
    { month: 'March', revenue: 3250000, orders: 312, suppliers: 25 },
    { month: 'April', revenue: 2950000, orders: 276, suppliers: 19 },
    { month: 'May', revenue: 3450000, orders: 334, suppliers: 28 },
    { month: 'June', revenue: 3750000, orders: 367, suppliers: 32 },
  ];

  const categories: CategoryData[] = [
    { name: 'Electronics', value: 85, volume: '1,247' },
    { name: 'Machinery', value: 72, volume: '892' },
    { name: 'Textiles', value: 68, volume: '756' },
    { name: 'Chemicals', value: 64, volume: '623' },
    { name: 'Agriculture', value: 59, volume: '534' },
  ];

  const insights: AnalyticsInsight[] = [
    {
      type: 'market',
      title: 'Market Insight',
      description:
        'Steel prices expected to increase by 8% next quarter. Consider bulk procurement.',
      priority: 'high',
    },
    {
      type: 'recommendation',
      title: 'Supplier Recommendation',
      description: '3 new verified suppliers match your requirements with 15% cost savings.',
      priority: 'medium',
    },
    {
      type: 'alert',
      title: 'Risk Alert',
      description: 'Supplier ABC Corp shows delayed deliveries. Consider alternatives.',
      priority: 'high',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New RFQ submitted',
      user: 'Procurement Team',
      time: '2 minutes ago',
      status: 'Active',
    },
    {
      id: 2,
      action: 'Supplier verified',
      user: 'System Auto',
      time: '15 minutes ago',
      status: 'Completed',
    },
    {
      id: 3,
      action: 'Payment processed',
      user: 'Finance Team',
      time: '1 hour ago',
      status: 'Completed',
    },
    {
      id: 4,
      action: 'ESG report generated',
      user: 'Analytics Engine',
      time: '2 hours ago',
      status: 'Completed',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', description: 'Dashboard overview and key metrics' },
    { id: 'analytics', label: 'Analytics', description: 'Detailed performance analytics' },
    { id: 'rfq', label: 'RFQ Management', description: 'Create and manage RFQs' },
  ];

  return (
    <MinimalLayout>
      <div className='space-y-6'>
        {/* **CLEAN PAGE HEADER - NO COLORFUL ELEMENTS** */}
        <div className='border-b border-gray-200 pb-4'>
          <h1 className='text-2xl font-semibold text-gray-900'>Comprehensive Dashboard</h1>
          <p className='text-sm text-gray-600 mt-1'>
            Complete enterprise analytics and management interface
          </p>
        </div>

        {/* **MINIMALIST TAB NAVIGATION** */}
        <div className='border-b border-gray-200'>
          <nav className='flex space-x-8'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* **OVERVIEW TAB - CLEAN TABLE LAYOUTS** */}
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* **METRICS TABLE - NO COLORFUL CARDS** */}
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h2 className='text-lg font-medium text-gray-900'>Key Performance Metrics</h2>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Metric
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Value
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Change
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {metrics.map((metric, index) => (
                      <tr key={index} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                          {metric.title}
                        </td>
                        <td className='px-4 py-3 text-sm font-semibold text-gray-900'>
                          {metric.value}
                        </td>
                        <td className='px-4 py-3 text-sm'>
                          <span
                            className={`flex items-center ${
                              metric.trend === 'up'
                                ? 'text-blue-600'
                                : metric.trend === 'down'
                                ? 'text-gray-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {metric.trend === 'up' ? (
                              <span>📈</span>
                            ) : metric.trend === 'down' ? (
                              <span>📉</span>
                            ) : null}
                            {metric.change > 0 ? '+' : ''}
                            {metric.change}%
                          </span>
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>{metric.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* **REVENUE TREND TABLE - NO CHARTS WITH COLORS** */}
              <div className='bg-white border border-gray-200 rounded-md'>
                <div className='px-4 py-3 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>Revenue Trend (6 Months)</h3>
                </div>
                <div className='p-4'>
                  <div className='space-y-3'>
                    {chartData.map((item, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0'
                      >
                        <span className='text-sm font-medium text-gray-900'>{item.month}</span>
                        <div className='flex items-center space-x-3'>
                          <div className='w-20 bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-blue-600 h-2 rounded-full'
                              style={{ width: `${(item.revenue / 4000000) * 100}%` }}
                            ></div>
                          </div>
                          <span className='text-sm font-semibold text-gray-900 min-w-[60px]'>
                            ₹{(item.revenue / 100000).toFixed(1)}L
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* **CATEGORY VOLUME TABLE** */}
              <div className='bg-white border border-gray-200 rounded-md'>
                <div className='px-4 py-3 border-b border-gray-200'>
                  <h3 className='text-lg font-medium text-gray-900'>Category Performance</h3>
                </div>
                <div className='p-4'>
                  <div className='space-y-3'>
                    {categories.map((category, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0'
                      >
                        <span className='text-sm font-medium text-gray-900'>{category.name}</span>
                        <div className='flex items-center space-x-3'>
                          <div className='w-20 bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-gray-600 h-2 rounded-full'
                              style={{ width: `${category.value}%` }}
                            ></div>
                          </div>
                          <span className='text-sm font-semibold text-gray-900 min-w-[60px]'>
                            {category.volume}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* **RECENT ACTIVITY TABLE** */}
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Recent Activity</h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Action
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        User
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Time
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {recentActivity.map(activity => (
                      <tr key={activity.id} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                          {activity.action}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>{activity.user}</td>
                        <td className='px-4 py-3 text-sm text-gray-600'>{activity.time}</td>
                        <td className='px-4 py-3 text-sm'>
                          <span className='text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs'>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* **ANALYTICS TAB - CLEAN PROFESSIONAL LAYOUT** */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            {/* **ANALYTICS METRICS TABLE** */}
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>Advanced Analytics</h3>
              </div>
              <div className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                      <span className='text-sm text-gray-600'>Cost Savings</span>
                      <span className='text-sm font-semibold text-gray-900'>₹12.5L (+25.3%)</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                      <span className='text-sm text-gray-600'>Supplier Performance</span>
                      <span className='text-sm font-semibold text-gray-900'>94.2% (+5.1%)</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                      <span className='text-sm text-gray-600'>Risk Score</span>
                      <span className='text-sm font-semibold text-gray-900'>A+ (Low Risk)</span>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                      <span className='text-sm text-gray-600'>Average Response Time</span>
                      <span className='text-sm font-semibold text-gray-900'>2.3 days</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                      <span className='text-sm text-gray-600'>Quote Conversion Rate</span>
                      <span className='text-sm font-semibold text-gray-900'>68.5%</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                      <span className='text-sm text-gray-600'>On-time Delivery</span>
                      <span className='text-sm font-semibold text-gray-900'>91.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* **AI INSIGHTS TABLE - NO COLORFUL ALERTS** */}
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>AI-Powered Insights</h3>
              </div>
              <div className='divide-y divide-gray-200'>
                {insights.map((insight, index) => (
                  <div key={index} className='p-4'>
                    <div className='flex items-start space-x-3'>
                      <div className='w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center'>
                        {insight.type === 'market' && <Brain className='h-4 w-4 text-gray-600' />}
                        {insight.type === 'recommendation' && (
                          <span>✅</span>
                        )}
                        {insight.type === 'alert' && (
                          <AlertTriangle className='h-4 w-4 text-gray-600' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium text-gray-900'>{insight.title}</h4>
                          <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                            {insight.priority} priority
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* **RFQ MANAGEMENT TAB** */}
        {activeTab === 'rfq' && (
          <div className='space-y-6'>
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>RFQ Management</h3>
                <button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'>
                  Create New RFQ
                </button>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Product Category
                    </label>
                    <select 
                      className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                      aria-label="Product Category Selection"
                    >
                      <option>Select category...</option>
                      <option>Electronics</option>
                      <option>Machinery</option>
                      <option>Textiles</option>
                      <option>Chemicals</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Product Description
                    </label>
                    <textarea
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                      placeholder='Describe your requirements...'
                    ></textarea>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Quantity
                      </label>
                      <input
                        type='number'
                        className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        placeholder='Enter quantity'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Budget Range
                      </label>
                      <input
                        type='text'
                        className='w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600'
                        placeholder='₹ Amount'
                      />
                    </div>
                  </div>
                  <div className='flex justify-end space-x-4 pt-4'>
                    <button className='px-6 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'>
                      Save Draft
                    </button>
                    <button className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
                      Publish RFQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MinimalLayout>
  );
}
