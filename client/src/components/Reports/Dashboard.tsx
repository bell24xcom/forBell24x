'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Eye, Download, FileText, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';

interface RFQMetrics {
  total: number;
  open: number;
  closed: number;
  pending: number;
  avgResponseTime: number;
  successRate: number;
}

interface SupplierPerformance {
  total: number;
  active: number;
  verified: number;
  avgRating: number;
  topPerformers: number;
}

interface CostSavings {
  totalSavings: number;
  monthlySavings: number;
  yearOverYear: number;
  topCategories: Array<{
    category: string;
    savings: number;
    percentage: number;
  }>;
}

interface ResponseTimeAnalysis {
  avgResponseTime: number;
  responseTimeDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

interface CategoryBreakdown {
  category: string;
  rfqCount: number;
  avgBudget: number;
  successRate: number;
  supplierCount: number;
}

interface MonthlyTrends {
  month: string;
  rfqCount: number;
  avgBudget: number;
  supplierCount: number;
  successRate: number;
}

export default function ReportsAnalytics() {
  const [rfqMetrics, setRfqMetrics] = useState<RFQMetrics | null>(null);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance | null>(null);
  const [costSavings, setCostSavings] = useState<CostSavings | null>(null);
  const [responseTimeAnalysis, setResponseTimeAnalysis] = useState<ResponseTimeAnalysis | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrends[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch RFQ metrics
      const rfqResponse = await fetch('/api/analytics/rfq-metrics');
      if (rfqResponse.ok) {
        const rfqData = await rfqResponse.json();
        setRfqMetrics(rfqData);
      }

      // Fetch supplier performance
      const supplierResponse = await fetch('/api/analytics/supplier-performance');
      if (supplierResponse.ok) {
        const supplierData = await supplierResponse.json();
        setSupplierPerformance(supplierData);
      }

      // Fetch cost savings
      const savingsResponse = await fetch('/api/analytics/cost-savings');
      if (savingsResponse.ok) {
        const savingsData = await savingsResponse.json();
        setCostSavings(savingsData);
      }

      // Fetch response time analysis
      const responseResponse = await fetch('/api/analytics/response-time');
      if (responseResponse.ok) {
        const responseData = await responseResponse.json();
        setResponseTimeAnalysis(responseData);
      }

      // Fetch category breakdown
      const categoryResponse = await fetch('/api/analytics/category-breakdown');
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        setCategoryBreakdown(categoryData);
      }

      // Fetch monthly trends
      const trendsResponse = await fetch('/api/analytics/monthly-trends');
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setMonthlyTrends(trendsData);
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      // Fallback to mock data
      setRfqMetrics(generateMockRFQMetrics());
      setSupplierPerformance(generateMockSupplierPerformance());
      setCostSavings(generateMockCostSavings());
      setResponseTimeAnalysis(generateMockResponseTimeAnalysis());
      setCategoryBreakdown(generateMockCategoryBreakdown());
      setMonthlyTrends(generateMockMonthlyTrends());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRFQMetrics = (): RFQMetrics => ({
    total: 1247,
    open: 89,
    closed: 1158,
    pending: 23,
    avgResponseTime: 2.4,
    successRate: 87.3
  });

  const generateMockSupplierPerformance = (): SupplierPerformance => ({
    total: 3421,
    active: 2897,
    verified: 2156,
    avgRating: 4.2,
    topPerformers: 156
  });

  const generateMockCostSavings = (): CostSavings => ({
    totalSavings: 2847000,
    monthlySavings: 237250,
    yearOverYear: 23.5,
    topCategories: [
      { category: 'Electronics', savings: 890000, percentage: 31.3 },
      { category: 'Automotive', savings: 567000, percentage: 19.9 },
      { category: 'Machinery', savings: 423000, percentage: 14.9 },
      { category: 'Chemicals', savings: 298000, percentage: 10.5 }
    ]
  });

  const generateMockResponseTimeAnalysis = (): ResponseTimeAnalysis => ({
    avgResponseTime: 2.4,
    responseTimeDistribution: [
      { range: '0-1 days', count: 456, percentage: 39.4 },
      { range: '1-2 days', count: 298, percentage: 25.7 },
      { range: '2-3 days', count: 187, percentage: 16.1 },
      { range: '3-5 days', count: 134, percentage: 11.6 },
      { range: '5+ days', count: 83, percentage: 7.2 }
    ]
  });

  const generateMockCategoryBreakdown = (): CategoryBreakdown[] => [
    { category: 'Electronics', rfqCount: 234, avgBudget: 125000, successRate: 89.2, supplierCount: 156 },
    { category: 'Automotive', rfqCount: 189, avgBudget: 89000, successRate: 85.7, supplierCount: 134 },
    { category: 'Machinery', rfqCount: 156, avgBudget: 234000, successRate: 82.1, supplierCount: 98 },
    { category: 'Chemicals', rfqCount: 123, avgBudget: 67000, successRate: 88.6, supplierCount: 87 },
    { category: 'Textiles', rfqCount: 98, avgBudget: 45000, successRate: 91.3, supplierCount: 76 },
    { category: 'Pharmaceuticals', rfqCount: 87, avgBudget: 156000, successRate: 86.9, supplierCount: 65 }
  ];

  const generateMockMonthlyTrends = (): MonthlyTrends[] => [
    { month: 'Jan 2024', rfqCount: 89, avgBudget: 98000, supplierCount: 234, successRate: 85.2 },
    { month: 'Feb 2024', rfqCount: 92, avgBudget: 102000, supplierCount: 241, successRate: 86.7 },
    { month: 'Mar 2024', rfqCount: 95, avgBudget: 108000, supplierCount: 248, successRate: 87.1 },
    { month: 'Apr 2024', rfqCount: 98, avgBudget: 115000, supplierCount: 256, successRate: 88.3 },
    { month: 'May 2024', rfqCount: 101, avgBudget: 122000, supplierCount: 263, successRate: 89.1 },
    { month: 'Jun 2024', rfqCount: 104, avgBudget: 128000, supplierCount: 271, successRate: 89.8 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your B2B marketplace performance</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{rfqMetrics?.total.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{supplierPerformance?.active.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+8.3%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(rfqMetrics?.successRate || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2.1%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(costSavings?.totalSavings || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+23.5%</span>
            <span className="text-gray-500 ml-2">year over year</span>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFQ Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">RFQ Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Open RFQs</span>
              <span className="font-medium text-blue-600">{rfqMetrics?.open}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Closed RFQs</span>
              <span className="font-medium text-green-600">{rfqMetrics?.closed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Responses</span>
              <span className="font-medium text-yellow-600">{rfqMetrics?.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-medium text-gray-900">{rfqMetrics?.avgResponseTime} days</span>
            </div>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Suppliers</span>
              <span className="font-medium text-gray-900">{supplierPerformance?.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Suppliers</span>
              <span className="font-medium text-green-600">{supplierPerformance?.verified}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-medium text-blue-600">{supplierPerformance?.avgRating}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Top Performers</span>
              <span className="font-medium text-purple-600">{supplierPerformance?.topPerformers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Savings Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Savings by Category</h3>
        <div className="space-y-4">
          {costSavings?.topCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  index === 0 ? 'bg-yellow-400' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                }`}></div>
                <span className="font-medium text-gray-700">{category.category}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{formatCurrency(category.savings)}</div>
                <div className="text-sm text-gray-500">{formatPercentage(category.percentage)} of total</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Response Time Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Response Time Distribution</h3>
        <div className="space-y-3">
          {responseTimeAnalysis?.responseTimeDistribution.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-600 w-24">{item.range}</span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right w-20">
                <div className="font-medium text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-500">{formatPercentage(item.percentage)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suppliers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryBreakdown.map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.rfqCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(category.avgBudget)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      category.successRate >= 90 ? 'text-green-600' : 
                      category.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(category.successRate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.supplierCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
        <div className="grid grid-cols-6 gap-4">
          {monthlyTrends.map((trend, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-900">{trend.month}</div>
              <div className="text-lg font-bold text-blue-600">{trend.rfqCount}</div>
              <div className="text-xs text-gray-500">RFQs</div>
              <div className="text-sm text-gray-700">{formatCurrency(trend.avgBudget)}</div>
              <div className="text-xs text-gray-500">Avg Budget</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
