'use client';

import React from 'react';

export default function DashboardCharts() {
  const metrics = {
    revenue: 2850000,
    orders: 152,
    suppliers: 843,
    rfqs: 27,
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Enhanced Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Professional analytics and business insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Revenue</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  ₹{(metrics.revenue / 100000).toFixed(1)}L
                </p>
              </div>
              <span>$</span>
            </div>
            <div className='mt-4 flex items-center'>
              <span>📈</span>
              <span className='text-sm font-medium text-green-600'>+12.5%</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Orders</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{metrics.orders}</p>
              </div>
              <span>🛒</span>
            </div>
            <div className='mt-4 flex items-center'>
              <span>📈</span>
              <span className='text-sm font-medium text-green-600'>+8.3%</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Suppliers</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics.suppliers}
                </p>
              </div>
              <span>👤</span>
            </div>
            <div className='mt-4 flex items-center'>
              <span>📈</span>
              <span className='text-sm font-medium text-green-600'>+15.2%</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>RFQs</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{metrics.rfqs}</p>
              </div>
              <span>📈</span>
            </div>
            <div className='mt-4 flex items-center'>
              <span>📈</span>
              <span className='text-sm font-medium text-green-600'>+3.1%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <button className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:shadow-lg transition-all group'>
            <div className='flex items-center'>
              <span>🎤</span>
              <div className='text-left'>
                <div className='font-bold'>Voice RFQ</div>
                <div className='text-sm opacity-90'>Speak requirements</div>
              </div>
            </div>
          </button>

          <button className='bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:shadow-lg transition-all group'>
            <div className='flex items-center'>
              <Brain className='h-8 w-8 mr-3 group-hover:scale-110 transition-transform' />
              <div className='text-left'>
                <div className='font-bold'>AI Matching</div>
                <div className='text-sm opacity-90'>Smart search</div>
              </div>
            </div>
          </button>

          <button className='bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:shadow-lg transition-all group'>
            <div className='flex items-center'>
              <span>🎥</span>
              <div className='text-left'>
                <div className='font-bold'>Video RFQ</div>
                <div className='text-sm opacity-90'>Record needs</div>
              </div>
            </div>
          </button>

          <button className='bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-xl hover:shadow-lg transition-all group'>
            <div className='flex items-center'>
              <span>➕</span>
              <div className='text-left'>
                <div className='font-bold'>Create RFQ</div>
                <div className='text-sm opacity-90'>Manual form</div>
              </div>
            </div>
          </button>
        </div>

        {/* Charts Placeholder */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Revenue Trend
            </h3>
            <div className='h-64 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center'>
              <div className='text-center'>
                <span>📈</span>
                <p className='text-gray-600 dark:text-gray-400'>Revenue Chart</p>
                <p className='text-sm text-gray-500'>Chart.js Integration Ready</p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Order Distribution
            </h3>
            <div className='h-64 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg flex items-center justify-center'>
              <div className='text-center'>
                <span>🛒</span>
                <p className='text-gray-600 dark:text-gray-400'>Order Analytics</p>
                <p className='text-sm text-gray-500'>Pie Chart Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border p-6'>
          <div className='flex items-center mb-4'>
            <Brain className='h-6 w-6 text-blue-600 mr-3' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>AI Insights</h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Market Prediction</div>
              <div className='font-semibold text-gray-900 dark:text-white'>
                Electronics demand +15% next month
              </div>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Cost Optimization</div>
              <div className='font-semibold text-gray-900 dark:text-white'>
                Switch suppliers saves 12%
              </div>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Risk Alert</div>
              <div className='font-semibold text-gray-900 dark:text-white'>
                Monitor delivery delays
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
