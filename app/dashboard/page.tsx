'use client';
import DashboardNav from '@/components/dashboard/DashboardNav';

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
    totalRFQs: 0,
    activeRFQs: 0,
    totalQuotesReceived: 0,
    totalSpent: 0,
    totalEarned: 0,
    successRate: 0,
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

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('bell24h_user');

    if (!userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      }
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
      default: return <Activity className="w-4 h-4 text-slate-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-300 bg-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DashboardNav />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasNoActivity = stats.totalRFQs === 0 && stats.totalQuotesReceived === 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-300">
              Here's what's happening with your B2B activities
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Last updated</p>
            <p className="text-sm font-medium text-white">2 minutes ago</p>
          </div>
        </div>
      </div>

      {/* Empty State CTA - Show when no activity */}
      {hasNoActivity && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Post your first RFQ in 30 seconds using voice, video, or text. Get quotes from verified suppliers across India.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/rfq/voice')}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Mic className="w-5 h-5" />
                Voice RFQ
              </button>
              <button
                onClick={() => router.push('/rfq/video')}
                className="flex items-center gap-2 bg-white/10 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <Video className="w-5 h-5" />
                Video RFQ
              </button>
              <button
                onClick={() => router.push('/rfq/create')}
                className="flex items-center gap-2 bg-white/10 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Text RFQ
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-4">
              🎯 Average response time: <span className="font-semibold">2 hours</span> • 98% supplier match rate
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-300">Total RFQs</p>
              <p className="text-2xl font-bold text-white">{stats.totalRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-300">Active RFQs</p>
              <p className="text-2xl font-bold text-white">{stats.activeRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-300">Quotes Received</p>
              <p className="text-2xl font-bold text-white">{stats.totalQuotesReceived}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-300">Total Earned</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalEarned)}</p>
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
              <p className="text-sm text-slate-300">Total Spent</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-300">Success Rate</p>
              <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-slate-300">Quote Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalRFQs > 0 ? Math.round((stats.totalQuotesReceived / stats.totalRFQs) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Features Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Live Features Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-900 transition-colors">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${feature.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Icon className="w-5 h-5 text-slate-300 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-white">{feature.name}</p>
                    <p className="text-xs text-slate-400">{feature.description}</p>
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
        <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No recent activity yet</p>
              <p className="text-sm text-gray-400 mt-1">Your activity will appear here as you use the platform</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-slate-900 rounded-lg">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.description}</p>
                  <p className="text-xs text-slate-400">{activity.timestamp}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
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