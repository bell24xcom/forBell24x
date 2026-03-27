'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, PieChart } from 'lucide-react';

// Mock data for analytics
const analyticsData = {
  kpis: {
    totalRFQs: 156,
    activeSuppliers: 89,
    monthlyRevenue: 2450000,
    successRate: 87.5,
    avgResponseTime: '2.3 hours',
    topCategory: 'Steel & Metal'
  },
  rfqTrends: [
    { month: 'Jan', rfqs: 45, matches: 38 },
    { month: 'Feb', rfqs: 52, matches: 44 },
    { month: 'Mar', rfqs: 48, matches: 41 },
    { month: 'Apr', rfqs: 61, matches: 53 },
    { month: 'May', rfqs: 58, matches: 49 },
    { month: 'Jun', rfqs: 67, matches: 58 },
  ],
  categoryBreakdown: [
    { category: 'Steel & Metal', count: 45, percentage: 28.8 },
    { category: 'Automotive', count: 32, percentage: 20.5 },
    { category: 'Chemicals', count: 28, percentage: 17.9 },
    { category: 'Electronics', count: 24, percentage: 15.4 },
    { category: 'Textiles', count: 18, percentage: 11.5 },
    { category: 'Others', count: 9, percentage: 5.8 },
  ],
  topSuppliers: [
    { name: 'SteelWorks Ltd', rfqs: 23, successRate: 95, revenue: 450000 },
    { name: 'AutoParts Inc', rfqs: 18, successRate: 89, revenue: 320000 },
    { name: 'ChemSupply Co', rfqs: 15, successRate: 92, revenue: 280000 },
    { name: 'ElectroMax', rfqs: 12, successRate: 85, revenue: 210000 },
    { name: 'TextilePro', rfqs: 10, successRate: 88, revenue: 180000 },
  ]
};

const KPICard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        )}
              </div>
      <Icon className={`w-8 h-8 text-${color}-600`} />
            </div>
          </div>
);

const ChartCard = ({ title, children }) => (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your B2B marketplace performance</p>
              </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Refresh Data
          </button>
            </div>
          </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total RFQs"
          value={analyticsData.kpis.totalRFQs}
          change="+12% from last month"
          icon={BarChart3}
          color="blue"
        />
        <KPICard
          title="Active Suppliers"
          value={analyticsData.kpis.activeSuppliers}
          change="+8% from last month"
          icon={Users}
          color="green"
        />
        <KPICard
          title="Monthly Revenue"
          value={`₹${(analyticsData.kpis.monthlyRevenue / 100000).toFixed(1)}L`}
          change="+15% from last month"
          icon={DollarSign}
          color="purple"
        />
        <KPICard
          title="Success Rate"
          value={`${analyticsData.kpis.successRate}%`}
          change="+3% from last month"
          icon={TrendingUp}
          color="orange"
        />
          </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFQ Trends Chart */}
        <ChartCard title="RFQ Trends Over Time">
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>RFQ Trends Chart</p>
              <p className="text-sm">Interactive chart will be displayed here</p>
            </div>
          </div>
        </ChartCard>

        {/* Category Breakdown */}
        <ChartCard title="Category Breakdown">
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Category Distribution</p>
              <p className="text-sm">Interactive pie chart will be displayed here</p>
            </div>
          </div>
        </ChartCard>
        </div>

      {/* Top Suppliers Table */}
      <ChartCard title="Top Performing Suppliers">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFQs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topSuppliers.map((supplier, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {supplier.rfqs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {supplier.successRate}%
                  </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{(supplier.revenue / 100000).toFixed(1)}L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
      </ChartCard>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{analyticsData.kpis.avgResponseTime}</p>
            <p className="text-sm text-gray-500">Average response time</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Category</h3>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analyticsData.kpis.topCategory}</p>
            <p className="text-sm text-gray-500">Most active category</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Score</h3>
              <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">94</p>
            <p className="text-sm text-gray-500">Platform activity score</p>
          </div>
        </div>
      </div>
    </div>
  );
}