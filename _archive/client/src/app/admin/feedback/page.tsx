'use client';

import React, { useState, useEffect } from 'react';

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  company: string;
  type: string;
  rating: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  submittedAt: string;
  tags: string[];
  votes: number;
  comments: number;
}
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  Download,
  Eye,
  Reply,
  Flag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

// Mock feedback data
const mockFeedbackData = {
  feedback: [
    {
      id: 'FB-001',
      userId: 'USR-123',
      userName: 'Rajesh Kumar',
      company: 'SteelWorks Ltd',
      type: 'feature_request',
      rating: 5,
      title: 'Great platform, need mobile app',
      description: 'The platform is excellent for finding suppliers. Would love to see a mobile app for easier access on the go.',
      status: 'new',
      priority: 'medium',
      category: 'Product',
      submittedAt: '2024-09-28T10:30:00Z',
      tags: ['mobile', 'app', 'convenience'],
      votes: 12,
      comments: 3,
    },
    {
      id: 'FB-002',
      userId: 'USR-456',
      userName: 'Priya Sharma',
      company: 'AutoParts Inc',
      type: 'bug_report',
      rating: 2,
      title: 'Payment gateway issue',
      description: 'Payment is failing when trying to process through Razorpay. Getting error code 500.',
      status: 'in_progress',
      priority: 'high',
      category: 'Technical',
      submittedAt: '2024-09-27T14:20:00Z',
      tags: ['payment', 'razorpay', 'error'],
      votes: 8,
      comments: 1,
    },
    {
      id: 'FB-003',
      userId: 'USR-789',
      userName: 'Amit Patel',
      company: 'TechSolutions',
      type: 'general_feedback',
      rating: 4,
      title: 'Supplier verification process',
      description: 'The supplier verification process is good but takes too long. Can we speed it up?',
      status: 'resolved',
      priority: 'low',
      category: 'Process',
      submittedAt: '2024-09-25T09:15:00Z',
      tags: ['verification', 'process', 'speed'],
      votes: 5,
      comments: 2,
    },
  ],
  surveys: [
    {
      id: 'SUR-001',
      title: 'Platform Satisfaction Survey',
      responses: 1247,
      completionRate: 78.5,
      averageRating: 4.2,
      status: 'active',
      createdAt: '2024-09-20T10:00:00Z',
      questions: 10,
    },
    {
      id: 'SUR-002',
      title: 'Feature Request Priority',
      responses: 892,
      completionRate: 65.2,
      averageRating: 3.8,
      status: 'completed',
      createdAt: '2024-09-15T14:30:00Z',
      questions: 8,
    },
  ],
  stats: {
    totalFeedback: 3456,
    newFeedback: 89,
    inProgress: 156,
    resolved: 3211,
    averageRating: 4.1,
    responseRate: 72.5,
    satisfactionScore: 8.2,
    totalSurveys: 12,
  },
};

export default function FeedbackSystemPage() {
  const [activeTab, setActiveTab] = useState('feedback');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [data, setData] = useState(mockFeedbackData);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const handleSelectFeedback = (item: FeedbackItem) => {
    setSelectedFeedback(item);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 bg-blue-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feature_request':
        return <Star className="w-4 h-4" />;
      case 'bug_report':
        return <AlertTriangle className="w-4 h-4" />;
      case 'general_feedback':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredFeedback = data.feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback System</h1>
          <p className="text-gray-600 mt-2">Collect, analyze, and act on user feedback to improve the platform</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Survey
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
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalFeedback}</p>
              <p className="text-sm text-blue-600">{data.stats.newFeedback} New</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.averageRating}</p>
              <p className="text-sm text-green-600">Out of 5 stars</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.satisfactionScore}</p>
              <p className="text-sm text-green-600">Out of 10</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.responseRate}%</p>
              <p className="text-sm text-gray-600">Survey completion</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'feedback', name: 'Feedback', count: data.stats.totalFeedback },
              { id: 'surveys', name: 'Surveys', count: data.stats.totalSurveys },
              { id: 'analytics', name: 'Analytics', count: null },
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
                {tab.count && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search feedback, users, companies..."
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
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Feedback List */}
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(item.type)}
                            <span className="text-sm text-gray-600 capitalize">{item.type.replace('_', ' ')}</span>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {item.userName} ({item.company})
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {item.rating}/5
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {item.votes} votes
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleSelectFeedback(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Reply className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Flag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Surveys Tab */}
          {activeTab === 'surveys' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.surveys.map((survey) => (
                  <div key={survey.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{survey.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        survey.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {survey.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Responses</span>
                        <span className="font-medium">{survey.responses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium">{survey.completionRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average Rating</span>
                        <span className="font-medium">{survey.averageRating}/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Questions</span>
                        <span className="font-medium">{survey.questions}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
                          View Results
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-medium">+15.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">2.3 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolution Rate</span>
                      <span className="font-medium">92.8%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Technical</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Process</span>
                      <span className="font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Feedback Details</h3>
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedFeedback.title}</h4>
                <p className="text-gray-600">{selectedFeedback.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-sm text-gray-900">{selectedFeedback.userName} ({selectedFeedback.company})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <p className="text-sm text-gray-900">{selectedFeedback.rating}/5 stars</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="text-sm text-gray-900">{selectedFeedback.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className="text-sm text-gray-900">{selectedFeedback.priority}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Submitted</label>
                  <p className="text-sm text-gray-900">{new Date(selectedFeedback.submittedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Votes</label>
                  <p className="text-sm text-gray-900">{selectedFeedback.votes}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedFeedback.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Comments ({selectedFeedback.comments})</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">No comments yet. Be the first to comment!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
