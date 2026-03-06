'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardMode } from '@/contexts/DashboardContext';
import Link from 'next/link';
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
  Star,
  Search,
  Package,
  IndianRupee,
  Users2
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
  const { mode, setMode } = useDashboardMode();
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
  const [supplierStats, setSupplierStats] = useState({
    newRfqs: 0, openQuotes: 0, dealsThisMonth: 0, revenue: 0,
    trustScore: 65, gstVerified: false, profileComplete: 40,
  });

  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('bell24h_user');

    if (!userData) {
      router.push('/auth/phone-email');
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
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-300">
              Here's what's happening with your B2B activities
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last updated</p>
            <p className="text-sm font-medium text-white">2 minutes ago</p>
          </div>
        </div>
      </div>

      {/* Buyer/Supplier Role Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('buyer')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mode === 'buyer'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          🛒 Buyer
        </button>
        <button
          onClick={() => setMode('supplier')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            mode === 'supplier'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          🏭 Supplier
        </button>
      </div>

      {/* ==================== BUYER MODE ==================== */}
      {mode === 'buyer' && (
        <>
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
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <button onClick={() => router.push('/voice-rfq')} className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    <Mic className="w-5 h-5" /> Voice RFQ
                  </button>
                  <button onClick={() => router.push('/video-rfq')} className="flex items-center gap-2 bg-white/10 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                    <Video className="w-5 h-5" /> Video RFQ
                  </button>
                  <button onClick={() => router.push('/rfq/create')} className="flex items-center gap-2 bg-white/10 text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                    <FileText className="w-5 h-5" /> Text RFQ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Buyer Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400"><FileText className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Total RFQs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRFQs}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/10 text-green-400"><CheckCircle className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Active RFQs</p>
                  <p className="text-2xl font-bold text-white">{stats.activeRFQs}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-400"><MessageSquare className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Quotes Received</p>
                  <p className="text-2xl font-bold text-white">{stats.totalQuotesReceived}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-500/10 text-orange-400"><TrendingUp className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalEarned)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/10 text-green-400"><DollarSign className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400"><TrendingUp className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.successRate}%</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400"><Award className="w-6 h-6" /></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-400">Quote Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRFQs > 0 ? Math.round((stats.totalQuotesReceived / stats.totalRFQs) * 100) : 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Recent Activity */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
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

          {/* Buyer Quick Actions */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/voice-rfq" className="flex items-center justify-center p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <Mic className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">Voice RFQ</span>
              </Link>
              <Link href="/video-rfq" className="flex items-center justify-center p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <Video className="w-5 h-5 text-purple-400 mr-2" />
                <span className="text-purple-400 font-medium">Video RFQ</span>
              </Link>
              <Link href="/rfq/create" className="flex items-center justify-center p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <FileText className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-blue-400 font-medium">Text RFQ</span>
              </Link>
              <Link href="/dashboard/quotes" className="flex items-center justify-center p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <MessageSquare className="w-5 h-5 text-orange-400 mr-2" />
                <span className="text-orange-400 font-medium">Quotes Inbox</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ==================== SUPPLIER MODE ==================== */}
      {mode === 'supplier' && (
        <>
          {/* Supplier Header + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Supplier Dashboard</h2>
              <p className="text-gray-400 mt-1">Find RFQs, submit quotes, grow your business</p>
            </div>
            <Link href="/supplier/browse-rfqs" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Browse New RFQs
            </Link>
          </div>

          {/* Supplier Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-gray-400 text-sm">New RFQs Available</p>
              <p className="text-2xl font-bold text-white mt-1">{supplierStats.newRfqs}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm">Open Quotes</p>
              <p className="text-2xl font-bold text-white mt-1">{supplierStats.openQuotes}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                <Users2 className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm">Deals This Month</p>
              <p className="text-2xl font-bold text-white mt-1">{supplierStats.dealsThisMonth}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                <IndianRupee className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-gray-400 text-sm">Revenue This Month</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(supplierStats.revenue)}</p>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Trust Score</h2>
              <Link href="/supplier/profile/edit" className="text-emerald-400 text-sm hover:text-emerald-300">
                Improve Score &rarr;
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-center flex-shrink-0">
                <p className="text-4xl font-bold text-emerald-400">{supplierStats.trustScore}</p>
                <p className="text-gray-500 text-xs mt-1">out of 100</p>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {[
                  { label: 'GST Verified', value: supplierStats.gstVerified ? 100 : 0, color: 'bg-green-500' },
                  { label: 'Response Time', value: 70, color: 'bg-blue-500' },
                  { label: 'Delivery History', value: 0, color: 'bg-purple-500' },
                  { label: 'Profile Complete', value: supplierStats.profileComplete, color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-28 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className={`${item.color} rounded-full h-2 transition-all`} style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-gray-500 text-xs w-8 text-right">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supplier Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/supplier/browse-rfqs" className="bg-gray-900 border border-emerald-800/30 hover:border-emerald-600/50 rounded-xl p-5 transition-colors group">
              <Search className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-white font-semibold">Browse RFQs</p>
              <p className="text-gray-400 text-sm mt-1">Find new business opportunities</p>
            </Link>
            <Link href="/supplier/products/showcase" className="bg-gray-900 border border-blue-800/30 hover:border-blue-600/50 rounded-xl p-5 transition-colors group">
              <Package className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-white font-semibold">Product Showcase</p>
              <p className="text-gray-400 text-sm mt-1">Display your products to buyers</p>
            </Link>
            <Link href="/supplier/profile/edit" className="bg-gray-900 border border-amber-800/30 hover:border-amber-600/50 rounded-xl p-5 transition-colors group">
              <Star className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-white font-semibold">Complete Profile</p>
              <p className="text-gray-400 text-sm mt-1">Higher trust = more deal wins</p>
            </Link>
          </div>

          {/* Two Column: Latest RFQs + Recent Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Latest RFQs</h3>
                <Link href="/supplier/browse-rfqs" className="text-emerald-400 text-sm hover:text-emerald-300">View All &rarr;</Link>
              </div>
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">New RFQs will appear here</p>
                <Link href="/supplier/browse-rfqs" className="text-emerald-400 text-sm mt-2 inline-block hover:text-emerald-300">
                  Browse All RFQs &rarr;
                </Link>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">My Recent Quotes</h3>
                <Link href="/supplier/my-quotes" className="text-blue-400 text-sm hover:text-blue-300">View All &rarr;</Link>
              </div>
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Quotes you submit will appear here</p>
                <Link href="/supplier/browse-rfqs" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300">
                  Find RFQs to Quote &rarr;
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}