'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  BarChart,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalRevenue: 12500000,
    totalUsers: 1247,
    activeRFQs: 156,
    conversionRate: 23.4,
    avgOrderValue: 45000,
    monthlyGrowth: 15.2,
  },
  revenueData: [
    { month: 'Jan', revenue: 850000, orders: 45 },
    { month: 'Feb', revenue: 920000, orders: 52 },
    { month: 'Mar', revenue: 1100000, orders: 61 },
    { month: 'Apr', revenue: 1250000, orders: 68 },
    { month: 'May', revenue: 1380000, orders: 72 },
    { month: 'Jun', revenue: 1520000, orders: 78 },
    { month: 'Jul', revenue: 1680000, orders: 85 },
    { month: 'Aug', revenue: 1850000, orders: 92 },
    { month: 'Sep', revenue: 2100000, orders: 98 },
  ],
  userGrowth: [
    { month: 'Jan', users: 450, suppliers: 280, buyers: 170 },
    { month: 'Feb', users: 520, suppliers: 320, buyers: 200 },
    { month: 'Mar', users: 610, suppliers: 380, buyers: 230 },
    { month: 'Apr', users: 720, suppliers: 450, buyers: 270 },
    { month: 'May', users: 850, suppliers: 520, buyers: 330 },
    { month: 'Jun', users: 980, suppliers: 610, buyers: 370 },
    { month: 'Jul', users: 1120, suppliers: 700, buyers: 420 },
    { month: 'Aug', users: 1280, suppliers: 800, buyers: 480 },
    { month: 'Sep', users: 1247, suppliers: 847, buyers: 400 },
  ],
  categoryPerformance: [
    { category: 'Electronics', revenue: 3200000, orders: 45, growth: 12.5 },
    { category: 'Manufacturing', revenue: 2800000, orders: 38, growth: 8.2 },
    { category: 'Textiles', revenue: 2100000, orders: 32, growth: 15.8 },
    { category: 'Chemicals', revenue: 1800000, orders: 28, growth: 6.4 },
    { category: 'Healthcare', revenue: 1500000, orders: 25, growth: 22.1 },
    { category: 'Automotive', revenue: 1100000, orders: 18, growth: 4.7 },
  ],
  topSuppliers: [
    { name: 'TechCorp Industries', revenue: 450000, orders: 12, rating: 4.9 },
    { name: 'Global Manufacturing', revenue: 380000, orders: 10, rating: 4.8 },
    { name: 'SteelCorp Solutions', revenue: 320000, orders: 8, rating: 4.7 },
    { name: 'ChemTech Ltd', revenue: 280000, orders: 7, rating: 4.6 },
    { name: 'AutoParts Inc', revenue: 250000, orders: 6, rating: 4.5 },
  ],
  systemMetrics: {
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.02,
    activeWorkflows: 12,
    dataProcessed: 45678,
  },
  recentActivity: [
    { time: '2 min ago', action: 'New supplier registered', user: 'SteelCorp Ltd', type: 'success' },
    { time: '5 min ago', action: 'RFQ completed', user: 'TechCorp Industries', type: 'info' },
    { time: '8 min ago', action: 'Payment processed', user: 'Global Manufacturing', type: 'success' },
    { time: '12 min ago', action: 'System maintenance', user: 'Admin', type: 'warning' },
    { time: '15 min ago', action: 'New user registered', user: 'ChemTech Ltd', type: 'success' },
  ],
};

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate live data updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          totalUsers: prev.overview.totalUsers + Math.floor(Math.random() * 2),
          activeRFQs: prev.overview.activeRFQs + Math.floor(Math.random() * 3) - 1,
          conversionRate: Math.max(20, Math.min(30, prev.overview.conversionRate + (Math.random() - 0.5) * 0.5)),
        },
        systemMetrics: {
          ...prev.systemMetrics,
          dataProcessed: prev.systemMetrics.dataProcessed + Math.floor(Math.random() * 100),
          responseTime: Math.max(200, Math.min(300, prev.systemMetrics.responseTime + (Math.random() - 0.5) * 10)),
        }
      }));
      setLastUpdated(new Date());
    }, 10000);

    return () => clearInterval(updateInterval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                Admin Analytics Dashboard
              </h1>
              <p className="text-gray-600">Real-time business intelligence and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/admin/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">← Dashboard</a>
              <a href="/admin/crm" className="text-gray-600 hover:text-gray-900 text-sm">CRM</a>
              <a href="/admin/n8n" className="text-gray-600 hover:text-gray-900 text-sm">N8N</a>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(analyticsData.overview.monthlyGrowth)}
                  <span className={`text-sm ml-1 ${getGrowthColor(analyticsData.overview.monthlyGrowth)}`}>
                    +{analyticsData.overview.monthlyGrowth}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalUsers)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(12.5)}
                  <span className="text-sm ml-1 text-green-600">+12.5%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeRFQs}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(8.2)}
                  <span className="text-sm ml-1 text-green-600">+8.2%</span>
                </div>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversionRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(2.1)}
                  <span className="text-sm ml-1 text-green-600">+2.1%</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-green-500 rounded-t w-full transition-all duration-500 hover:bg-green-600"
                    style={{ height: `${(data.revenue / 2100000) * 200}px` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                  <div className="text-xs font-medium text-gray-900">{formatCurrency(data.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Suppliers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Buyers</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end space-x-2">
              {analyticsData.userGrowth.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex items-end space-x-1">
                    <div
                      className="bg-blue-500 rounded-t w-2 transition-all duration-500 hover:bg-blue-600"
                      style={{ height: `${(data.suppliers / 847) * 150}px` }}
                    ></div>
                    <div
                      className="bg-purple-500 rounded-t w-2 transition-all duration-500 hover:bg-purple-600"
                      style={{ height: `${(data.buyers / 400) * 150}px` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                  <div className="text-xs font-medium text-gray-900">{data.users}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Category Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.categoryPerformance.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{category.category}</h4>
                    <p className="text-sm text-gray-500">{category.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(category.revenue)}</p>
                    <div className="flex items-center">
                      {getGrowthIcon(category.growth)}
                      <span className={`text-sm ml-1 ${getGrowthColor(category.growth)}`}>
                        +{category.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Metrics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                System Metrics
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="text-lg font-semibold text-green-600">{analyticsData.systemMetrics.uptime}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-lg font-semibold text-blue-600">{analyticsData.systemMetrics.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-lg font-semibold text-orange-600">{analyticsData.systemMetrics.errorRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Workflows</span>
                  <span className="text-lg font-semibold text-purple-600">{analyticsData.systemMetrics.activeWorkflows}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Processed Today</span>
                  <span className="text-lg font-semibold text-indigo-600">{formatNumber(analyticsData.systemMetrics.dataProcessed)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 10 seconds
          </p>
        </div>
      </div>
    </div>
  );
}