'use client';

import { useState, useEffect } from 'react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: 'feature' | 'improvement' | 'bug-fix' | 'integration';
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  progress: number;
  assignee: string;
  dependencies: string[];
  impact: 'high' | 'medium' | 'low';
  effort: 'small' | 'medium' | 'large' | 'epic';
  tags: string[];
}

interface RoadmapStats {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  plannedItems: number;
  completionRate: number;
  averageProgress: number;
}

export default function RoadmapTab() {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [stats, setStats] = useState<RoadmapStats>({
    totalItems: 0,
    completedItems: 0,
    inProgressItems: 0,
    plannedItems: 0,
    completionRate: 0,
    averageProgress: 0,
  });
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    // Mock data - in production, this would come from your API
    const mockRoadmap: RoadmapItem[] = [
      {
        id: 'RM-001',
        title: 'AI-Powered Supplier Matching',
        description: 'Implement advanced AI algorithms to match buyers with the most suitable suppliers based on requirements, location, and past performance.',
        category: 'feature',
        priority: 'high',
        status: 'in-progress',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        progress: 65,
        assignee: 'AI Team',
        dependencies: ['RM-002'],
        impact: 'high',
        effort: 'large',
        tags: ['AI', 'Matching', 'Core Feature'],
      },
      {
        id: 'RM-002',
        title: 'Machine Learning Model Training',
        description: 'Train and optimize ML models for supplier recommendation system.',
        category: 'feature',
        priority: 'high',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        progress: 100,
        assignee: 'ML Team',
        dependencies: [],
        impact: 'high',
        effort: 'medium',
        tags: ['ML', 'Training', 'Foundation'],
      },
      {
        id: 'RM-003',
        title: 'Mobile App Development',
        description: 'Develop native mobile applications for iOS and Android platforms.',
        category: 'feature',
        priority: 'medium',
        status: 'planned',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        progress: 0,
        assignee: 'Mobile Team',
        dependencies: ['RM-001'],
        impact: 'medium',
        effort: 'epic',
        tags: ['Mobile', 'iOS', 'Android'],
      },
      {
        id: 'RM-004',
        title: 'Payment Gateway Integration',
        description: 'Integrate multiple payment gateways for seamless transactions.',
        category: 'integration',
        priority: 'high',
        status: 'in-progress',
        startDate: '2024-01-20',
        endDate: '2024-02-28',
        progress: 40,
        assignee: 'Backend Team',
        dependencies: [],
        impact: 'high',
        effort: 'medium',
        tags: ['Payment', 'Integration', 'Fintech'],
      },
      {
        id: 'RM-005',
        title: 'Performance Optimization',
        description: 'Optimize database queries and API response times.',
        category: 'improvement',
        priority: 'medium',
        status: 'in-progress',
        startDate: '2024-01-10',
        endDate: '2024-02-10',
        progress: 80,
        assignee: 'DevOps Team',
        dependencies: [],
        impact: 'medium',
        effort: 'small',
        tags: ['Performance', 'Optimization', 'Database'],
      },
      {
        id: 'RM-006',
        title: 'Multi-language Support',
        description: 'Add support for multiple languages including Hindi, Chinese, and Spanish.',
        category: 'feature',
        priority: 'low',
        status: 'planned',
        startDate: '2024-04-01',
        endDate: '2024-05-31',
        progress: 0,
        assignee: 'Frontend Team',
        dependencies: ['RM-003'],
        impact: 'medium',
        effort: 'medium',
        tags: ['i18n', 'Localization', 'Global'],
      },
      {
        id: 'RM-007',
        title: 'Advanced Analytics Dashboard',
        description: 'Create comprehensive analytics dashboard for business insights.',
        category: 'feature',
        priority: 'medium',
        status: 'planned',
        startDate: '2024-02-15',
        endDate: '2024-04-15',
        progress: 0,
        assignee: 'Analytics Team',
        dependencies: ['RM-001'],
        impact: 'medium',
        effort: 'large',
        tags: ['Analytics', 'Dashboard', 'Insights'],
      },
      {
        id: 'RM-008',
        title: 'Bug Fix: Login Issues',
        description: 'Fix intermittent login issues reported by users.',
        category: 'bug-fix',
        priority: 'high',
        status: 'completed',
        startDate: '2024-01-18',
        endDate: '2024-01-20',
        progress: 100,
        assignee: 'QA Team',
        dependencies: [],
        impact: 'high',
        effort: 'small',
        tags: ['Bug Fix', 'Authentication', 'Critical'],
      },
    ];

    setRoadmapItems(mockRoadmap);

    // Calculate stats
    const totalItems = mockRoadmap.length;
    const completedItems = mockRoadmap.filter(item => item.status === 'completed').length;
    const inProgressItems = mockRoadmap.filter(item => item.status === 'in-progress').length;
    const plannedItems = mockRoadmap.filter(item => item.status === 'planned').length;
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const averageProgress = totalItems > 0 ? mockRoadmap.reduce((sum, item) => sum + item.progress, 0) / totalItems : 0;

    setStats({
      totalItems,
      completedItems,
      inProgressItems,
      plannedItems,
      completionRate,
      averageProgress,
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'bug-fix': return 'bg-red-100 text-red-800';
      case 'integration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'large': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'small': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = roadmapItems.filter(item => {
    const matchesStatus = filter === 'all' || item.status === filter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesStatus && matchesCategory && matchesPriority;
  });

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">369-Day Business Roadmap</h2>
          <p className="text-gray-600">Track progress and manage development priorities</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Add Item
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Roadmap
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Planned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.plannedItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageProgress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="feature">Features</option>
              <option value="improvement">Improvements</option>
              <option value="bug-fix">Bug Fixes</option>
              <option value="integration">Integrations</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Timeline View
            </button>
          </div>
        </div>
      </div>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEffortColor(item.effort)}`}>
                    {item.effort}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Assignee: {item.assignee}</span>
                  <span>Start: {new Date(item.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(item.endDate).toLocaleDateString()}</span>
                  <span className={getImpactColor(item.impact)}>
                    Impact: {item.impact}
                  </span>
                  {item.status === 'in-progress' && (
                    <span className="text-blue-600">
                      {getDaysRemaining(item.endDate)} days remaining
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{item.progress}%</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Edit
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Update Progress
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Dependencies */}
            {item.dependencies.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">Dependencies: </span>
                {item.dependencies.map((dep, index) => (
                  <span key={index} className="text-sm text-blue-600">
                    {dep}{index < item.dependencies.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
