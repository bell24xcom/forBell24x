'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// ─── Sub-components ──────────────────────────────────────────────────────────

const KPICard = ({ title, value, subValue, trend, icon: Icon }) => (
  <div className="bg-[#1a1d27] p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="p-3 bg-[#252836] rounded-lg">
        {Icon && <Icon className="w-6 h-6 text-blue-400" />}
      </div>
    </div>
  </div>
);

const AISummaryPanel = ({ insights }) => (
  <div className="bg-gradient-to-br from-[#1a1d27] to-[#1e2235] p-6 rounded-xl border border-blue-900/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
        AI Insights
      </h3>
      <a
        href="/dashboard/ai-features"
        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
      >
        View Details →
      </a>
    </div>

    <div className="space-y-4">
      <div className="bg-[#15171e] p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Predicted Success Rate</span>
          <span className="text-2xl font-bold text-green-400">{insights.successRate}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${insights.successRate}%` }}
          />
        </div>
      </div>

      <div className="bg-[#15171e] p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Top Supplier Matches</h4>
        <div className="space-y-2">
          {insights.topMatches.slice(0, 3).map((match, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{match.name}</span>
              <span className="text-sm font-medium text-blue-400">{match.score}% match</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#15171e] p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Live Alerts</h4>
        <div className="space-y-1">
          {insights.alerts.slice(0, 2).map((alert, index) => (
            <div
              key={index}
              className={`text-xs px-2 py-1 rounded ${
                alert.type === 'success'
                  ? 'text-green-400 bg-green-900/30'
                  : alert.type === 'warning'
                  ? 'text-yellow-400 bg-yellow-900/30'
                  : 'text-blue-400 bg-blue-900/30'
              }`}
            >
              {alert.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RFQActivityChart = ({ rfqActivity }) => (
  <div className="bg-[#1a1d27] p-6 rounded-xl border border-gray-800">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
      <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
      RFQ Activity
    </h3>
    <div className="h-48 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <Activity className="w-10 h-10 mx-auto mb-2 text-gray-600" />
        <p className="text-sm">Active RFQ chart</p>
        <p className="text-xs text-gray-600 mt-1">{rfqActivity.length} recent activities</p>
      </div>
    </div>
  </div>
);

// ─── Mock live data ──────────────────────────────────────────────────────────

const mockLiveData = {
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

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'supplier'>('buyer');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/auth/login-otp');
      return;
    }
    setIsLoading(false);
  }, [status, router]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'new':
        return 'text-green-400 bg-green-900/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'in_transit':
        return 'text-blue-400 bg-blue-900/30';
      default:
        return 'text-gray-400 bg-gray-800/50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center text-white">
        Loading Bell24h Dashboard...
      </div>
    );
  }

  const userName = session?.user?.name || session?.user?.phone?.slice(-4) || 'Partner';

  return (
    <UserDashboardLayout session={session}>
      <div className="p-6 space-y-6 bg-[#0a0b10] min-h-screen text-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Here's what's happening with your B2B activities today
            </p>
          </div>
          <div className="bg-blue-600/20 border border-blue-500/50 px-4 py-2 rounded-full text-blue-400 text-sm">
            Pilot Phase — Mumbai — Controlled live test
          </div>
        </div>

        {/* ── Buyer / Supplier Tabs ── */}
        <div className="flex gap-1 bg-[#15171e] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'buyer'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buyer View
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'supplier'
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Supplier View
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total RFQs"
            value={mockLiveData.kpis.totalRFQs}
            subValue="12 active, 12 closed"
            trend="+12% from last month"
            icon={FileText}
          />
          <KPICard
            title="Active Matches"
            value={mockLiveData.kpis.activeMatches}
            subValue="AI-powered recommendations"
            icon={Brain}
          />
          <KPICard
            title="Monthly Revenue"
            value={formatCurrency(mockLiveData.kpis.monthlyTransactions)}
            trend="+8% from last month"
            icon={DollarSign}
          />
          <KPICard
            title="Wallet Balance"
            value={formatCurrency(mockLiveData.kpis.walletBalance)}
            subValue={`Escrow: ${formatCurrency(mockLiveData.kpis.escrowBalance)}`}
            icon={Wallet}
          />
        </div>

        {/* ── AI Insights + RFQ Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AISummaryPanel insights={mockLiveData.aiInsights} />
          <div className="lg:col-span-2">
            <RFQActivityChart rfqActivity={mockLiveData.recentActivity} />
          </div>
        </div>

        {/* ── Market Trends ── */}
        <div className="bg-[#1a1d27] p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Live Market Trends
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(mockLiveData.marketTrends).map(([category, data]) => (
              <div key={category} className="text-center p-4 bg-[#15171e] rounded-lg border border-gray-800">
                <h4 className="text-sm font-medium text-gray-300 capitalize">{category}</h4>
                <div className="flex items-center justify-center mt-2">
                  <span className={`text-lg font-bold ${data.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {data.change}%
                  </span>
                  <span className="ml-2 text-lg">{data.trend === 'up' ? '📈' : '📉'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs yesterday</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="bg-[#1a1d27] p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {mockLiveData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-[#15171e] rounded-lg border border-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#252836] rounded-full flex items-center justify-center mr-4">
                    {activity.type === 'rfq' && <FileText className="w-5 h-5 text-blue-400" />}
                    {activity.type === 'match' && <Brain className="w-5 h-5 text-purple-400" />}
                    {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-green-400" />}
                    {activity.type === 'shipment' && <Truck className="w-5 h-5 text-orange-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{activity.title}</p>
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

        {/* ── Quick Actions ── */}
        <div className="flex flex-wrap gap-4">
          <Link href="/rfq/create" className="flex items-center px-6 py-3 bg-[#0070f3] text-white rounded-lg hover:bg-[#0051cc] transition-colors font-medium">
            <FileText className="w-5 h-5 mr-2" />
            Create New RFQ
          </Link>
          <Link href="/dashboard/ai-features" className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Brain className="w-5 h-5 mr-2" />
            View AI Matches
          </Link>
          <Link href="/dashboard/negotiations" className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
            <MessageCircle className="w-5 h-5 mr-2" />
            Manage Negotiations
          </Link>
          <Link href="/dashboard/video-rfq" className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
            <Video className="w-5 h-5 mr-2" />
            Upload Video RFQ
          </Link>
          <Link href="/wallet" className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
            <Wallet className="w-5 h-5 mr-2" />
            Manage Wallet
          </Link>
          <Link href="/dashboard/invoice-discounting" className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            <CreditCard className="w-5 h-5 mr-2" />
            Invoice Discounting
          </Link>
        </div>
      </div>
    </UserDashboardLayout>
  );
}
