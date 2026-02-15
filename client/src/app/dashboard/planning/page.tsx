'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  BarChart3,
  Users,
  Package,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Settings,
  Zap,
  Activity,
  Globe,
  Building2,
  Star,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

// Mock data
const mockPlanningData = {
  user: { name: 'Rajesh Kumar', company: 'TechCorp Industries' },
  projections: {
    revenue: { current: 1800000, projected: 2700000, change: 50 },
    suppliers: { current: 234, projected: 350, change: 49.6 },
    orders: { current: 1950, projected: 2100, change: 8 },
  },
  marketTrends: [
    { category: 'Electronics', change: 15, trend: 'up', icon: '📱' },
    { category: 'Textile Orders', change: 8, trend: 'up', icon: '👕' },
    { category: 'Chemical Supply', change: 0, trend: 'stable', icon: '🧪' },
    { category: 'Steel & Metal', change: 12, trend: 'up', icon: '🔧' },
    { category: 'Automotive', change: -3, trend: 'down', icon: '🚗' },
  ],
  aiPredictions: [
    {
      title: 'High demand expected for industrial machinery in Q2 2025',
      confidence: 87,
      impact: 'high',
      category: 'Manufacturing',
      timeline: 'Q2 2025',
    },
    {
      title: 'Seasonal surge in agricultural equipment predicted',
      confidence: 92,
      impact: 'medium',
      category: 'Agriculture',
      timeline: 'Q1 2025',
    },
    {
      title: 'Export opportunities increasing in Southeast Asia',
      confidence: 78,
      impact: 'high',
      category: 'International',
      timeline: 'Q3 2025',
    },
    {
      title: 'Steel prices expected to stabilize by year-end',
      confidence: 85,
      impact: 'medium',
      category: 'Raw Materials',
      timeline: 'Q4 2024',
    },
    {
      title: 'Digital transformation accelerating in B2B sector',
      confidence: 94,
      impact: 'high',
      category: 'Technology',
      timeline: 'Ongoing',
    },
  ],
  resourceAllocation: {
    current: {
      suppliers: 45,
      budget: 2500000,
      team: 12,
      technology: 85,
    },
    projected: {
      suppliers: 65,
      budget: 3500000,
      team: 18,
      technology: 95,
    },
  },
  teamCollaboration: {
    activeProjects: 8,
    completedThisMonth: 12,
    teamMembers: 15,
    productivity: 87,
  },
  businessAnalytics: {
    kpis: [
      { name: 'Revenue Growth', value: '24.5%', trend: 'up', change: '+3.2%' },
      { name: 'Customer Acquisition', value: '156', trend: 'up', change: '+12%' },
      { name: 'Market Share', value: '8.3%', trend: 'up', change: '+1.1%' },
      { name: 'Operational Efficiency', value: '91%', trend: 'up', change: '+2.5%' },
    ],
  },
};

// Projection Card Component
const ProjectionCard = ({ title, current, projected, change, icon: Icon, color = 'blue' }) => {
  const getTrendIcon = () => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="flex items-center text-sm">
          {getTrendIcon()}
          <span className={`ml-1 ${getTrendColor()}`}>+{change}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {typeof current === 'number' ? current.toLocaleString() : current}
        </p>
        <p className="text-sm text-gray-500">
          Projected: {typeof projected === 'number' ? projected.toLocaleString() : projected}
        </p>
      </div>
    </div>
  );
};

