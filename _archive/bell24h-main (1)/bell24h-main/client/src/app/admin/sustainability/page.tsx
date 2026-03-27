'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf,
  TreePine,
  Recycle,
  Sun,
  Wind,
  Droplets,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Settings,
  RefreshCw,
  BarChart3,
  Globe,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';

// Mock sustainability data
const mockSustainabilityData = {
  metrics: [
    {
      id: 'carbon-footprint',
      name: 'Carbon Footprint',
      value: 125.6,
      unit: 'kg CO2',
      period: 'month',
      trend: 'down',
      change: -12.5,
      target: 100,
      status: 'on_track',
      description: 'Total carbon emissions from hosting and operations',
    },
    {
      id: 'energy-consumption',
      name: 'Energy Consumption',
      value: 2450,
      unit: 'kWh',
      period: 'month',
      trend: 'down',
      change: -8.2,
      target: 2000,
      status: 'on_track',
      description: 'Total energy consumption across all servers',
    },
    {
      id: 'renewable-energy',
      name: 'Renewable Energy',
      value: 95.2,
      unit: '%',
      period: 'month',
      trend: 'up',
      change: 2.1,
      target: 100,
      status: 'excellent',
      description: 'Percentage of energy from renewable sources',
    },
    {
      id: 'water-usage',
      name: 'Water Usage',
      value: 1250,
      unit: 'liters',
      period: 'month',
      trend: 'down',
      change: -15.3,
      target: 1000,
      status: 'needs_improvement',
      description: 'Water consumption for cooling and operations',
    },
    {
      id: 'waste-reduction',
      name: 'Waste Reduction',
      value: 78.5,
      unit: '%',
      period: 'month',
      trend: 'up',
      change: 5.2,
      target: 85,
      status: 'good',
      description: 'Percentage of waste diverted from landfills',
    },
    {
      id: 'paperless-operations',
      name: 'Paperless Operations',
      value: 98.7,
      unit: '%',
      period: 'month',
      trend: 'up',
      change: 1.2,
      target: 100,
      status: 'excellent',
      description: 'Percentage of operations conducted digitally',
    },
  ],
  initiatives: [
    {
      id: 'init-001',
      name: 'Green Hosting Migration',
      status: 'completed',
      impact: 'high',
      description: 'Migrated all servers to renewable energy providers',
      startDate: '2024-06-01',
      endDate: '2024-08-15',
      carbonReduction: 45.2,
      costSavings: 12500,
    },
    {
      id: 'init-002',
      name: 'Paperless Documentation',
      status: 'in_progress',
      impact: 'medium',
      description: 'Digitizing all paper-based processes and documentation',
      startDate: '2024-07-01',
      endDate: '2024-12-31',
      carbonReduction: 12.8,
      costSavings: 8500,
    },
    {
      id: 'init-003',
      name: 'Energy-Efficient Hardware',
      status: 'planned',
      impact: 'high',
      description: 'Upgrading to energy-efficient servers and equipment',
      startDate: '2024-10-01',
      endDate: '2025-03-31',
      carbonReduction: 35.6,
      costSavings: 18000,
    },
    {
      id: 'init-004',
      name: 'Carbon Offset Program',
      status: 'active',
      impact: 'high',
      description: 'Investing in carbon offset projects for unavoidable emissions',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      carbonReduction: 60.0,
      costSavings: 0,
    },
  ],
  socialImpact: [
    {
      id: 'social-001',
      name: 'SMEs Supported',
      value: 1247,
      unit: 'companies',
      description: 'Number of small and medium enterprises using the platform',
      impact: 'economic_growth',
    },
    {
      id: 'social-002',
      name: 'Jobs Created',
      value: 3456,
      unit: 'jobs',
      description: 'Estimated jobs created through platform transactions',
      impact: 'employment',
    },
    {
      id: 'social-003',
      name: 'Rural SMEs',
      value: 456,
      unit: 'companies',
      description: 'Number of rural SMEs connected to urban markets',
      impact: 'rural_development',
    },
    {
      id: 'social-004',
      name: 'Women-led Businesses',
      value: 234,
      unit: 'companies',
      description: 'Number of women-led businesses on the platform',
      impact: 'gender_equality',
    },
  ],
  reports: [
    {
      id: 'report-001',
      name: 'Monthly Sustainability Report',
      type: 'monthly',
      status: 'published',
      date: '2024-09-01',
      downloads: 45,
      keyFindings: [
        'Carbon footprint reduced by 12.5%',
        'Renewable energy usage increased to 95.2%',
        'Water consumption decreased by 15.3%',
      ],
    },
    {
      id: 'report-002',
      name: 'Quarterly Impact Assessment',
      type: 'quarterly',
      status: 'draft',
      date: '2024-10-01',
      downloads: 0,
      keyFindings: [
        'Social impact metrics improved across all categories',
        'Environmental initiatives showing positive results',
        'Cost savings from sustainability measures exceeded targets',
      ],
    },
  ],
  stats: {
    totalInitiatives: 8,
    completedInitiatives: 3,
    activeInitiatives: 4,
    plannedInitiatives: 1,
    totalCarbonReduction: 153.6,
    totalCostSavings: 39000,
    averageImpactScore: 8.2,
  },
};

