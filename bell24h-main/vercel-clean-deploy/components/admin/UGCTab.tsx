'use client';

import { useState, useEffect } from 'react';

interface UGCItem {
  id: string;
  type: 'review' | 'testimonial' | 'photo' | 'video' | 'comment';
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
    role: 'buyer' | 'supplier' | 'admin';
    avatar?: string;
  };
  rating?: number;
  status: 'pending' | 'approved' | 'rejected' | 'featured';
  category: string;
  tags: string[];
  timestamp: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  mediaUrl?: string;
  relatedProduct?: string;
  relatedSupplier?: string;
}

interface UGCStats {
  totalItems: number;
  pendingReview: number;
  approvedItems: number;
  averageRating: number;
  totalEngagement: number;
}

export default function UGCTab() {
  const [ugcItems, setUgcItems] = useState<UGCItem[]>([]);
  const [stats, setStats] = useState<UGCStats>({
    totalItems: 0,
    pendingReview: 0,
    approvedItems: 0,
    averageRating: 0,
    totalEngagement: 0,
  });
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in production, this would come from your API
    const mockUGC: UGCItem[] = [
      {
        id: 'UGC-001',
        type: 'review',
        title: 'Excellent B2B Platform',
        content: 'Bell24h has revolutionized our sourcing process. The AI-powered matching is incredibly accurate and saves us hours of research.',
        author: {
          name: 'Sarah Johnson',
          email: 'sarah@techcorp.com',
          role: 'buyer',
        },
        rating: 5,
        status: 'approved',
        category: 'Platform Review',
        tags: ['AI', 'Sourcing', 'Efficiency'],
        timestamp: '2024-01-20T10:30:00Z',
        engagement: { likes: 24, shares: 8, comments: 3 },
        relatedProduct: 'AI Matching Service',
      },
      {
        id: 'UGC-002',
        type: 'testimonial',
        title: 'Increased Our Sales by 40%',
        content: 'Since joining Bell24h, we\'ve seen a 40% increase in qualified leads. The platform connects us with serious buyers.',
        author: {
          name: 'Michael Chen',
          email: 'michael@manufacturing.com',
          role: 'supplier',
        },
        rating: 5,
        status: 'featured',
        category: 'Success Story',
        tags: ['Sales', 'Growth', 'Leads'],
        timestamp: '2024-01-19T15:45:00Z',
        engagement: { likes: 45, shares: 12, comments: 7 },
        relatedSupplier: 'Tech Manufacturing Co.',
      },
      {
        id: 'UGC-003',
        type: 'photo',
        title: 'Our New Product Line',
        content: 'Showcasing our latest textile innovations. Quality materials, competitive pricing, and fast delivery.',
        author: {
          name: 'Priya Sharma',
          email: 'priya@textiles.com',
          role: 'supplier',
        },
        status: 'pending',
        category: 'Product Showcase',
        tags: ['Textiles', 'Innovation', 'Quality'],
        timestamp: '2024-01-19T12:20:00Z',
        engagement: { likes: 18, shares: 5, comments: 2 },
        mediaUrl: '/images/product-showcase.jpg',
        relatedProduct: 'Textile Products',
      },
      {
        id: 'UGC-004',
        type: 'video',
        title: 'RFQ Process Demo',
        content: 'Quick demo of how we handle RFQs on Bell24h. Streamlined process from inquiry to delivery.',
        author: {
          name: 'David Wilson',
          email: 'david@logistics.com',
          role: 'supplier',
        },
        status: 'approved',
        category: 'Process Demo',
        tags: ['RFQ', 'Process', 'Demo'],
        timestamp: '2024-01-18T14:30:00Z',
        engagement: { likes: 32, shares: 15, comments: 9 },
        mediaUrl: '/videos/rfq-demo.mp4',
        relatedProduct: 'RFQ Service',
      },
      {
        id: 'UGC-005',
        type: 'comment',
        title: 'Great Customer Support',
        content: 'The customer support team was incredibly helpful when we had issues with our first order. Quick response and resolution.',
        author: {
          name: 'Lisa Anderson',
          email: 'lisa@retail.com',
          role: 'buyer',
        },
        rating: 4,
        status: 'approved',
        category: 'Support Feedback',
        tags: ['Support', 'Customer Service', 'Helpful'],
        timestamp: '2024-01-18T09:15:00Z',
        engagement: { likes: 12, shares: 2, comments: 1 },
      },
    ];

    setUgcItems(mockUGC);

    // Calculate stats
    const totalItems = mockUGC.length;
    const pendingReview = mockUGC.filter(item => item.status === 'pending').length;
    const approvedItems = mockUGC.filter(item => item.status === 'approved' || item.status === 'featured').length;
    const ratings = mockUGC.filter(item => item.rating).map(item => item.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
    const totalEngagement = mockUGC.reduce((sum, item) => 
      sum + item.engagement.likes + item.engagement.shares + item.engagement.comments, 0);

    setStats({
      totalItems,
      pendingReview,
      approvedItems,
      averageRating,
      totalEngagement,
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'featured': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'testimonial': return 'bg-green-100 text-green-800';
      case 'photo': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'comment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'buyer': return 'bg-blue-100 text-blue-800';
      case 'supplier': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUGC = ugcItems.filter(item => {
    const matchesStatus = filter === 'all' || item.status === filter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setUgcItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus as any } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Generated Content</h2>
          <p className="text-gray-600">Manage reviews, testimonials, and user content</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Content
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEngagement}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="featured">Featured</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="review">Reviews</option>
              <option value="testimonial">Testimonials</option>
              <option value="photo">Photos</option>
              <option value="video">Videos</option>
              <option value="comment">Comments</option>
            </select>
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* UGC Items */}
      <div className="space-y-4">
        {filteredUGC.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{item.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By: {item.author.name}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(item.author.role)}`}>
                    {item.author.role}
                  </span>
                  {item.rating && (
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      <span>{item.rating}/5</span>
                    </div>
                  )}
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {item.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(item.id, 'approved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {item.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(item.id, 'featured')}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Feature
                  </button>
                )}
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  View Details
                </button>
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

            {/* Engagement Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>👍 {item.engagement.likes}</span>
              <span>🔄 {item.engagement.shares}</span>
              <span>💬 {item.engagement.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
