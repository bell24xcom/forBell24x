'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  Zap,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface UserAnalytics {
  userId: string;
  userName: string;
  userType: 'buyer' | 'supplier' | 'enterprise';
  plan: string;
  joinDate: string;
  metrics: {
    totalRFQs: number;
    activeRFQs: number;
    completedTransactions: number;
    totalSpent: number;
    totalEarned: number;
    responseTime: number;
    successRate: number;
    trustScore: number;
    lastActivity: string;
  };
  liveFeatures: {
    aiMatching: boolean;
    voiceRFQ: boolean;
    videoRFQ: boolean;
    escrow: boolean;
    analytics: boolean;
    negotiation: boolean;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'pending' | 'failed';
  }>;
}

export default function UserAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAnalytics();
  }, [timeframe]);

  const loadUserAnalytics = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockAnalytics: UserAnalytics = {
        userId: 'user_123',
        userName: 'Enterprise User',
        userType: 'enterprise',
        plan: 'Professional',
        joinDate: '2024-01-15',
        metrics: {
          totalRFQs: 45,
          activeRFQs: 8,
          completedTransactions: 127,
          totalSpent: 2850000,
          totalEarned: 4200000,
          responseTime: 2.3,
          successRate: 94.5,
          trustScore: 87,
          lastActivity: '2 hours ago'
        },
        liveFeatures: {
          aiMatching: true,
          voiceRFQ: true,
          videoRFQ: true,
          escrow: true,
          analytics: true,
          negotiation: true
        },
        recentActivity: [
          {
            id: '1',
            type: 'rfq_created',
            description: 'Created RFQ for Industrial Steel Pipes',
            timestamp: '2 hours ago',
            status: 'success'
          },
          {
            id: '2',
            type: 'transaction_completed',
            description: 'Completed payment for Electronics Order',
            timestamp: '5 hours ago',
            status: 'success'
          },
          {
            id: '3',
            type: 'ai_matching',
            description: 'AI matched 3 suppliers for Steel RFQ',
            timestamp: '1 day ago',
            status: 'success'
          },
          {
            id: '4',
            type: 'escrow_released',
            description: 'Released escrow payment for Machinery',
            timestamp: '2 days ago',
            status: 'success'
          }
        ]
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Analytics Dashboard</h1>
            <p className="text-gray-600">Live analytics and performance metrics for {analytics.userName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.totalRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.metrics.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Trust Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.metrics.trustScore}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Features Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Features Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.liveFeatures).map(([feature, isActive]) => (
            <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium text-gray-900">{analytics.metrics.responseTime}h avg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active RFQs</span>
              <span className="text-sm font-medium text-gray-900">{analytics.metrics.activeRFQs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Transactions</span>
              <span className="text-sm font-medium text-gray-900">{analytics.metrics.completedTransactions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Earned</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(analytics.metrics.totalEarned)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Activity</span>
              <span className="text-sm font-medium text-gray-900">{analytics.metrics.lastActivity}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Profile Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">User Type</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{analytics.userType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Plan</p>
            <p className="text-lg font-semibold text-gray-900">{analytics.plan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="text-lg font-semibold text-gray-900">{analytics.joinDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