export default function SustainabilityMetricsPage() {
  const [activeTab, setActiveTab] = useState('metrics');
  const [data, setData] = useState(mockSustainabilityData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'good':
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'on_track':
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement':
      case 'planned':
        return 'text-orange-600 bg-orange-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'good':
      case 'active':
        return <Sun className="w-4 h-4" />;
      case 'on_track':
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'needs_improvement':
      case 'planned':
        return <AlertTriangle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'economic_growth':
        return <DollarSign className="w-4 h-4" />;
      case 'employment':
        return <Users className="w-4 h-4" />;
      case 'rural_development':
        return <Globe className="w-4 h-4" />;
      case 'gender_equality':
        return <Users className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const filteredInitiatives = data.initiatives.filter(initiative => {
    const matchesSearch = initiative.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         initiative.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || initiative.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sustainability Metrics</h1>
          <p className="text-gray-600 mt-2">Track carbon-neutral hosting and social impact metrics for SMEs</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            New Initiative
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Carbon Reduction</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalCarbonReduction} kg</p>
              <p className="text-sm text-green-600">CO2 saved this year</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Savings</p>
              <p className="text-2xl font-bold text-gray-900">₹{data.stats.totalCostSavings.toLocaleString()}</p>
              <p className="text-sm text-green-600">From sustainability measures</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Initiatives</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.activeInitiatives}</p>
              <p className="text-sm text-gray-600">Out of {data.stats.totalInitiatives}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impact Score</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.averageImpactScore}/10</p>
              <p className="text-sm text-green-600">Overall sustainability</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'metrics', name: 'Environmental Metrics' },
              { id: 'initiatives', name: 'Initiatives' },
              { id: 'social-impact', name: 'Social Impact' },
              { id: 'reports', name: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Environmental Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.metrics.map((metric) => (
                <div key={metric.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Leaf className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}>
                      {getStatusIcon(metric.status)}
                      <span className="ml-1">{metric.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {metric.value} {metric.unit}
                      </span>
                      <div className="flex items-center">
                        {getTrendIcon(metric.trend)}
                        <span className={`ml-1 text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target</span>
                      <span className="font-medium">{metric.target} {metric.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Initiatives Tab */}
          {activeTab === 'initiatives' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search initiatives..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="active">Active</option>
                    <option value="planned">Planned</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Initiatives List */}
              <div className="space-y-4">
                {filteredInitiatives.map((initiative) => (
                  <div key={initiative.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{initiative.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(initiative.status)}`}>
                            {getStatusIcon(initiative.status)}
                            <span className="ml-1">{initiative.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            initiative.impact === 'high' ? 'text-red-600 bg-red-100' :
                            initiative.impact === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                            'text-green-600 bg-green-100'
                          }`}>
                            {initiative.impact} impact
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{initiative.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start Date</span>
                            <p className="font-medium">{new Date(initiative.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">End Date</span>
                            <p className="font-medium">{new Date(initiative.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Carbon Reduction</span>
                            <p className="font-medium text-green-600">{initiative.carbonReduction} kg CO2</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Cost Savings</span>
                            <p className="font-medium text-blue-600">₹{initiative.costSavings.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Social Impact Tab */}
          {activeTab === 'social-impact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.socialImpact.map((impact) => (
                <div key={impact.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      {getImpactIcon(impact.impact)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{impact.name}</h3>
                      <p className="text-sm text-gray-600">{impact.description}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {impact.value.toLocaleString()} {impact.unit}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {impact.impact.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {data.reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                          {report.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">Published on {new Date(report.date).toLocaleDateString()}</p>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Findings:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {report.keyFindings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Download className="w-4 h-4 mr-1" />
                        {report.downloads} downloads
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
