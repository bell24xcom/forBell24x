'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Target,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    activeUsers: number;
    conversionRate: number;
    avgOrderValue: number;
    customerSatisfaction: number;
  };
  trends: {
    revenue: Array<{ date: string; value: number }>;
    orders: Array<{ date: string; value: number }>;
    users: Array<{ date: string; value: number }>;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  geographicData: Array<{
    region: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
  predictions: Array<{
    metric: string;
    currentValue: number;
    predictedValue: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export default function AdvancedAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 15420000,
          totalOrders: 1247,
          activeUsers: 5340,
          conversionRate: 3.2,
          avgOrderValue: 12350,
          customerSatisfaction: 4.7,
        },
        trends: {
          revenue: generateTrendData(30, 500000, 800000),
          orders: generateTrendData(30, 30, 50),
          users: generateTrendData(30, 150, 200),
        },
        topProducts: [
          { name: 'Industrial Machinery', sales: 234, revenue: 3200000, growth: 15.2 },
          { name: 'Electronics Components', sales: 189, revenue: 2800000, growth: 8.7 },
          { name: 'Raw Materials', sales: 156, revenue: 2100000, growth: 12.4 },
          { name: 'Automotive Parts', sales: 134, revenue: 1800000, growth: 6.8 },
          { name: 'Chemical Supplies', sales: 98, revenue: 1200000, growth: 22.1 },
        ],
        customerSegments: [
          { segment: 'Enterprise', count: 45, revenue: 8500000, percentage: 55 },
          { segment: 'Mid-Market', count: 128, revenue: 4200000, percentage: 27 },
          { segment: 'SMB', count: 456, revenue: 2720000, percentage: 18 },
        ],
        geographicData: [
          { region: 'Mumbai', orders: 234, revenue: 4200000, growth: 18.5 },
          { region: 'Delhi', orders: 189, revenue: 3200000, growth: 12.3 },
          { region: 'Bangalore', orders: 156, revenue: 2800000, growth: 25.7 },
          { region: 'Chennai', orders: 134, revenue: 2400000, growth: 8.9 },
          { region: 'Hyderabad', orders: 98, revenue: 1800000, growth: 15.2 },
        ],
        predictions: [
          { metric: 'Revenue', currentValue: 15420000, predictedValue: 18200000, confidence: 94, trend: 'up' },
          { metric: 'Orders', currentValue: 1247, predictedValue: 1450, confidence: 89, trend: 'up' },
          { metric: 'Users', currentValue: 5340, predictedValue: 6200, confidence: 92, trend: 'up' },
          { metric: 'Conversion', currentValue: 3.2, predictedValue: 3.8, confidence: 87, trend: 'up' },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (days: number, min: number, max: number) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min) + min),
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return <div>No data available</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business intelligence dashboard</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              +5.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.customerSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="customers">Customer Segments</TabsTrigger>
          <TabsTrigger value="geography">Geographic Data</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <LineChart className="w-8 h-8" />
                  <span className="ml-2">Revenue Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart className="w-8 h-8" />
                  <span className="ml-2">Orders Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <TrendingUp className="w-8 h-8" />
                  <span className="ml-2">Users Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sales} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      <div className="flex items-center text-sm">
                        {getTrendIcon(product.growth > 0 ? 'up' : 'down')}
                        <span className={product.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(product.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.customerSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{segment.segment}</div>
                      <div className="text-sm text-gray-500">{segment.count} customers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(segment.revenue)}</div>
                      <div className="text-sm text-gray-500">{segment.percentage}% of total</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.geographicData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-gray-500">{region.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(region.revenue)}</div>
                      <div className="flex items-center text-sm">
                        {getTrendIcon(region.growth > 0 ? 'up' : 'down')}
                        <span className={region.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(region.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.predictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{prediction.metric}</div>
                      <div className="text-sm text-gray-500">
                        Current: {prediction.metric === 'Revenue' ? formatCurrency(prediction.currentValue) : prediction.currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {prediction.metric === 'Revenue' ? formatCurrency(prediction.predictedValue) : prediction.predictedValue.toLocaleString()}
                      </div>
                      <div className="flex items-center text-sm">
                        {getTrendIcon(prediction.trend)}
                        <span className="text-gray-500">{prediction.confidence}% confidence</span>
                      </div>
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
} 
