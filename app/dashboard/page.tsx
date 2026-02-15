'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertTriangle,
  Brain,
  Video,
  MessageSquare,
  Shield,
  Wallet,
  Mic,
  FileText,
  Star
} from 'lucide-react';

interface LiveFeature {
  id: string;
  name: string;
  icon: any;
  status: 'active' | 'inactive' | 'pending';
  description: string;
  lastUsed?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRFQs: 45,
    activeRFQs: 8,
    totalSuppliers: 127,
    totalProducts: 89,
    totalSpent: 2850000,
    totalEarned: 4200000,
    successRate: 94.5,
    trustScore: 87
  });

  const [liveFeatures] = useState<LiveFeature[]>([
    {
      id: 'ai-matching',
      name: 'AI Smart Matching',
      icon: Brain,
      status: 'active',
      description: '98.5% accurate supplier matching',
      lastUsed: '2 hours ago'
    },
    {
      id: 'voice-rfq',
      name: 'Voice RFQ',
      icon: Mic,
      status: 'active',
      description: 'Create RFQs using voice commands',
      lastUsed: '1 day ago'
    },
    {
      id: 'video-rfq',
      name: 'Video RFQ',
      icon: Video,
      status: 'active',
      description: 'Video recording with AI transcription',
      lastUsed: '3 days ago'
    },
    {
      id: 'negotiation',
      name: 'AI Negotiations',
      icon: MessageSquare,
      status: 'active',
      description: 'Intelligent negotiation assistance',
      lastUsed: '1 week ago'
    },
    {
      id: 'escrow',
      name: 'Escrow Services',
      icon: Shield,
      status: 'active',
      description: 'Secure high-value transactions',
      lastUsed: '2 days ago'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      status: 'active',
      description: 'Multi-currency payment management',
      lastUsed: '1 hour ago'
    }
  ]);

  const [recentActivity] = useState<RecentActivity[]>([
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
  ]);

  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data loading - in real app, this would fetch from APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your B2B activities
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">2 minutes ago</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Trust Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.trustScore}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Features Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Features Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${feature.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Icon className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                    {feature.lastUsed && (
                      <p className="text-xs text-gray-400">Last used: {feature.lastUsed}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  feature.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {feature.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <Brain className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium">AI Smart Matching</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
            <Mic className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-600 font-medium">Voice RFQ</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            <Video className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-600 font-medium">Video RFQ</span>
          </button>
          <button className="flex items-center justify-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-600 font-medium">AI Negotiations</span>
          </button>
        </div>
      </div>
    </div>
  );
}