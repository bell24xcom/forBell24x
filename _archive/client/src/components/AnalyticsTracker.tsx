'use client';

import { Activity, BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  rfqsCreated: number;
  productsUploaded: number;
  transactions: number;
  revenue: number;
}

const AnalyticsTracker = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    rfqsCreated: 0,
    productsUploaded: 0,
    transactions: 0,
    revenue: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/traffic');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: 'Total Users',
      value: analytics.totalUsers,
      icon: <Users className='w-5 h-5' />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Users',
      value: analytics.activeUsers,
      icon: <Activity className='w-5 h-5' />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'RFQs Created',
      value: analytics.rfqsCreated,
      icon: <TrendingUp className='w-5 h-5' />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Products Uploaded',
      value: analytics.productsUploaded,
      icon: <BarChart3 className='w-5 h-5' />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Transactions',
      value: analytics.transactions,
      icon: <DollarSign className='w-5 h-5' />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Revenue (₹)',
      value: analytics.revenue.toLocaleString(),
      icon: <DollarSign className='w-5 h-5' />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <BarChart3 className='w-5 h-5' />
          <h2 className='text-xl font-bold'>Live Analytics</h2>
        </div>
        <div className='animate-pulse'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='h-20 bg-gray-200 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <BarChart3 className='w-5 h-5' />
          <h2 className='text-xl font-bold'>Live Analytics</h2>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          Live
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {metrics.map((metric, index) => (
          <div key={index} className={`p-4 rounded-lg ${metric.bgColor}`}>
            <div className='flex items-center justify-between mb-2'>
              <div className={`${metric.color}`}>{metric.icon}</div>
              <span className='text-xs text-gray-500'>Real-time</span>
            </div>
            <div className='text-2xl font-bold text-gray-900'>{metric.value}</div>
            <div className='text-sm text-gray-600'>{metric.label}</div>
          </div>
        ))}
      </div>

      <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
        <div className='flex items-center gap-2 text-sm text-blue-800'>
          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
          Auto-refreshing every 30 seconds
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTracker;
