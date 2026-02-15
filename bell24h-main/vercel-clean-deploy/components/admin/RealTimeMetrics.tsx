'use client';

import { useState, useEffect } from 'react';

interface Metric {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

interface RealTimeMetricsProps {
  refreshInterval?: number;
}

export default function RealTimeMetrics({ refreshInterval = 30000 }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time data fetching
  const fetchMetrics = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock real-time data
    const mockMetrics: Metric[] = [
      {
        id: 'active-users',
        label: 'Active Users',
        value: Math.floor(Math.random() * 1000) + 500,
        change: Math.floor(Math.random() * 20) - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '👥',
        color: 'blue'
      },
      {
        id: 'rfq-requests',
        label: 'RFQ Requests',
        value: Math.floor(Math.random() * 100) + 50,
        change: Math.floor(Math.random() * 15) - 5,
        trend: Math.random() > 0.3 ? 'up' : 'down',
        icon: '📋',
        color: 'green'
      },
      {
        id: 'revenue',
        label: 'Revenue (₹)',
        value: Math.floor(Math.random() * 1000000) + 500000,
        change: Math.floor(Math.random() * 25) - 5,
        trend: Math.random() > 0.4 ? 'up' : 'down',
        icon: '💰',
        color: 'yellow'
      },
      {
        id: 'conversion-rate',
        label: 'Conversion Rate',
        value: Math.floor(Math.random() * 20) + 5,
        change: Math.floor(Math.random() * 10) - 3,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '📈',
        color: 'purple'
      },
      {
        id: 'supplier-count',
        label: 'Active Suppliers',
        value: Math.floor(Math.random() * 500) + 200,
        change: Math.floor(Math.random() * 10) - 2,
        trend: Math.random() > 0.6 ? 'up' : 'down',
        icon: '🏭',
        color: 'indigo'
      },
      {
        id: 'response-time',
        label: 'Avg Response Time',
        value: Math.floor(Math.random() * 500) + 100,
        change: Math.floor(Math.random() * 20) - 10,
        trend: Math.random() > 0.7 ? 'down' : 'up', // Lower is better
        icon: '⚡',
        color: 'red'
      }
    ];

    setMetrics(mockMetrics);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'revenue':
        return `₹${value.toLocaleString()}`;
      case 'conversion-rate':
        return `${value}%`;
      case 'response-time':
        return `${value}ms`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string, metricId: string) => {
    if (metricId === 'response-time') {
      // For response time, down is good (green), up is bad (red)
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  if (isLoading && metrics.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Metrics</h2>
          <p className="text-gray-600">Live performance indicators</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <h3 className="text-lg font-medium text-gray-900">{metric.label}</h3>
              </div>
              <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.id)}`}>
                <span className="text-sm">{getTrendIcon(metric.trend)}</span>
                <span className="text-sm font-medium">
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
              </div>
            </div>
            
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatValue(metric.value, metric.id)}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                metric.trend === 'up' ? 'bg-green-500' : 
                metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {metric.trend === 'up' ? 'Increasing' : 
                 metric.trend === 'down' ? 'Decreasing' : 'Stable'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">API Services</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Database</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Payment Gateway</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Email Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
