'use client';

import { useState, useEffect } from 'react';
import {
  SubscriptionBillingService,
  SUBSCRIPTION_TIERS,
  SubscriptionUtils,
} from '@/lib/subscription-billing';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  tierDistribution: Record<string, number>;
}

interface BillingEvent {
  id: string;
  type: string;
  amount: number;
  currency: string;
  customerName: string;
  createdAt: string;
  status: 'success' | 'failed' | 'pending';
}

export default function RevenueAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<BillingEvent[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadRevenueData();
  }, [timeframe]);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      // Load analytics data
      const analyticsData = await SubscriptionBillingService.getSubscriptionAnalytics(timeframe);
      setMetrics(analyticsData);

      // Load recent billing events (mock data for demo)
      const mockEvents: BillingEvent[] = [
        {
          id: '1',
          type: 'payment_succeeded',
          amount: 50000,
          currency: 'INR',
          customerName: 'Tata Steel Ltd',
          createdAt: new Date().toISOString(),
          status: 'success',
        },
        {
          id: '2',
          type: 'payment_succeeded',
          amount: 8000,
          currency: 'INR',
          customerName: 'Reliance Industries',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
        },
        {
          id: '3',
          type: 'payment_failed',
          amount: 8000,
          currency: 'INR',
          customerName: 'Mahindra Group',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          status: 'failed',
        },
      ];
      setRecentEvents(mockEvents);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportRevenueReport = async () => {
    try {
      // Generate CSV report
      const csvData = generateCSVReport(metrics, recentEvents);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const generateCSVReport = (metrics: RevenueMetrics | null, events: BillingEvent[]): string => {
    if (!metrics) return '';

    let csv = 'Bell24H Revenue Report\n\n';
    csv += 'SUMMARY METRICS\n';
    csv += `Total Revenue,${SubscriptionUtils.formatAmount(metrics.totalRevenue)}\n`;
    csv += `Monthly Recurring Revenue,${SubscriptionUtils.formatAmount(
      metrics.monthlyRecurringRevenue
    )}\n`;
    csv += `Active Subscriptions,${metrics.activeSubscriptions}\n`;
    csv += `Churn Rate,${metrics.churnRate.toFixed(2)}%\n`;
    csv += `Revenue Growth,${metrics.revenueGrowth.toFixed(2)}%\n\n`;

    csv += 'RECENT TRANSACTIONS\n';
    csv += 'Date,Customer,Type,Amount,Status\n';
    events.forEach(event => {
      csv += `${event.createdAt},${event.customerName},${
        event.type
      },${SubscriptionUtils.formatAmount(event.amount)},${event.status}\n`;
    });

    return csv;
  };

  if (loading) {
    return (
      <div className='p-8 bg-gray-50 min-h-screen'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <span>🔄</span>
            <span className='ml-3 text-lg text-gray-600'>Loading revenue analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-8 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Revenue Analytics</h1>
              <p className='text-gray-600 mt-2'>
                Track subscription revenue, billing events, and growth metrics
              </p>
            </div>

            <div className='flex items-center space-x-4'>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value as any)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='week'>Last Week</option>
                <option value='month'>Last Month</option>
                <option value='quarter'>Last Quarter</option>
                <option value='year'>Last Year</option>
              </select>

              <button
                onClick={loadRevenueData}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <span>🔄</span>
                Refresh
              </button>

              <button
                onClick={exportRevenueReport}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <span>⬇️</span>
                Export
              </button>
            </div>
          </div>

          <div className='text-sm text-gray-500 mt-2'>
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>

        {/* Key Metrics Cards */}
        {metrics && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Total Revenue</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {SubscriptionUtils.formatAmount(metrics.totalRevenue)}
                  </p>
                </div>
                <span>$</span>
              </div>
              <div className='flex items-center mt-4'>
                {metrics.revenueGrowth >= 0 ? (
                  <span>↑</span>
                ) : (
                  <span>↓</span>
                )}
                <span
                  className={`text-sm ${
                    metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {Math.abs(metrics.revenueGrowth).toFixed(1)}% vs last {timeframe}
                </span>
              </div>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Monthly Recurring Revenue</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {SubscriptionUtils.formatAmount(metrics.monthlyRecurringRevenue)}
                  </p>
                </div>
                <span>📈</span>
              </div>
              <div className='mt-4'>
                <span className='text-sm text-gray-500'>Predictable monthly income</span>
              </div>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Active Subscriptions</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {metrics.activeSubscriptions.toLocaleString()}
                  </p>
                </div>
                <span>👤</span>
              </div>
              <div className='mt-4'>
                <span className='text-sm text-gray-500'>Paying customers</span>
              </div>
            </div>

            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>Churn Rate</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {metrics.churnRate.toFixed(1)}%
                  </p>
                </div>
                <AlertCircle
                  className={`h-8 w-8 ${metrics.churnRate > 5 ? 'text-red-600' : 'text-green-600'}`}
                />
              </div>
              <div className='mt-4'>
                <span
                  className={`text-sm ${metrics.churnRate > 5 ? 'text-red-500' : 'text-green-500'}`}
                >
                  {metrics.churnRate > 5 ? 'Above industry average' : 'Below industry average'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Subscription Tier Distribution */}
          {metrics && (
            <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>Subscription Tiers</h3>
                <span>🥧</span>
              </div>

              <div className='space-y-4'>
                {Object.entries(metrics.tierDistribution).map(([tier, count]) => {
                  const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
                  const percentage =
                    metrics.activeSubscriptions > 0
                      ? (count / metrics.activeSubscriptions) * 100
                      : 0;

                  return (
                    <div key={tier} className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div
                          className={`w-4 h-4 rounded mr-3 ${
                            tier === 'FREE'
                              ? 'bg-gray-400'
                              : tier === 'PRO'
                              ? 'bg-blue-500'
                              : 'bg-purple-500'
                          }`}
                        ></div>
                        <span className='text-sm text-gray-700'>{tierConfig.name}</span>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <span className='text-sm text-gray-500'>{count} subscribers</span>
                        <span className='text-sm font-medium text-gray-900'>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Billing Events */}
          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900'>Recent Transactions</h3>
              <span>📊</span>
            </div>

            <div className='space-y-4'>
              {recentEvents.map(event => (
                <div
                  key={event.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center'>
                    {event.status === 'success' ? (
                      <span>✅</span>
                    ) : event.status === 'failed' ? (
                      <span>❌</span>
                    ) : (
                      <span>🕐</span>
                    )}
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{event.customerName}</p>
                      <p className='text-xs text-gray-500'>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-900'>
                      {SubscriptionUtils.formatAmount(event.amount)}
                    </p>
                    <p
                      className={`text-xs ${
                        event.status === 'success'
                          ? 'text-green-600'
                          : event.status === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {event.status === 'success'
                        ? 'Paid'
                        : event.status === 'failed'
                        ? 'Failed'
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-4 text-center'>
              <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                View all transactions →
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Projections */}
        {metrics && (
          <div className='mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>Revenue Projections</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center p-4 bg-blue-50 rounded-lg'>
                <p className='text-sm text-blue-600 font-medium'>Next Month Projection</p>
                <p className='text-2xl font-bold text-blue-900 mt-2'>
                  {SubscriptionUtils.formatAmount(metrics.monthlyRecurringRevenue * 1.15)}
                </p>
                <p className='text-xs text-blue-600 mt-1'>Based on current growth</p>
              </div>

              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <p className='text-sm text-green-600 font-medium'>Quarterly Goal</p>
                <p className='text-2xl font-bold text-green-900 mt-2'>
                  {SubscriptionUtils.formatAmount(metrics.monthlyRecurringRevenue * 3 * 1.25)}
                </p>
                <p className='text-xs text-green-600 mt-1'>25% growth target</p>
              </div>

              <div className='text-center p-4 bg-purple-50 rounded-lg'>
                <p className='text-sm text-purple-600 font-medium'>Annual Goal</p>
                <p className='text-2xl font-bold text-purple-900 mt-2'>₹100 Cr</p>
                <p className='text-xs text-purple-600 mt-1'>Strategic target</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
