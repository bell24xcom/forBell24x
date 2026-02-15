'use client';

import React, { useState } from 'react';
import MinimalLayout from '@/components/layouts/MinimalLayout';

// **CLEAN MINIMALIST ANALYTICS DASHBOARD - NO COLORFUL CARDS**

interface MetricData {
  title: string;
  value: string;
  change: number;
  description: string;
}

export default function AnalyticsDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // **CLEAN METRICS DATA - NO COLOR PROPERTIES**
  const metrics: MetricData[] = [
    {
      title: 'Total Revenue',
      value: '₹15.2 Cr',
      change: 28.5,
      description: 'Annual revenue growth',
    },
    {
      title: 'Active Suppliers',
      value: '534K+',
      change: 23.5,
      description: 'Verified supplier network',
    },
    { title: 'Total Orders', value: '247K+', change: 18.3, description: 'Processed orders' },
    {
      title: 'AI Match Rate',
      value: '94.2%',
      change: 6.7,
      description: 'Intelligent matching accuracy',
    },
    {
      title: 'Voice RFQ Usage',
      value: '78.5%',
      change: 45.2,
      description: 'AI voice processing adoption',
    },
    {
      title: 'Market Share',
      value: '23.8%',
      change: 12.8,
      description: 'B2B marketplace position',
    },
    { title: 'Pending RFQs', value: '2.1K', change: -5.1, description: 'Awaiting responses' },
    { title: 'Response Time', value: '2.3h', change: -15.3, description: 'Average response time' },
  ];

  const aiFeatures = [
    { name: 'Voice RFQ Processing', status: 'Active', accuracy: '98.5%', usage: '78.5%' },
    { name: 'Smart Supplier Matching', status: 'Active', accuracy: '94.2%', usage: '85.3%' },
    { name: 'Predictive Analytics', status: 'Active', accuracy: '91.7%', usage: '67.8%' },
    { name: 'Market Intelligence', status: 'Active', accuracy: '89.4%', usage: '72.1%' },
  ];

  const performanceMetrics = [
    { category: 'Revenue Growth', current: '₹15.2Cr', target: '₹18.5Cr', percentage: 82 },
    { category: 'User Acquisition', current: '534K', target: '650K', percentage: 78 },
    { category: 'Platform Efficiency', current: '94.2%', target: '96.0%', percentage: 98 },
    { category: 'Customer Satisfaction', current: '4.7/5', target: '4.8/5', percentage: 95 },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance' },
    { id: 'ai-features', label: 'AI Features' },
  ];

  return (
    <MinimalLayout>
      <div className='space-y-6'>
        {/* **CLEAN PAGE HEADER** */}
        <div className='border-b border-gray-200 pb-4'>
          <h1 className='text-2xl font-semibold text-gray-900'>Analytics Dashboard</h1>
          <p className='text-sm text-gray-600 mt-1'>
            Enterprise performance metrics and AI-powered insights
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

        {/* **OVERVIEW TAB - CLEAN TABLE LAYOUT** */}
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* **METRICS TABLE - NO COLORFUL CARDS** */}
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h2 className='text-lg font-medium text-gray-900'>Key Performance Indicators</h2>
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
                              metric.change >= 0 ? 'text-blue-600' : 'text-gray-600'
                            }`}
                          >
                            <span>📈</span>
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
          </div>
        )}

        {/* **PERFORMANCE TAB** */}
        {activeTab === 'performance' && (
          <div className='space-y-6'>
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h2 className='text-lg font-medium text-gray-900'>Performance Targets</h2>
              </div>
              <div className='p-4'>
                <div className='space-y-4'>
                  {performanceMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-medium text-gray-900'>
                            {metric.category}
                          </span>
                          <span className='text-sm text-gray-600'>
                            {metric.current} / {metric.target}
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{ width: `${metric.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* **AI FEATURES TAB** */}
        {activeTab === 'ai-features' && (
          <div className='space-y-6'>
            <div className='bg-white border border-gray-200 rounded-md'>
              <div className='px-4 py-3 border-b border-gray-200'>
                <h2 className='text-lg font-medium text-gray-900'>AI Features Status</h2>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Feature
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Accuracy
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Usage
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {aiFeatures.map((feature, index) => (
                      <tr key={index} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                          {feature.name}
                        </td>
                        <td className='px-4 py-3 text-sm'>
                          <span className='text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs'>
                            {feature.status}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-sm font-semibold text-gray-900'>
                          {feature.accuracy}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>{feature.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </MinimalLayout>
  );
}
