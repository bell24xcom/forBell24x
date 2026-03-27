'use client';

import { useState, useEffect } from 'react';

interface DocItem {
  id: string;
  title: string;
  content: string;
  category: 'api' | 'user-guide' | 'admin' | 'technical' | 'business';
  type: 'documentation' | 'tutorial' | 'reference' | 'faq';
  status: 'draft' | 'published' | 'archived';
  author: string;
  lastModified: string;
  version: string;
  tags: string[];
  views: number;
  helpful: number;
}

interface DocStats {
  totalDocs: number;
  publishedDocs: number;
  draftDocs: number;
  totalViews: number;
  averageHelpfulness: number;
  mostViewed: string;
}

export default function DocsTab() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [stats, setStats] = useState<DocStats>({
    totalDocs: 0,
    publishedDocs: 0,
    draftDocs: 0,
    totalViews: 0,
    averageHelpfulness: 0,
    mostViewed: '',
  });
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Mock data - in production, this would come from your API
    const mockDocs: DocItem[] = [
      {
        id: 'DOC-001',
        title: 'API Documentation',
        content: `# Bell24h API Documentation

## Overview
The Bell24h API provides programmatic access to our B2B marketplace platform.

## Authentication
All API requests require authentication using API keys.

\`\`\`javascript
const apiKey = 'your-api-key';
const headers = {
  'Authorization': \`Bearer \${apiKey}\`,
  'Content-Type': 'application/json'
};
\`\`\`

## Endpoints

### GET /api/suppliers
Retrieve a list of suppliers.

### POST /api/rfq
Create a new RFQ.

### GET /api/categories
Get all product categories.

## Rate Limits
- 1000 requests per hour
- 100 requests per minute`,
        category: 'api',
        type: 'reference',
        status: 'published',
        author: 'API Team',
        lastModified: '2024-01-20T10:30:00Z',
        version: '1.2.0',
        tags: ['API', 'REST', 'Authentication'],
        views: 1250,
        helpful: 45,
      },
      {
        id: 'DOC-002',
        title: 'User Guide: Getting Started',
        content: `# Getting Started with Bell24h

## Welcome to Bell24h
Bell24h is a comprehensive B2B marketplace platform designed to connect buyers and suppliers.

## Creating Your Account
1. Visit the registration page
2. Choose your role (Buyer or Supplier)
3. Fill in your company details
4. Verify your email address

## First Steps
- Complete your profile
- Upload company documents
- Set up payment methods
- Start browsing or listing products

## Tips for Success
- Keep your profile updated
- Respond quickly to inquiries
- Use high-quality product images
- Provide detailed product descriptions`,
        category: 'user-guide',
        type: 'tutorial',
        status: 'published',
        author: 'Product Team',
        lastModified: '2024-01-19T15:45:00Z',
        version: '2.1.0',
        tags: ['Getting Started', 'Tutorial', 'User Guide'],
        views: 890,
        helpful: 67,
      },
      {
        id: 'DOC-003',
        title: 'Admin Panel Guide',
        content: `# Admin Panel User Guide

## Overview
The Bell24h Admin Panel provides comprehensive management tools for platform administrators.

## Key Features
- User Management
- Transaction Monitoring
- Content Moderation
- Analytics Dashboard
- System Configuration

## Navigation
The admin panel is organized into several main sections:
- Dashboard: Overview and key metrics
- Users: Manage user accounts and permissions
- Transactions: Monitor financial transactions
- Content: Moderate user-generated content
- Settings: Configure platform settings

## Best Practices
- Regular monitoring of user activity
- Timely response to support tickets
- Regular backup of critical data
- Security audit compliance`,
        category: 'admin',
        type: 'documentation',
        status: 'published',
        author: 'Admin Team',
        lastModified: '2024-01-18T14:20:00Z',
        version: '1.0.0',
        tags: ['Admin', 'Management', 'Guide'],
        views: 234,
        helpful: 23,
      },
      {
        id: 'DOC-004',
        title: 'Technical Architecture',
        content: `# Bell24h Technical Architecture

## System Overview
Bell24h is built using modern web technologies and follows microservices architecture.

## Technology Stack
- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL
- Cache: Redis
- Search: Elasticsearch
- AI/ML: Python, TensorFlow

## Infrastructure
- Cloud Provider: Railway
- CDN: Cloudflare
- Monitoring: DataDog
- Logging: ELK Stack

## Security
- JWT Authentication
- OAuth 2.0 Integration
- SSL/TLS Encryption
- Rate Limiting
- Input Validation

## Performance
- Database Indexing
- Query Optimization
- Caching Strategy
- CDN Implementation`,
        category: 'technical',
        type: 'reference',
        status: 'published',
        author: 'Engineering Team',
        lastModified: '2024-01-17T11:30:00Z',
        version: '1.1.0',
        tags: ['Architecture', 'Technical', 'Infrastructure'],
        views: 156,
        helpful: 34,
      },
      {
        id: 'DOC-005',
        title: 'Business Model Overview',
        content: `# Bell24h Business Model

## Revenue Streams
1. **Commission Fees**: 2-5% on successful transactions
2. **Subscription Plans**: Monthly/yearly plans for premium features
3. **Listing Fees**: Charges for premium product listings
4. **Advertising**: Sponsored content and featured placements

## Target Market
- B2B Buyers: Manufacturing companies, retailers, distributors
- B2B Suppliers: Manufacturers, wholesalers, service providers
- Geographic Focus: India, Southeast Asia, expanding globally

## Value Proposition
- AI-powered supplier matching
- Streamlined RFQ process
- Secure payment processing
- Comprehensive analytics
- 24/7 customer support

## Growth Strategy
- User acquisition through digital marketing
- Partnership with industry associations
- International expansion
- Feature development based on user feedback`,
        category: 'business',
        type: 'documentation',
        status: 'draft',
        author: 'Business Team',
        lastModified: '2024-01-16T09:15:00Z',
        version: '0.9.0',
        tags: ['Business Model', 'Strategy', 'Revenue'],
        views: 45,
        helpful: 8,
      },
      {
        id: 'DOC-006',
        title: 'FAQ: Common Questions',
        content: `# Frequently Asked Questions

## General Questions

**Q: How do I get started on Bell24h?**
A: Simply register for an account, complete your profile, and start browsing or listing products.

**Q: What are the fees?**
A: We charge a small commission on successful transactions. Premium features are available through subscription plans.

**Q: Is my data secure?**
A: Yes, we use industry-standard encryption and security measures to protect your data.

## Technical Questions

**Q: Do you have an API?**
A: Yes, we provide a comprehensive REST API for integration with your existing systems.

**Q: Can I integrate with my ERP system?**
A: Yes, our API supports integration with most major ERP systems.

## Support Questions

**Q: How can I contact support?**
A: You can reach our support team through the help center or email support@bell24h.com.

**Q: What are your support hours?**
A: We provide 24/7 support for premium users and business hours support for all users.`,
        category: 'user-guide',
        type: 'faq',
        status: 'published',
        author: 'Support Team',
        lastModified: '2024-01-15T16:45:00Z',
        version: '1.3.0',
        tags: ['FAQ', 'Support', 'Questions'],
        views: 567,
        helpful: 89,
      },
    ];

    setDocs(mockDocs);

    // Calculate stats
    const totalDocs = mockDocs.length;
    const publishedDocs = mockDocs.filter(doc => doc.status === 'published').length;
    const draftDocs = mockDocs.filter(doc => doc.status === 'draft').length;
    const totalViews = mockDocs.reduce((sum, doc) => sum + doc.views, 0);
    const totalHelpful = mockDocs.reduce((sum, doc) => sum + doc.helpful, 0);
    const averageHelpfulness = totalViews > 0 ? (totalHelpful / totalViews) * 100 : 0;
    const mostViewed = mockDocs.reduce((max, doc) => doc.views > max.views ? doc : max, mockDocs[0]);

    setStats({
      totalDocs,
      publishedDocs,
      draftDocs,
      totalViews,
      averageHelpfulness,
      mostViewed: mostViewed.title,
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'api': return 'bg-blue-100 text-blue-800';
      case 'user-guide': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      case 'business': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'documentation': return 'bg-gray-100 text-gray-800';
      case 'tutorial': return 'bg-blue-100 text-blue-800';
      case 'reference': return 'bg-green-100 text-green-800';
      case 'faq': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesStatus = filter === 'all' || doc.status === filter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesSearch = searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleEditDoc = (doc: DocItem) => {
    setSelectedDoc(doc);
    setIsEditing(true);
  };

  const handleSaveDoc = () => {
    // In production, this would save to your API
    setIsEditing(false);
    setSelectedDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentation Center</h2>
          <p className="text-gray-600">Manage and organize all platform documentation</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            New Document
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Import Docs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Docs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedDocs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftDocs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">👍</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Helpfulness</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageHelpfulness.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Most Viewed</p>
              <p className="text-sm font-bold text-gray-900 truncate">{stats.mostViewed}</p>
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
              <option value="api">API</option>
              <option value="user-guide">User Guide</option>
              <option value="admin">Admin</option>
              <option value="technical">Technical</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Documentation List */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(doc.type)}`}>
                    {doc.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {doc.content.substring(0, 200)}...
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Author: {doc.author}</span>
                  <span>Version: {doc.version}</span>
                  <span>Modified: {new Date(doc.lastModified).toLocaleDateString()}</span>
                  <span>Views: {doc.views}</span>
                  <span>Helpful: {doc.helpful}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleEditDoc(doc)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  View
                </button>
                <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                  Share
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {doc.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedDoc && isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Document</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={selectedDoc.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={selectedDoc.content}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDoc}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
