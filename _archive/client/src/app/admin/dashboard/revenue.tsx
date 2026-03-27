'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface RevenueData {
  today: number;
  week: number;
  month: number;
  total: number;
  transactions: number;
  averageOrderValue: number;
  growthRate: number;
}

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<RevenueData>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    transactions: 0,
    averageOrderValue: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch revenue data from API
    const fetchRevenue = async () => {
      try {
        // TODO: Replace with actual API endpoint
        const response = await fetch('/api/admin/revenue');
        const data = await response.json();
        setRevenue(data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
        // Use mock data for now
        setRevenue({
          today: 125000,
          week: 875000,
          month: 3500000,
          total: 12500000,
          transactions: 125,
          averageOrderValue: 100000,
          growthRate: 15.5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRevenue, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading revenue data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Today</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(revenue.today)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {revenue.transactions} transactions
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">This Week</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(revenue.week)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {((revenue.week / 7) / revenue.today) * 100 > 0 ? '↑' : '↓'} {Math.abs(((revenue.week / 7) / revenue.today) * 100 - 100).toFixed(1)}% vs daily avg
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(revenue.month)}</p>
          <p className="text-sm text-gray-400 mt-1">
            Target: {formatCurrency(10000000)} ({(revenue.month / 10000000 * 100).toFixed(1)}%)
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-indigo-600">{formatCurrency(revenue.total)}</p>
          <p className="text-sm text-gray-400 mt-1">
            Growth: {revenue.growthRate > 0 ? '↑' : '↓'} {Math.abs(revenue.growthRate).toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Average Order Value</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.averageOrderValue)}</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Target</span>
              <span className="text-gray-900 font-medium">{formatCurrency(20000)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min((revenue.averageOrderValue / 20000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Transactions</h3>
          <p className="text-2xl font-bold text-gray-900">{revenue.transactions}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Today</span>
              <span className="text-gray-900 font-medium">{revenue.transactions}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This Week</span>
              <span className="text-gray-900 font-medium">{Math.floor(revenue.transactions * 7)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">This Month</span>
              <span className="text-gray-900 font-medium">{Math.floor(revenue.transactions * 30)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Revenue Trend (Last 7 Days)</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {/* Simple bar chart - replace with actual chart library */}
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-600 rounded-t"
                style={{
                  height: `${Math.random() * 100}%`,
                  minHeight: '20px',
                }}
              />
              <span className="text-xs text-gray-500 mt-2">Day {day}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

