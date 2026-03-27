'use client';

import { useState, useEffect } from 'react';
import RealTimeMetrics from './RealTimeMetrics';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

interface AnalyticsDashboardProps {
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

export default function AnalyticsDashboard({ timeRange = '7d' }: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [topPages, setTopPages] = useState<Array<{page: string, views: number, bounceRate: number}>>([]);
  const [userSegments, setUserSegments] = useState<Array<{segment: string, count: number, percentage: number}>>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock chart data
    const labels = generateTimeLabels(selectedTimeRange);
    const mockChartData: ChartData = {
      labels,
      datasets: [
        {
          label: 'Page Views',
          data: labels.map(() => Math.floor(Math.random() * 1000) + 500),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Unique Visitors',
          data: labels.map(() => Math.floor(Math.random() * 500) + 200),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'RFQ Submissions',
          data: labels.map(() => Math.floor(Math.random() * 100) + 20),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }
      ]
    };

    setChartData(mockChartData);

    // Mock top pages data
    setTopPages([
      { page: '/marketplace', views: 15420, bounceRate: 32.5 },
      { page: '/suppliers', views: 12350, bounceRate: 28.1 },
      { page: '/rfq/create', views: 8750, bounceRate: 45.2 },
      { page: '/categories/textiles-garments', views: 6540, bounceRate: 38.7 },
      { page: '/admin', views: 2100, bounceRate: 15.3 }
    ]);

    // Mock user segments data
    setUserSegments([
      { segment: 'Buyers', count: 2450, percentage: 45.2 },
      { segment: 'Suppliers', count: 1890, percentage: 34.8 },
      { segment: 'Both', count: 1080, percentage: 20.0 }
    ]);
  };

  const generateTimeLabels = (range: string): string[] => {
    const now = new Date();
    const labels: string[] = [];
    
    switch (range) {
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i -= 2) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case '90d':
        for (let i = 89; i >= 0; i -= 7) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
    }
    
    return labels;
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive performance insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-Time Metrics */}
      <RealTimeMetrics />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Interactive Chart</p>
              <p className="text-sm text-gray-500">Chart.js integration coming soon</p>
            </div>
          </div>
        </div>

        {/* User Segments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Segments</h3>
          <div className="space-y-4">
            {userSegments.map((segment, index) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{segment.segment}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{segment.count.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">({segment.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Pages</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounce Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.map((page, index) => (
                <tr key={page.page}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.bounceRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        page.bounceRate < 30 ? 'bg-green-500' :
                        page.bounceRate < 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-sm ${
                        page.bounceRate < 30 ? 'text-green-600' :
                        page.bounceRate < 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {page.bounceRate < 30 ? 'Excellent' :
                         page.bounceRate < 50 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">🎯</span>
            <h4 className="text-lg font-medium text-blue-900">Conversion Optimization</h4>
          </div>
          <p className="text-blue-700 text-sm">
            RFQ completion rate increased by 15% this week. Consider A/B testing the form layout.
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">📈</span>
            <h4 className="text-lg font-medium text-green-900">Traffic Growth</h4>
          </div>
          <p className="text-green-700 text-sm">
            Organic traffic up 23% month-over-month. SEO improvements are showing results.
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">⚡</span>
            <h4 className="text-lg font-medium text-yellow-900">Performance Alert</h4>
          </div>
          <p className="text-yellow-700 text-sm">
            Page load times increased by 200ms. Consider optimizing images and scripts.
          </p>
        </div>
      </div>
    </div>
  );
}
