'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export default function EnhancedDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    revenue: 2850000,
    orders: 152,
    suppliers: 843,
    rfqs: 27,
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    supplierGrowth: 15.2,
    rfqGrowth: -3.1,
  });

  // Revenue trend data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue (₹L)',
        data: [18.5, 22.3, 19.8, 25.1, 27.2, 24.8, 28.5],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target (₹L)',
        data: [20, 22, 24, 26, 28, 30, 32],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Order volume data
  const orderData = {
    labels: ['Electronics', 'Machinery', 'Textiles', 'Chemicals', 'Automotive', 'Others'],
    datasets: [
      {
        data: [35, 25, 15, 12, 8, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Supplier performance data
  const supplierData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Suppliers',
        data: [12, 19, 8, 15],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Active Suppliers',
        data: [25, 32, 28, 35],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Dashboard</h1>
              <p className='text-gray-600 dark:text-gray-400'>
                Welcome back! Here's what's happening with your business.
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className='px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='7d'>Last 7 days</option>
                <option value='30d'>Last 30 days</option>
                <option value='90d'>Last 3 months</option>
                <option value='12m'>Last 12 months</option>
              </select>
              <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center'>
                <span>⬇️</span>
                Export
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className='flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('buying')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'buying'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Buying Activity
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total Revenue
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  ₹{(metrics.revenue / 100000).toFixed(1)}L
                </p>
              </div>
              <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <span>$</span>
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              {metrics.revenueGrowth >= 0 ? (
                <span>📈</span>
              ) : (
                <span>📉</span>
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(metrics.revenueGrowth)}%
              </span>
              <span className='text-sm text-gray-600 dark:text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Orders</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{metrics.orders}</p>
              </div>
              <div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                <span>🛒</span>
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              {metrics.orderGrowth >= 0 ? (
                <span>📈</span>
              ) : (
                <span>📉</span>
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(metrics.orderGrowth)}%
              </span>
              <span className='text-sm text-gray-600 dark:text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Active Suppliers
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {metrics.suppliers}
                </p>
              </div>
              <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                <span>👤</span>
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              {metrics.supplierGrowth >= 0 ? (
                <span>📈</span>
              ) : (
                <span>📉</span>
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.supplierGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(metrics.supplierGrowth)}%
              </span>
              <span className='text-sm text-gray-600 dark:text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>Active RFQs</p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>{metrics.rfqs}</p>
              </div>
              <div className='p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg'>
                <span>📄</span>
              </div>
            </div>
            <div className='mt-4 flex items-center'>
              {metrics.rfqGrowth >= 0 ? (
                <span>📈</span>
              ) : (
                <span>📉</span>
              )}
              <span
                className={`text-sm font-medium ${
                  metrics.rfqGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(metrics.rfqGrowth)}%
              </span>
              <span className='text-sm text-gray-600 dark:text-gray-400 ml-2'>vs last month</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <button className='bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg group'>
            <div className='flex items-center'>
              <span>🎤</span>
              <div className='text-left'>
                <div className='font-bold'>Voice RFQ</div>
                <div className='text-sm opacity-90'>Speak your requirements</div>
              </div>
            </div>
          </button>

          <button className='bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg group'>
            <div className='flex items-center'>
              <Brain className='h-8 w-8 mr-3 group-hover:scale-110 transition-transform' />
              <div className='text-left'>
                <div className='font-bold'>AI Matching</div>
                <div className='text-sm opacity-90'>Smart supplier search</div>
              </div>
            </div>
          </button>

          <button className='bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg group'>
            <div className='flex items-center'>
              <span>🎥</span>
              <div className='text-left'>
                <div className='font-bold'>Video RFQ</div>
                <div className='text-sm opacity-90'>Record requirements</div>
              </div>
            </div>
          </button>

          <button className='bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg group'>
            <div className='flex items-center'>
              <span>➕</span>
              <div className='text-left'>
                <div className='font-bold'>Create RFQ</div>
                <div className='text-sm opacity-90'>Traditional form</div>
              </div>
            </div>
          </button>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Revenue Trend Chart */}
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Revenue Trend</h3>
              <span>📊</span>
            </div>
            <div className='h-64'>
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>

          {/* Order Distribution */}
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Order Distribution
              </h3>
              <span>🥧</span>
            </div>
            <div className='h-64'>
              <Doughnut data={orderData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Supplier Performance
            </h3>
            <span>👤</span>
          </div>
          <div className='h-64'>
            <Bar data={supplierData} options={chartOptions} />
          </div>
        </div>

        {/* AI Insights */}
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6'>
          <div className='flex items-center mb-4'>
            <Brain className='h-6 w-6 text-blue-600 mr-3' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>AI Insights</h3>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Market Prediction</div>
              <div className='font-semibold text-gray-900 dark:text-white'>
                Electronics demand +15% next month
              </div>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Cost Optimization</div>
              <div className='font-semibold text-gray-900 dark:text-white'>
                Switch to Supplier A saves 12%
              </div>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
              <div className='text-sm text-gray-600 dark:text-gray-400 mb-1'>Risk Alert</div>
              <div className='font-semibold text-gray-900 dark:text-white'>
                Monitor Supplier C delivery delays
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
