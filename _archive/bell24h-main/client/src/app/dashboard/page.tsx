'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Brain,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  Heart,
  Home,
  MessageCircle,
  Mic,
  Package,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Truck,
  Users,
  Video,
  Wallet,
  Zap,
  PlusCircle,
  Lightbulb,
  Activity,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import Link from 'next/link';

// Mock data for live dashboard
const mockLiveData = {
  user: {
    name: 'Rajesh Kumar',
    role: 'Buyer',
    company: 'TechCorp Industries',
    avatar: '👤',
  },
  kpis: {
    totalRFQs: 24,
    activeMatches: 8,
    monthlyTransactions: 1250000,
    walletBalance: 45000,
    escrowBalance: 120000,
  },
  aiInsights: {
    successRate: 87,
    topMatches: [
      { name: 'SteelWorks Ltd', score: 94, category: 'Steel & Metal' },
      { name: 'AutoParts Inc', score: 89, category: 'Automotive' },
      { name: 'ChemSupply Co', score: 85, category: 'Chemicals' },
    ],
    alerts: [
      { type: 'success', message: 'RFQ #1234 received 3 new quotes' },
      { type: 'warning', message: 'Delivery delayed for Order #5678' },
      { type: 'info', message: 'Market price dropped 5% for Steel category' },
    ],
  },
  recentActivity: [
    { id: 1, type: 'rfq', title: 'Steel Rods - 1000 units', status: 'active', time: '2 hours ago' },
    { id: 2, type: 'match', title: 'New supplier match found', status: 'new', time: '4 hours ago' },
    { id: 3, type: 'payment', title: 'Payment received ₹50,000', status: 'completed', time: '1 day ago' },
    { id: 4, type: 'shipment', title: 'Order #5678 dispatched', status: 'in_transit', time: '2 days ago' },
  ],
  marketTrends: {
    steel: { change: 5.2, trend: 'up' },
    automotive: { change: -2.1, trend: 'down' },
    chemicals: { change: 1.8, trend: 'up' },
    electronics: { change: 3.4, trend: 'up' },
  },
};

// Quick KPI Card Component
const KPICard = ({ title, value, subValue, trend, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        {trend && (
          <span className={`text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      {Icon && <Icon className="w-8 h-8 text-blue-600" />}
    </div>
  </div>
);

// AI Summary Panel
const AISummaryPanel = ({ insights }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
        Today's AI Insights
      </h3>
      <a 
        href="/dashboard/ai-insights"
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View Details →
      </a>
    </div>
    
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Predicted Success Rate</span>
          <span className="text-2xl font-bold text-green-600">{insights.successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${insights.successRate}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Top Matches</h4>
        <div className="space-y-2">
          {insights.topMatches.slice(0, 2).map((match, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{match.name}</span>
              <span className="text-sm font-medium text-blue-600">{match.score}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Live Alerts</h4>
        <div className="space-y-1">
          {insights.alerts.slice(0, 2).map((alert, index) => (
            <div key={index} className={`text-xs px-2 py-1 rounded ${
              alert.type === 'success' ? 'text-green-600 bg-green-100' :
              alert.type === 'warning' ? 'text-yellow-600 bg-yellow-100' :
              'text-blue-600 bg-blue-100'
            }`}>
              {alert.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// RFQ Activity Chart Component
const RFQActivityChart = ({ rfqActivity }) => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Active RFQs',
        data: [10, 15, 8, 20, 12, 25, 18, 30, 24],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Closed RFQs',
        data: [5, 8, 4, 10, 6, 12, 9, 15, 12],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Activity Over Time</h3>
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Interactive chart will be displayed here</p>
          <p className="text-sm">Data: {JSON.stringify(rfqActivity, null, 2)}</p>
        </div>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ rfqCount: number; supplierCount: number; activeUserCount: number } | null>(null);

  // Update time every second for live feel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data?.success) setStats({ rfqCount: data.rfqCount, supplierCount: data.supplierCount, activeUserCount: data.activeUserCount });
      } catch {}
    };
    loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'new':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '📈' : '📉';
  };

  const user = mockLiveData.user;

  return (
    <UserDashboardLayout user={user}>
      <div className="w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your B2B activities today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Live Dashboard</p>
            <p className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Total RFQs" 
          value={stats ? stats.rfqCount : mockLiveData.kpis.totalRFQs} 
          subValue=""
          trend=""
          icon={FileText}
        />
        <KPICard 
          title="Suppliers" 
          value={stats ? stats.supplierCount : mockLiveData.kpis.activeMatches} 
          subValue=""
          icon={Users}
        />
        <KPICard 
          title="Active Users" 
          value={stats ? stats.activeUserCount : 0} 
          subValue=""
          icon={Activity}
        />
        <KPICard 
          title="Wallet Balance" 
          value={formatCurrency(mockLiveData.kpis.walletBalance)} 
          subValue={`Escrow: ${formatCurrency(mockLiveData.kpis.escrowBalance)}`}
          icon={Wallet}
        />
      </div>

      {/* AI Summary Panel & RFQ Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AISummaryPanel insights={mockLiveData.aiInsights} />
        <div className="lg:col-span-2">
          <RFQActivityChart rfqActivity={mockLiveData.recentActivity} />
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Live Market Trends
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(mockLiveData.marketTrends).map(([category, data]) => (
            <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 capitalize">{category}</h4>
              <div className="flex items-center justify-center mt-2">
                <span className="text-lg font-bold text-gray-900">{data.change}%</span>
                <span className="ml-2 text-lg">{getTrendIcon(data.trend)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">vs yesterday</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {mockLiveData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  {activity.type === 'rfq' && <FileText className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'match' && <Brain className="w-5 h-5 text-purple-600" />}
                  {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-green-600" />}
                  {activity.type === 'shipment' && <Truck className="w-5 h-5 text-orange-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                {activity.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions - Now Functional with Links! */}
      <div className="flex flex-wrap gap-4">
        <Link href="/rfq/create" className="flex items-center px-6 py-3 bg-[#0070f3] text-white rounded-lg hover:bg-[#0051cc] transition-colors">
          <FileText className="w-5 h-5 mr-2" />
          Create New RFQ
        </Link>
        <Link href="/dashboard/ai-features" className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Brain className="w-5 h-5 mr-2" />
          View AI Matches
        </Link>
        <Link href="/dashboard/negotiations" className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <MessageCircle className="w-5 h-5 mr-2" />
          Manage Negotiations
        </Link>
        <Link href="/dashboard/video-rfq" className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Video className="w-5 h-5 mr-2" />
          Upload Video RFQ
        </Link>
        <Link href="/wallet" className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
          <Wallet className="w-5 h-5 mr-2" />
          Manage Wallet
        </Link>
        <Link href="/dashboard/invoice-discounting" className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <CreditCard className="w-5 h-5 mr-2" />
          Invoice Discounting
        </Link>
      </div>
      </div>
    </UserDashboardLayout>
  );
}