'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertTriangle, BarChart3, Card, CardContent, CardHeader, CardTitle, CheckCircle, Clock, DollarSign, Doughnut, Line, LineChart, Package, Pie, PieChart, PredictiveInsights, RFQAnalytics, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SupplierAnalytics, Tabs, TabsContent, TabsList, TabsTrigger, TrendingDown, TrendingUp, Users } from 'lucide-react';;;
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
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
  ArcElement,
} from 'chart.js';

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
  ArcElement
);

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface RFQAnalytics {
  totalRFQs: number;
  successRate: number;
  avgResponseTime: number;
  topCategories: Array<{ category: string; count: number; successRate: number }>;
  monthlyTrend: Array<{ month: string; rfqs: number; success: number }>;
}

interface SupplierAnalytics {
  totalSuppliers: number;
  verifiedSuppliers: number;
  avgRating: number;
  riskDistribution: Array<{ riskLevel: string; count: number; percentage: number }>;
  performanceMetrics: Array<{ metric: string; value: number; trend: 'up' | 'down' | 'stable' }>;
}

interface PredictiveInsights {
  rfqSuccessPrediction: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  recommendedCategories: string[];
  priceForecast: Array<{ date: string; predictedPrice: number; confidence: number }>;
  riskAlerts: Array<{ supplier: string; riskLevel: 'high' | 'medium' | 'low'; reason: string }>;
}

export const PredictiveAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [rfqAnalytics, setRfqAnalytics] = useState<RFQAnalytics | null>(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState<SupplierAnalytics | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch stock market data
  const fetchStockData = async () => {
    try {
      const response = await fetch('/api/analytics/stock-data');
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  // Fetch RFQ analytics
  const fetchRFQAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/rfq?timeframe=${selectedTimeframe}&category=${selectedCategory}`);
      const data = await response.json();
      setRfqAnalytics(data);
    } catch (error) {
      console.error('Error fetching RFQ analytics:', error);
    }
  };

  // Fetch supplier analytics
  const fetchSupplierAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/suppliers');
      const data = await response.json();
      setSupplierAnalytics(data);
    } catch (error) {
      console.error('Error fetching supplier analytics:', error);
    }
  };

  // Fetch predictive insights
  const fetchPredictiveInsights = async () => {
    try {
      const response = await fetch('/api/analytics/predictive');
      const data = await response.json();
      setPredictiveInsights(data);
    } catch (error) {
      console.error('Error fetching predictive insights:', error);
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStockData(),
        fetchRFQAnalytics(),
        fetchSupplierAnalytics(),
        fetchPredictiveInsights(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [selectedTimeframe, selectedCategory]);

  // Chart data for RFQ trends
  const rfqTrendData = {
    labels: rfqAnalytics?.monthlyTrend.map(item => item.month) || [],
    datasets: [
      {
        label: 'Total RFQs',
        data: rfqAnalytics?.monthlyTrend.map(item => item.rfqs) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Successful RFQs',
        data: rfqAnalytics?.monthlyTrend.map(item => item.success) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Chart data for category distribution
  const categoryData = {
    labels: rfqAnalytics?.topCategories.map(item => item.category) || [],
    datasets: [
      {
        data: rfqAnalytics?.topCategories.map(item => item.count) || [],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
        ],
      },
    ],
  };

  // Chart data for supplier risk distribution
  const riskData = {
    labels: supplierAnalytics?.riskDistribution.map(item => item.riskLevel) || [],
    datasets: [
      {
        data: supplierAnalytics?.riskDistribution.map(item => item.count) || [],
        backgroundColor: [
          '#EF4444', // High risk - red
          '#F59E0B', // Medium risk - yellow
          '#10B981', // Low risk - green
        ],
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Analytics Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics Dashboard</h1>
          <p className="text-gray-600">AI-powered insights for business growth</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="textiles">Textiles</SelectItem>
              <SelectItem value="machinery">Machinery</SelectItem>
              <SelectItem value="chemicals">Chemicals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">RFQ Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {rfqAnalytics?.successRate.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rfqAnalytics?.avgResponseTime.toFixed(1)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">-12% faster</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {supplierAnalytics?.totalSuppliers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+23 new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Trend</p>
                <p className="text-2xl font-bold text-orange-600">
                  {predictiveInsights?.marketTrend === 'bullish' ? '📈' : 
                   predictiveInsights?.marketTrend === 'bearish' ? '📉' : '➡️'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">AI Prediction</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="rfq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rfq">RFQ Analytics</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analytics</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
        </TabsList>

        {/* RFQ Analytics Tab */}
        <TabsContent value="rfq" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={rfqTrendData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Doughnut data={categoryData} options={chartOptions} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rfqAnalytics?.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{category.category}</h3>
                      <p className="text-sm text-gray-600">{category.count} RFQs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{category.successRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supplier Analytics Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={riskData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplierAnalytics?.performanceMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{metric.value.toFixed(1)}</span>
                        {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {metric.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {metric.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Success Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {predictiveInsights?.rfqSuccessPrediction.toFixed(1)}%
                  </div>
                  <p className="text-gray-600">Predicted success rate for new RFQs</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${predictiveInsights?.rfqSuccessPrediction}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictiveInsights?.recommendedCategories.map((category, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights?.riskAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    alert.riskLevel === 'high' ? 'border-red-500 bg-red-50' :
                    alert.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{alert.supplier}</h3>
                        <p className="text-sm text-gray-600">{alert.reason}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        alert.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Data Tab */}
        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockData.map((stock, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{stock.symbol}</h3>
                      <p className="text-sm text-gray-600">Volume: {stock.volume.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : }{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