// Market Trend Card Component
const MarketTrendCard = ({ trend }) => {
  const getTrendIcon = () => {
    if (trend.trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (trend.trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend.trend === 'up') return 'text-green-600';
    if (trend.trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{trend.icon}</span>
          <span className="font-semibold text-gray-900">{trend.category}</span>
        </div>
        <div className="flex items-center">
          {getTrendIcon()}
          <span className={`ml-1 font-semibold ${getTrendColor()}`}>
            {trend.change > 0 ? '+' : ''}{trend.change}%
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            trend.trend === 'up' ? 'bg-green-500' : 
            trend.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
          }`}
          style={{ width: `${Math.min(Math.abs(trend.change) * 5, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// AI Prediction Card Component
const AIPredictionCard = ({ prediction }) => {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getImpactColor(prediction.impact)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{prediction.title}</h4>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="mr-4">Category: {prediction.category}</span>
            <span>Timeline: {prediction.timeline}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-600">{prediction.confidence}%</div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${prediction.confidence}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Impact: {prediction.impact}</span>
        <span className="text-blue-600 font-medium">AI Generated</span>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ kpi }) => {
  const getTrendIcon = () => {
    if (kpi.trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (kpi.trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{kpi.name}</span>
        <div className="flex items-center">
          {getTrendIcon()}
          <span className="text-xs text-gray-500 ml-1">{kpi.change}</span>
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
    </div>
  );
};

export default function PlanningPage() {
  const [activeTab, setActiveTab] = useState('demand');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(mockPlanningData);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData(mockPlanningData);
    setIsLoading(false);
  };

  const user = data.user;

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Planning</h1>
            <p className="text-gray-600 mt-1">Strategic planning and forecasting for business growth</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Plan
            </button>
          </div>
        </div>

        {/* Projection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProjectionCard
            title="Revenue Projection"
            current={data.projections.revenue.current}
            projected={data.projections.revenue.projected}
            change={data.projections.revenue.change}
            icon={DollarSign}
            color="green"
          />
          <ProjectionCard
            title="Supplier Growth"
            current={data.projections.suppliers.current}
            projected={data.projections.suppliers.projected}
            change={data.projections.suppliers.change}
            icon={Users}
            color="blue"
          />
          <ProjectionCard
            title="Order Volume"
            current={data.projections.orders.current}
            projected={data.projections.orders.projected}
            change={data.projections.orders.change}
            icon={Package}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'demand', name: 'Demand Forecasting', icon: TrendingUp },
                { id: 'resource', name: 'Resource Allocation', icon: Target },
                { id: 'team', name: 'Team Collaboration', icon: Users },
                { id: 'analytics', name: 'Business Analytics', icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Demand Forecasting Tab */}
            {activeTab === 'demand' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Market Trends</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.marketTrends.map((trend, index) => (
                      <MarketTrendCard key={index} trend={trend} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Predictions</h3>
                  <div className="space-y-4">
                    {data.aiPredictions.map((prediction, index) => (
                      <AIPredictionCard key={index} prediction={prediction} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resource Allocation Tab */}
            {activeTab === 'resource' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Resources</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Suppliers</span>
                        <span className="font-semibold">{data.resourceAllocation.current.suppliers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-semibold">₹{data.resourceAllocation.current.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Size</span>
                        <span className="font-semibold">{data.resourceAllocation.current.team}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Technology Adoption</span>
                        <span className="font-semibold">{data.resourceAllocation.current.technology}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Projected Resources</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Suppliers</span>
                        <span className="font-semibold text-blue-600">{data.resourceAllocation.projected.suppliers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Budget</span>
                        <span className="font-semibold text-blue-600">₹{data.resourceAllocation.projected.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Team Size</span>
                        <span className="font-semibold text-blue-600">{data.resourceAllocation.projected.team}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Technology</span>
                        <span className="font-semibold text-blue-600">{data.resourceAllocation.projected.technology}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Collaboration Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Active Projects</h4>
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.teamCollaboration.activeProjects}</div>
                    <div className="text-sm text-gray-600">Currently in progress</div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Completed This Month</h4>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.teamCollaboration.completedThisMonth}</div>
                    <div className="text-sm text-gray-600">Projects finished</div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Team Members</h4>
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.teamCollaboration.teamMembers}</div>
                    <div className="text-sm text-gray-600">Active contributors</div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Productivity</h4>
                      <Activity className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{data.teamCollaboration.productivity}%</div>
                    <div className="text-sm text-gray-600">Team efficiency</div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.businessAnalytics.kpis.map((kpi, index) => (
                      <KPICard key={index} kpi={kpi} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-800 font-medium">Live Planning Active</span>
            <span className="text-green-600 text-sm ml-2">• Real-time data and AI-powered insights</span>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}