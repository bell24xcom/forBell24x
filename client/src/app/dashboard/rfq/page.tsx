'use client';

import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

// Mock data for RFQs
const rfqData = {
  total: 24,
  active: 12,
  completed: 8,
  cancelled: 4,
  rfqs: [
    {
      id: 'RFQ-001',
      title: 'Steel Rods - 1000 units',
      category: 'Steel & Metal',
      quantity: 1000,
      status: 'active',
      createdAt: '2024-01-15',
      deadline: '2024-01-25',
      responses: 5,
      budget: 250000,
      priority: 'high'
    },
    {
      id: 'RFQ-002',
      title: 'Automotive Parts - 500 units',
      category: 'Automotive',
      quantity: 500,
      status: 'completed',
      createdAt: '2024-01-10',
      deadline: '2024-01-20',
      responses: 8,
      budget: 150000,
      priority: 'medium'
    },
    {
      id: 'RFQ-003',
      title: 'Chemical Solvents - 200L',
      category: 'Chemicals',
      quantity: 200,
      status: 'active',
      createdAt: '2024-01-12',
      deadline: '2024-01-22',
      responses: 3,
      budget: 80000,
      priority: 'low'
    },
    {
      id: 'RFQ-004',
      title: 'Electronic Components - 1000 units',
      category: 'Electronics',
      quantity: 1000,
      status: 'pending',
      createdAt: '2024-01-14',
      deadline: '2024-01-24',
      responses: 0,
      budget: 120000,
      priority: 'high'
    },
    {
      id: 'RFQ-005',
      title: 'Textile Materials - 500m',
      category: 'Textiles',
      quantity: 500,
      status: 'cancelled',
      createdAt: '2024-01-08',
      deadline: '2024-01-18',
      responses: 2,
      budget: 60000,
      priority: 'medium'
    }
  ]
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', icon: Clock },
    completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const RFQCard = ({ rfq }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{rfq.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>ID: {rfq.id}</span>
          <span>•</span>
          <span>{rfq.category}</span>
          <span>•</span>
          <span>{rfq.quantity} units</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <StatusBadge status={rfq.status} />
        <PriorityBadge priority={rfq.priority} />
      </div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div>
        <p className="text-xs text-gray-500">Budget</p>
        <p className="text-sm font-medium text-gray-900">₹{rfq.budget.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Responses</p>
        <p className="text-sm font-medium text-gray-900">{rfq.responses}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Created</p>
        <p className="text-sm font-medium text-gray-900">{rfq.createdAt}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Deadline</p>
        <p className="text-sm font-medium text-gray-900">{rfq.deadline}</p>
      </div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
          <Eye className="w-4 h-4 mr-1" />
          View
        </button>
        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>
      {rfq.responses > 0 && (
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          View Responses ({rfq.responses})
        </button>
      )}
    </div>
  </div>
);

export default function RFQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filteredRFQs = rfqData.rfqs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        rfq.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        rfq.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RFQ Management</h1>
          <p className="text-gray-600">Create, manage, and track your Request for Quotations</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create New RFQ
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total RFQs</p>
              <p className="text-2xl font-bold text-gray-900">{rfqData.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{rfqData.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{rfqData.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{rfqData.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search RFQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="w-4 h-4 flex flex-col space-y-0.5">
                <div className="bg-current rounded-sm h-0.5"></div>
                <div className="bg-current rounded-sm h-0.5"></div>
                <div className="bg-current rounded-sm h-0.5"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* RFQs List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {filteredRFQs.map((rfq) => (
          <RFQCard key={rfq.id} rfq={rfq} />
        ))}
      </div>

      {filteredRFQs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First RFQ
          </button>
        </div>
      )}
    </div>
  );
}