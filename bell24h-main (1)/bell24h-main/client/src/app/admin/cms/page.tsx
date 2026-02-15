'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image,
  Video,
  Globe,
  Edit,
  Eye,
  Trash2,
  Upload,
  Download,
  Search,
  Filter,
  Settings,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Tag,
  Folder,
  Link,
  Mail,
  MessageSquare,
} from 'lucide-react';

// Mock CMS data
const mockCMSData = {
  content: [
    {
      id: 'content-001',
      title: 'Welcome to BELL24h Platform',
      type: 'page',
      status: 'published',
      category: 'homepage',
      author: 'Admin User',
      created: '2024-09-28T10:30:00Z',
      updated: '2024-09-28T10:30:00Z',
      views: 1247,
      language: 'en',
      tags: ['welcome', 'platform', 'introduction'],
      url: '/welcome',
    },
    {
      id: 'content-002',
      title: 'How to Create an RFQ',
      type: 'article',
      status: 'published',
      category: 'help',
      author: 'Content Team',
      created: '2024-09-25T14:20:00Z',
      updated: '2024-09-27T16:45:00Z',
      views: 892,
      language: 'en',
      tags: ['rfq', 'tutorial', 'guide'],
      url: '/help/create-rfq',
    },
    {
      id: 'content-003',
      title: 'Supplier Verification Process',
      type: 'video',
      status: 'draft',
      category: 'tutorial',
      author: 'Video Team',
      created: '2024-09-20T09:15:00Z',
      updated: '2024-09-22T11:30:00Z',
      views: 0,
      language: 'en',
      tags: ['supplier', 'verification', 'process'],
      url: '/tutorials/supplier-verification',
    },
    {
      id: 'content-004',
      title: 'Platform Features Overview',
      type: 'infographic',
      status: 'published',
      category: 'marketing',
      author: 'Design Team',
      created: '2024-09-15T16:30:00Z',
      updated: '2024-09-18T14:20:00Z',
      views: 567,
      language: 'en',
      tags: ['features', 'overview', 'marketing'],
      url: '/features/overview',
    },
  ],
  templates: [
    {
      id: 'template-001',
      name: 'Welcome Email Template',
      type: 'email',
      category: 'onboarding',
      status: 'active',
      usage: 1247,
      lastUsed: '2024-09-28T10:30:00Z',
      created: '2024-09-01T10:00:00Z',
      variables: ['user_name', 'company_name', 'login_url'],
    },
    {
      id: 'template-002',
      name: 'RFQ Notification Template',
      type: 'email',
      category: 'notifications',
      status: 'active',
      usage: 892,
      lastUsed: '2024-09-27T15:45:00Z',
      created: '2024-08-15T14:00:00Z',
      variables: ['rfq_title', 'supplier_name', 'deadline'],
    },
    {
      id: 'template-003',
      name: 'Payment Confirmation Template',
      type: 'email',
      category: 'payments',
      status: 'draft',
      usage: 0,
      lastUsed: null,
      created: '2024-09-20T09:15:00Z',
      variables: ['amount', 'transaction_id', 'payment_method'],
    },
  ],
  assets: [
    {
      id: 'asset-001',
      name: 'BELL24h Logo',
      type: 'image',
      size: '2.5 MB',
      format: 'PNG',
      dimensions: '1200x600',
      category: 'branding',
      status: 'active',
      uploadDate: '2024-09-28T10:30:00Z',
      usage: 45,
      alt: 'BELL24h Platform Logo',
    },
    {
      id: 'asset-002',
      name: 'Platform Demo Video',
      type: 'video',
      size: '45.2 MB',
      format: 'MP4',
      dimensions: '1920x1080',
      category: 'marketing',
      status: 'active',
      uploadDate: '2024-09-25T14:20:00Z',
      usage: 23,
      alt: 'Platform demonstration video',
    },
    {
      id: 'asset-003',
      name: 'Supplier Onboarding Guide',
      type: 'document',
      size: '1.8 MB',
      format: 'PDF',
      dimensions: 'A4',
      category: 'documentation',
      status: 'active',
      uploadDate: '2024-09-20T09:15:00Z',
      usage: 67,
      alt: 'Guide for supplier onboarding process',
    },
  ],
  campaigns: [
    {
      id: 'campaign-001',
      name: 'Q4 2024 Marketing Campaign',
      type: 'email',
      status: 'active',
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      audience: 'all_users',
      sent: 1247,
      opened: 892,
      clicked: 234,
      conversion: 45,
      openRate: 71.5,
      clickRate: 18.8,
    },
    {
      id: 'campaign-002',
      name: 'New Feature Announcement',
      type: 'push',
      status: 'completed',
      startDate: '2024-09-15',
      endDate: '2024-09-20',
      audience: 'active_users',
      sent: 3456,
      opened: 2890,
      clicked: 567,
      conversion: 123,
      openRate: 83.6,
      clickRate: 16.4,
    },
  ],
  analytics: {
    totalContent: 24,
    publishedContent: 18,
    draftContent: 6,
    totalViews: 12567,
    averageViews: 524,
    totalTemplates: 12,
    activeTemplates: 8,
    totalAssets: 45,
    totalCampaigns: 8,
    activeCampaigns: 3,
  },
};

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('content');
  const [data, setData] = useState(mockCMSData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
      case 'active':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'archived':
      case 'inactive':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'page':
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'infographic':
        return <BarChart3 className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredContent = data.content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredTemplates = data.templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Manage website content, email templates, and branding assets for marketing</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            New Content
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload Asset
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.totalContent}</p>
              <p className="text-sm text-green-600">{data.analytics.publishedContent} Published</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600">All time</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.totalTemplates}</p>
              <p className="text-sm text-green-600">{data.analytics.activeTemplates} Active</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assets</p>
              <p className="text-2xl font-bold text-gray-900">{data.analytics.totalAssets}</p>
              <p className="text-sm text-gray-600">Media files</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Image className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'content', name: 'Content' },
              { id: 'templates', name: 'Templates' },
              { id: 'assets', name: 'Assets' },
              { id: 'campaigns', name: 'Campaigns' },
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
          {/* Content Tab */}
          {activeTab === 'content' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search content, tags..."
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
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="homepage">Homepage</option>
                    <option value="help">Help</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="marketing">Marketing</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Content List */}
              <div className="space-y-4">
                {filteredContent.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center">
                            {getTypeIcon(item.type)}
                            <span className="ml-2 text-sm text-gray-600 capitalize">{item.type}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4">By {item.author} • {new Date(item.updated).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {item.views} views
                          </div>
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {item.language.toUpperCase()}
                          </div>
                          <div className="flex items-center">
                            <Link className="w-4 h-4 mr-1" />
                            {item.url}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search templates..."
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

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          {getTypeIcon(template.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{template.category}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.status)}`}>
                        {getStatusIcon(template.status)}
                        <span className="ml-1">{template.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium capitalize">{template.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Usage</span>
                        <span className="font-medium">{template.usage.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Used</span>
                        <span className="font-medium">
                          {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Variables</span>
                        <span className="font-medium">{template.variables.length}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Variables:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.assets.map((asset) => (
                <div key={asset.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        {getTypeIcon(asset.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{asset.category}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                      {getStatusIcon(asset.status)}
                      <span className="ml-1">{asset.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium capitalize">{asset.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size</span>
                      <span className="font-medium">{asset.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Format</span>
                      <span className="font-medium">{asset.format}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dimensions</span>
                      <span className="font-medium">{asset.dimensions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage</span>
                      <span className="font-medium">{asset.usage} times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploaded</span>
                      <span className="font-medium">{new Date(asset.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {data.campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1">{campaign.status}</span>
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                          {campaign.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Sent</span>
                          <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Opened</span>
                          <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Clicked</span>
                          <p className="font-medium">{campaign.clicked.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversion</span>
                          <p className="font-medium">{campaign.conversion.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Open Rate</span>
                          <p className="font-medium text-green-600">{campaign.openRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Click Rate</span>
                          <p className="font-medium text-blue-600">{campaign.clickRate}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Audience</span>
                          <p className="font-medium capitalize">{campaign.audience.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversion Rate</span>
                          <p className="font-medium text-purple-600">
                            {((campaign.conversion / campaign.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Content</span>
                      <span className="font-medium">{data.analytics.totalContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Published</span>
                      <span className="font-medium text-green-600">{data.analytics.publishedContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Drafts</span>
                      <span className="font-medium text-yellow-600">{data.analytics.draftContent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Views</span>
                      <span className="font-medium">{data.analytics.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Views</span>
                      <span className="font-medium">{data.analytics.averageViews}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Campaigns</span>
                      <span className="font-medium">{data.analytics.totalCampaigns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Campaigns</span>
                      <span className="font-medium text-green-600">{data.analytics.activeCampaigns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Open Rate</span>
                      <span className="font-medium">77.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Click Rate</span>
                      <span className="font-medium">17.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Assets</span>
                      <span className="font-medium">{data.analytics.totalAssets}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
