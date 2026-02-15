'use client';

import { useState } from 'react';
import { useTrafficAnalytics } from '@/hooks/useTrafficAnalytics';

export default function TrafficAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('24h');
  const { analytics, loading, error, refreshAnalytics } = useTrafficAnalytics(timeframe);

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-red-800 mb-2'>Error Loading Analytics</h3>
            <p className='text-red-600'>{error}</p>
            <button
              onClick={refreshAnalytics}
              className='mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
              <span>📊</span>
              Traffic Analytics
            </h1>
            <p className='text-gray-600'>
              Real-time insights into your platform's traffic and user behavior
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className='bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='1h'>Last Hour</option>
              <option value='24h'>Last 24 Hours</option>
              <option value='7d'>Last 7 Days</option>
              <option value='30d'>Last 30 Days</option>
            </select>

            <button
              onClick={refreshAnalytics}
              disabled={loading}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors'
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
                      Total Visits
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {analytics.totalVisits.toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>Page views and interactions</p>
                  </div>
                  <div className='p-3 bg-blue-100 rounded-full'>
                    <span>👁️</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
                      Unique Visitors
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {analytics.uniqueVisitors.toLocaleString()}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>Individual users</p>
                  </div>
                  <div className='p-3 bg-green-100 rounded-full'>
                    <span>👤</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
                      Avg. Duration
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {formatDuration(analytics.averageDuration)}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>Time on site</p>
                  </div>
                  <div className='p-3 bg-purple-100 rounded-full'>
                    <span>🕐</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600 uppercase tracking-wide'>
                      Active Users
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>{analytics.activeUsers}</p>
                    <p className='text-xs text-gray-500 mt-1'>Real-time (last 5 min)</p>
                  </div>
                  <div className='p-3 bg-orange-100 rounded-full'>
                    <span>📈</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Details */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
              {/* Top Pages */}
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <span>👁️</span>
                  Top Pages
                </h3>
                <div className='space-y-4'>
                  {analytics.topPages.slice(0, 8).map((page, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full'>
                          {index + 1}
                        </span>
                        <span className='text-sm text-gray-700 font-medium truncate max-w-xs'>
                          {page.page === '/' ? 'Homepage' : page.page}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-bold text-gray-900'>
                          {page.views.toLocaleString()}
                        </span>
                        <span className='text-xs text-gray-500'>views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                  <span>🌍</span>
                  Traffic Sources
                </h3>
                <div className='space-y-4'>
                  {analytics.trafficSources.slice(0, 8).map((source, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 text-xs font-bold rounded-full'>
                          {index + 1}
                        </span>
                        <span className='text-sm text-gray-700 font-medium capitalize'>
                          {source.source === 'direct' ? 'Direct Traffic' : source.source}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-bold text-gray-900'>
                          {source.visits.toLocaleString()}
                        </span>
                        <span className='text-xs text-gray-500'>visits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2'>
                <span>📈</span>
                Conversion Funnel Analysis
              </h3>
              <div className='space-y-6'>
                {analytics.conversionFunnel.map((step, index) => (
                  <div key={step.step} className='relative'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <span className='flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 text-sm font-bold rounded-full'>
                          {index + 1}
                        </span>
                        <span className='text-sm font-medium text-gray-700'>{step.step}</span>
                      </div>
                      <div className='text-right'>
                        <span className='text-lg font-bold text-gray-900'>
                          {step.users.toLocaleString()}
                        </span>
                        <span className='text-sm text-gray-500 ml-1'>users</span>
                        <div className='text-sm text-purple-600 font-medium'>
                          {step.conversionRate.toFixed(1)}% conversion
                        </div>
                      </div>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                      <div
                        className='bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out'
                        style={{ width: `${Math.max(step.conversionRate, 2)}%` }}
                      ></div>
                    </div>
                    {index < analytics.conversionFunnel.length - 1 && (
                      <div className='absolute left-4 top-16 w-0.5 h-6 bg-gray-300'></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Status */}
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold mb-2'>Real-time Monitoring</h3>
                  <p className='text-blue-100'>
                    Live traffic analytics powered by Bell24H's advanced tracking system
                  </p>
                </div>
                <div className='text-right'>
                  <div className='text-3xl font-bold'>{analytics.activeUsers}</div>
                  <div className='text-blue-100 text-sm'>active users now</div>
                  <div className='flex items-center justify-end gap-2 mt-2'>
                    <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                    <span className='text-xs text-blue-100'>Live</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!analytics && !loading && (
          <div className='bg-white rounded-lg shadow-md p-12 text-center'>
            <span>📊</span>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Analytics Data</h3>
            <p className='text-gray-600 mb-4'>
              Start using the platform to see traffic analytics data here.
            </p>
            <button
              onClick={refreshAnalytics}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
