'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  topSuppliers: Array<{
    name: string;
    logo: string;
    totalSpent: number;
    orderCount: number;
    rating: number;
  }>;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
    orderCount: number;
  }>;
  supplierPerformance: Array<{
    name: string;
    logo: string;
    onTimeDelivery: number;
    qualityRating: number;
    responseTime: number;
    totalOrders: number;
  }>;
  savingsOpportunities: Array<{
    type: string;
    potentialSavings: number;
    description: string;
    action: string;
  }>;
}

export default function BuyerAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    totalSpent: 2850000,
    totalOrders: 23,
    averageOrderValue: 123913,
    topSuppliers: [
      {
        name: 'TechSupply Pro',
        logo: '🏭',
        totalSpent: 450000,
        orderCount: 5,
        rating: 4.8
      },
      {
        name: 'AutoParts Solutions',
        logo: '🚗',
        totalSpent: 750000,
        orderCount: 3,
        rating: 4.9
      },
      {
        name: 'TextileCraft Industries',
        logo: '🧵',
        totalSpent: 250000,
        orderCount: 4,
        rating: 4.7
      },
      {
        name: 'ChemCorp Industries',
        logo: '🧪',
        totalSpent: 350000,
        orderCount: 2,
        rating: 4.6
      }
    ],
    spendingByCategory: [
      { category: 'Electronics', amount: 450000, percentage: 32, color: 'bg-blue-500' },
      { category: 'Automotive', amount: 750000, percentage: 26, color: 'bg-green-500' },
      { category: 'Textiles', amount: 250000, percentage: 18, color: 'bg-purple-500' },
      { category: 'Chemicals', amount: 350000, percentage: 15, color: 'bg-orange-500' },
      { category: 'Machinery', amount: 120000, percentage: 9, color: 'bg-red-500' }
    ],
    monthlySpending: [
      { month: 'Jan', amount: 180000, orderCount: 3 },
      { month: 'Feb', amount: 220000, orderCount: 4 },
      { month: 'Mar', amount: 195000, orderCount: 3 },
      { month: 'Apr', amount: 250000, orderCount: 5 },
      { month: 'May', amount: 270000, orderCount: 4 },
      { month: 'Jun', amount: 240000, orderCount: 4 }
    ],
    supplierPerformance: [
      {
        name: 'TechSupply Pro',
        logo: '🏭',
        onTimeDelivery: 98,
        qualityRating: 4.8,
        responseTime: 2,
        totalOrders: 5
      },
      {
        name: 'AutoParts Solutions',
        logo: '🚗',
        onTimeDelivery: 95,
        qualityRating: 4.9,
        responseTime: 3,
        totalOrders: 3
      },
      {
        name: 'TextileCraft Industries',
        logo: '🧵',
        onTimeDelivery: 92,
        qualityRating: 4.7,
        responseTime: 1,
        totalOrders: 4
      },
      {
        name: 'ChemCorp Industries',
        logo: '🧪',
        onTimeDelivery: 88,
        qualityRating: 4.6,
        responseTime: 4,
        totalOrders: 2
      }
    ],
    savingsOpportunities: [
      {
        type: 'Bulk Ordering',
        potentialSavings: 150000,
        description: 'Consolidate orders with top suppliers for volume discounts',
        action: 'Contact suppliers for bulk pricing'
      },
      {
        type: 'Alternative Suppliers',
        potentialSavings: 80000,
        description: 'Switch to more competitive suppliers for non-critical items',
        action: 'Review supplier alternatives'
      },
      {
        type: 'Payment Terms',
        potentialSavings: 50000,
        description: 'Negotiate better payment terms for early payment discounts',
        action: 'Negotiate payment terms'
      },
      {
        type: 'Transportation Optimization',
        potentialSavings: 30000,
        description: 'Optimize shipping routes and consolidate deliveries',
        action: 'Review logistics strategy'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600">Start placing orders to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/supplier/dashboard" 
            className="text-amber-600 hover:text-amber-700 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Analytics</h1>
              <p className="text-gray-600">
                Track your spending patterns, supplier performance, and identify savings opportunities
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalSpent)}</p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.totalOrders}</p>
              </div>
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Order Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(analyticsData.averageOrderValue)}</p>
              </div>
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Top Suppliers</p>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.topSuppliers.length}</p>
              </div>
              <span className="text-2xl">🏭</span>
            </div>
          </div>
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
            <div className="space-y-4">
              {analyticsData.spendingByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                    <span className="font-medium text-gray-900">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(category.amount)}</p>
                    <p className="text-sm text-gray-500">{category.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Spending Trend */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
            <div className="space-y-4">
              {analyticsData.monthlySpending.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{month.month}</span>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(month.amount)}</p>
                    <p className="text-sm text-gray-500">{month.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Suppliers by Spending</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analyticsData.topSuppliers.map((supplier, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{supplier.logo}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600">{supplier.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Spent:</span>
                    <span className="font-medium">{formatCurrency(supplier.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orders:</span>
                    <span className="font-medium">{supplier.orderCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">On-Time Delivery</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Quality Rating</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Response Time</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.supplierPerformance.map((supplier, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{supplier.logo}</span>
                        <span className="font-medium text-gray-900">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.onTimeDelivery >= 95 ? 'bg-green-100 text-green-800' :
                        supplier.onTimeDelivery >= 90 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {supplier.onTimeDelivery}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">{supplier.qualityRating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-gray-600">{supplier.responseTime}hrs</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-medium text-gray-900">{supplier.totalOrders}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings Opportunities */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Savings Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.savingsOpportunities.map((opportunity, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{opportunity.type}</h4>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(opportunity.potentialSavings)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  {opportunity.action} →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/buyer/rfq/create"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Create New RFQ
          </Link>
          <Link
            href="/buyer/suppliers"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find Suppliers
          </Link>
          <Link
            href="/buyer/orders"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
} 
