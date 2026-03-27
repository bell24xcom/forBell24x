'use client';

import { Clock, Eye, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export default function TrafficPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock traffic data
  const trafficData = {
    totalVisitors: 125847,
    uniqueVisitors: 89432,
    pageViews: 456789,
    avgSessionDuration: '4m 32s',
    bounceRate: 23.4,
    conversionRate: 2.8,
    topCountries: [
      { country: 'India', visitors: 45678, percentage: 36.3 },
      { country: 'USA', visitors: 23456, percentage: 18.6 },
      { country: 'UK', visitors: 12345, percentage: 9.8 },
      { country: 'Germany', visitors: 9876, percentage: 7.8 },
      { country: 'Canada', visitors: 7654, percentage: 6.1 },
    ],
    topPages: [
      { page: '/categories', views: 45678, percentage: 10.0 },
      { page: '/suppliers', views: 34567, percentage: 7.6 },
      { page: '/rfq', views: 23456, percentage: 5.1 },
      { page: '/pricing', views: 12345, percentage: 2.7 },
      { page: '/traffic', views: 9876, percentage: 2.2 },
    ],
    realTimeData: {
      currentVisitors: 234,
      activeSessions: 156,
      recentActivity: [
        {
          time: '2 min ago',
          action: 'New RFQ posted',
          user: 'ABC Manufacturing',
        },
        {
          time: '3 min ago',
          action: 'Supplier registered',
          user: 'XYZ Industries',
        },
        { time: '5 min ago', action: 'Category viewed', user: 'DEF Solutions' },
        { time: '7 min ago', action: 'Pricing page visited', user: 'GHI Corp' },
      ],
    },
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{value}</p>
          {change && (
            <div
              className={`flex items-center mt-2 text-sm ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change > 0 ? <span>↑</span> : <span>↓</span>}
              <span>{Math.abs(change)}% from last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, subtitle, trend }) => (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-xl font-bold text-gray-900 mt-1'>{value}</p>
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend > 0 ? <span>↑</span> : <span>↓</span>}
            <span className='ml-1'>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Traffic Analytics</h1>
              <p className='text-sm text-gray-600'>Real-time marketplace traffic insights</p>
            </div>
            <div className='flex items-center space-x-4'>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='1d'>Last 24 hours</option>
                <option value='7d'>Last 7 days</option>
                <option value='30d'>Last 30 days</option>
                <option value='90d'>Last 90 days</option>
              </select>
              <button className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'>
                <span>🔽</span>
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            title='Total Visitors'
            value={trafficData.totalVisitors.toLocaleString()}
            change={12.5}
            icon={Users}
            color='blue'
          />
          <StatCard
            title='Page Views'
            value={trafficData.pageViews.toLocaleString()}
            change={8.3}
            icon={Eye}
            color='green'
          />
          <StatCard
            title='Avg Session Duration'
            value={trafficData.avgSessionDuration}
            change={-2.1}
            icon={Clock}
            color='purple'
          />
          <StatCard
            title='Conversion Rate'
            value={`${trafficData.conversionRate}%`}
            change={15.7}
            icon={TrendingUp}
            color='orange'
          />
        </div>

        {/* Real-time Activity */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          <div className='lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>Real-time Activity</h2>
              <div className='flex items-center space-x-2 text-green-600'>
                <span>📊</span>
                <span className='text-sm font-medium'>Live</span>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-sm text-gray-600'>Current Visitors</span>
                </div>
                <span className='text-lg font-semibold text-gray-900'>
                  {trafficData.realTimeData.currentVisitors}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <span className='text-sm text-gray-600'>Active Sessions</span>
                </div>
                <span className='text-lg font-semibold text-gray-900'>
                  {trafficData.realTimeData.activeSessions}
                </span>
              </div>
            </div>
            <div className='mt-6'>
              <h3 className='text-sm font-medium text-gray-900 mb-3'>Recent Activity</h3>
              <div className='space-y-2'>
                {trafficData.realTimeData.recentActivity.map((activity, index) => (
                  <div key={index} className='flex items-center justify-between text-sm'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-gray-500'>{activity.time}</span>
                      <span className='text-gray-900'>{activity.action}</span>
                    </div>
                    <span className='text-gray-600'>{activity.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Top Countries</h2>
            <div className='space-y-3'>
              {trafficData.topCountries.map((country, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-medium text-gray-900'>{country.country}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm text-gray-600'>
                      {country.visitors.toLocaleString()}
                    </span>
                    <span className='text-xs text-gray-500'>({country.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Top Pages</h2>
          <div className='space-y-3'>
            {trafficData.topPages.map((page, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-medium text-gray-900'>{page.page}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-gray-600'>{page.views.toLocaleString()}</span>
                  <span className='text-xs text-gray-500'>({page.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
