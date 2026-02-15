'use client';

import { CheckCircle, Clock, Edit, Eye, FileText, Search, Trash2, XCircle, Play, Mic, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

// Add CSS for line clamp
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

interface RFQ {
  id: string;
  title: string;
  description: string;
  buyer: {
    name: string;
    company: string;
  };
  category: string;
  budget: number;
  status: 'active' | 'closed' | 'pending' | 'expired';
  responses: number;
  views: number;
  createdAt: string;
  deadline: string;
  type: 'text' | 'video' | 'voice';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  timeAgo: string;
}

export default function RFQManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch live RFQs from API
  useEffect(() => {
    fetchRFQs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRFQs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRFQs = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/rfq/live?limit=50');
      const data = await response.json();
      if (data.success) {
        setRfqs(data.data);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || rfq.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-neutral-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-600';
      case 'voice': return 'bg-blue-100 text-blue-600';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  // Calculate stats from live data
  const stats = {
    total: rfqs.length,
    active: rfqs.filter(rfq => rfq.status === 'active').length,
    pending: rfqs.filter(rfq => rfq.status === 'pending').length,
    closed: rfqs.filter(rfq => rfq.status === 'closed').length,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">RFQ Management</h1>
              <p className="mt-2 text-neutral-600">Review and moderate Request for Quotations</p>
            </div>
            <button
              onClick={fetchRFQs}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total RFQs</p>
                <p className="text-2xl font-bold text-neutral-900">{loading ? '...' : stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Active</p>
                <p className="text-2xl font-bold text-neutral-900">{loading ? '...' : stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-neutral-900">{loading ? '...' : stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Closed</p>
                <p className="text-2xl font-bold text-neutral-900">{loading ? '...' : stats.closed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Textiles">Textiles</option>
              <option value="Chemicals">Chemicals</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* RFQs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">RFQs ({filteredRFQs.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">RFQ Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Responses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center min-h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <span className="ml-2 text-neutral-600">Loading RFQs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRFQs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-neutral-500">
                      No RFQs found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredRFQs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900 line-clamp-2">{rfq.title}</div>
                          <div className="text-sm text-neutral-500">ID: {rfq.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(rfq.type)}`}>
                          {getTypeIcon(rfq.type)}
                          {rfq.type.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        <div>
                          <div className="font-medium">{rfq.buyer.name}</div>
                          <div className="text-neutral-500">{rfq.buyer.company}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {rfq.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        ₹{(rfq.budget / 100000).toFixed(1)}L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getUrgencyColor(rfq.urgency)}`}></div>
                          <span className="text-xs font-medium text-neutral-600">{rfq.urgency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(rfq.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rfq.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              rfq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                rfq.status === 'closed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                            }`}>
                            {rfq.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div className="flex items-center gap-4">
                          <span>{rfq.responses} quotes</span>
                          <span>{rfq.views} views</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {rfq.timeAgo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3" title="View RFQ details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 mr-3" title="Edit RFQ">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Delete RFQ">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}