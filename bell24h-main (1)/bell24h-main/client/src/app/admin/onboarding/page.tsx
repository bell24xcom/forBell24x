'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Settings,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  Video,
  Globe,
  Target,
  Award,
  Calendar,
  UserPlus,
  Send,
} from 'lucide-react';

// Mock onboarding data
const mockOnboardingData = {
  programs: [
    {
      id: 'prog-001',
      name: 'SME Platform Introduction',
      type: 'interactive',
      duration: 30,
      difficulty: 'beginner',
      status: 'active',
      enrolled: 1247,
      completed: 892,
      completionRate: 71.5,
      rating: 4.2,
      lastUpdated: '2024-09-28T10:30:00Z',
      description: 'Complete guide to using BELL24h platform for SMEs',
      modules: 8,
      resources: 15,
    },
    {
      id: 'prog-002',
      name: 'RFQ Creation Masterclass',
      type: 'video',
      duration: 45,
      difficulty: 'intermediate',
      status: 'active',
      enrolled: 567,
      completed: 456,
      completionRate: 80.4,
      rating: 4.5,
      lastUpdated: '2024-09-25T14:20:00Z',
      description: 'Learn to create effective RFQs that get quality responses',
      modules: 6,
      resources: 12,
    },
    {
      id: 'prog-003',
      name: 'Supplier Verification Process',
      type: 'interactive',
      duration: 20,
      difficulty: 'beginner',
      status: 'draft',
      enrolled: 0,
      completed: 0,
      completionRate: 0,
      rating: 0,
      lastUpdated: '2024-09-20T09:15:00Z',
      description: 'Understanding supplier verification and compliance',
      modules: 4,
      resources: 8,
    },
  ],
  users: [
    {
      id: 'user-001',
      name: 'Rajesh Kumar',
      company: 'SteelWorks Ltd',
      email: 'rajesh@steelworks.com',
      phone: '+91-9876543210',
      status: 'in_progress',
      program: 'SME Platform Introduction',
      progress: 65,
      lastActivity: '2024-09-28T10:30:00Z',
      enrolledDate: '2024-09-20T10:00:00Z',
      completionDate: null,
      score: 85,
    },
    {
      id: 'user-002',
      name: 'Priya Sharma',
      company: 'AutoParts Inc',
      email: 'priya@autoparts.com',
      phone: '+91-9876543211',
      status: 'completed',
      program: 'RFQ Creation Masterclass',
      progress: 100,
      lastActivity: '2024-09-27T15:45:00Z',
      enrolledDate: '2024-09-15T14:00:00Z',
      completionDate: '2024-09-27T15:45:00Z',
      score: 92,
    },
    {
      id: 'user-003',
      name: 'Amit Patel',
      company: 'TechSolutions',
      email: 'amit@techsolutions.com',
      phone: '+91-9876543212',
      status: 'not_started',
      program: 'SME Platform Introduction',
      progress: 0,
      lastActivity: null,
      enrolledDate: '2024-09-25T11:20:00Z',
      completionDate: null,
      score: 0,
    },
  ],
  resources: [
    {
      id: 'res-001',
      title: 'Platform User Guide',
      type: 'pdf',
      size: '2.5 MB',
      downloads: 1247,
      lastUpdated: '2024-09-28T10:30:00Z',
      status: 'published',
      category: 'documentation',
    },
    {
      id: 'res-002',
      title: 'RFQ Best Practices Video',
      type: 'video',
      size: '45.2 MB',
      downloads: 892,
      lastUpdated: '2024-09-25T14:20:00Z',
      status: 'published',
      category: 'training',
    },
    {
      id: 'res-003',
      title: 'Supplier Onboarding Checklist',
      type: 'pdf',
      size: '1.8 MB',
      downloads: 567,
      lastUpdated: '2024-09-20T09:15:00Z',
      status: 'published',
      category: 'checklist',
    },
    {
      id: 'res-004',
      title: 'Platform Demo Webinar',
      type: 'video',
      size: '120.5 MB',
      downloads: 345,
      lastUpdated: '2024-09-15T16:30:00Z',
      status: 'published',
      category: 'webinar',
    },
  ],
  analytics: {
    totalPrograms: 8,
    activePrograms: 6,
    totalUsers: 3456,
    activeUsers: 2890,
    completionRate: 78.5,
    averageRating: 4.3,
    totalResources: 24,
    totalDownloads: 12567,
    averageProgress: 65.2,
  },
};

export default function OnboardingTrainingPage() {
  const [activeTab, setActiveTab] = useState('programs');
  const [data, setData] = useState(mockOnboardingData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
      case 'not_started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'draft':
      case 'not_started':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'interactive':
        return <BookOpen className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'webinar':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredPrograms = data.programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding & Training</h1>
          <p className="text-gray-600 mt-2">Manage SME onboarding workflows and training resources for platform adoption</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" />
            New Program
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.totalPrograms}</p>
              <p className="text-sm text-green-600">{data.analytics.activePrograms} Active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.activeUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Out of {data.analytics.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.completionRate}%</p>
              <p className="text-sm text-green-600">Average across programs</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.averageRating}/5</p>
              <p className="text-sm text-yellow-600">User satisfaction</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'programs', name: 'Training Programs' },
              { id: 'users', name: 'User Progress' },
              { id: 'resources', name: 'Resources' },
              { id: 'analytics', name: 'Analytics' },
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
          {/* Training Programs Tab */}
          {activeTab === 'programs' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search programs..."
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
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Programs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => (
                  <div key={program.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          {getTypeIcon(program.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                          <p className="text-sm text-gray-600">{program.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.status)}`}>
                        {getStatusIcon(program.status)}
                        <span className="ml-1">{program.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{program.duration} minutes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Difficulty</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(program.difficulty)}`}>
                          {program.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Enrolled</span>
                        <span className="font-medium">{program.enrolled.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium text-green-600">{program.completionRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rating</span>
                        <span className="font-medium">{program.rating}/5</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{program.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${program.completionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedProgram(program)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center">
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* User Progress Tab */}
          {activeTab === 'users' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users, companies..."
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
                    <option value="not_started">Not Started</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{user.company}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{user.program}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {getStatusIcon(user.status)}
                            <span className="ml-1">{user.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${user.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{user.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{user.score}/100</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.resources.map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        {getTypeIcon(resource.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{resource.category}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                      {getStatusIcon(resource.status)}
                      <span className="ml-1">{resource.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium capitalize">{resource.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium">{resource.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Downloads</span>
                      <span className="font-medium">{resource.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Completion Rate</span>
                      <span className="font-medium">78.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Rating</span>
                      <span className="font-medium">4.3/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Enrollments</span>
                      <span className="font-medium">3,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-medium">2,890</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Downloads</span>
                      <span className="font-medium">12,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Most Popular</span>
                      <span className="font-medium">Platform User Guide</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resource Types</span>
                      <span className="font-medium">PDF: 60%, Video: 40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Progress</span>
                      <span className="font-medium">65.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Program Details</h3>
              <button 
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedProgram.name}</h4>
                <p className="text-gray-600">{selectedProgram.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedProgram.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-sm text-gray-900">{selectedProgram.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Difficulty</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedProgram.difficulty}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedProgram.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Modules</label>
                  <p className="text-sm text-gray-900">{selectedProgram.modules}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Resources</label>
                  <p className="text-sm text-gray-900">{selectedProgram.resources}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Enrolled</label>
                  <p className="text-sm text-gray-900">{selectedProgram.enrolled.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Completed</label>
                  <p className="text-sm text-gray-900">{selectedProgram.completed.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
