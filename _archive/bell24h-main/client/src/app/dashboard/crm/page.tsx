'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Mail,
  Phone,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Mock CRM data
const mockCRMData = {
  customers: [
    {
      id: 1,
      name: 'SteelWorks Ltd',
      contact: 'Rajesh Kumar',
      email: 'rajesh@steelworks.com',
      phone: '+91-98765-43210',
      industry: 'Steel & Metal',
      status: 'active',
      value: 2500000,
      lastContact: '2024-09-28',
      rating: 4.8,
      location: 'Mumbai, Maharashtra',
      tags: ['Premium', 'High Volume', 'Reliable'],
    },
    {
      id: 2,
      name: 'AutoParts Inc',
      contact: 'Priya Sharma',
      email: 'priya@autoparts.com',
      phone: '+91-98765-43211',
      industry: 'Automotive',
      status: 'prospect',
      value: 1200000,
      lastContact: '2024-09-25',
      rating: 4.5,
      location: 'Delhi, NCR',
      tags: ['New', 'Potential'],
    },
    {
      id: 3,
      name: 'ChemSupply Co',
      contact: 'Amit Patel',
      email: 'amit@chemsupply.com',
      phone: '+91-98765-43212',
      industry: 'Chemicals',
      status: 'active',
      value: 1800000,
      lastContact: '2024-09-29',
      rating: 4.7,
      location: 'Ahmedabad, Gujarat',
      tags: ['Regular', 'Chemical'],
    },
    {
      id: 4,
      name: 'ElectroTech Solutions',
      contact: 'Sneha Reddy',
      email: 'sneha@electrotech.com',
      phone: '+91-98765-43213',
      industry: 'Electronics',
      status: 'inactive',
      value: 800000,
      lastContact: '2024-09-15',
      rating: 4.2,
      location: 'Bangalore, Karnataka',
      tags: ['Tech', 'Inactive'],
    },
  ],
  interactions: [
    {
      id: 1,
      customerId: 1,
      type: 'call',
      description: 'Discussed new steel requirements for Q4',
      date: '2024-09-28',
      outcome: 'positive',
      nextAction: 'Send quote by Oct 2',
    },
    {
      id: 2,
      customerId: 2,
      type: 'email',
      description: 'Sent product catalog and pricing',
      date: '2024-09-25',
      outcome: 'pending',
      nextAction: 'Follow up in 3 days',
    },
    {
      id: 3,
      customerId: 3,
      type: 'meeting',
      description: 'Quarterly business review meeting',
      date: '2024-09-29',
      outcome: 'positive',
      nextAction: 'Prepare contract renewal',
    },
  ],
  analytics: {
    totalCustomers: 156,
    activeCustomers: 89,
    prospects: 45,
    inactiveCustomers: 22,
    totalValue: 12500000,
    avgDealSize: 800000,
    conversionRate: 23.5,
    topIndustries: [
      { name: 'Steel & Metal', count: 45, value: 5500000 },
      { name: 'Automotive', count: 32, value: 3200000 },
      { name: 'Chemicals', count: 28, value: 2800000 },
      { name: 'Electronics', count: 25, value: 2000000 },
    ],
  },
};

export default function CRMDashboard() {
  const [customers, setCustomers] = useState(mockCRMData.customers);
  const [interactions, setInteractions] = useState(mockCRMData.interactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'prospect':
        return 'text-blue-600 bg-blue-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-gray-600">Manage your customer relationships and interactions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddCustomer(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{mockCRMData.analytics.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{mockCRMData.analytics.activeCustomers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">{Math.round((mockCRMData.analytics.activeCustomers / mockCRMData.analytics.totalCustomers) * 100)}% of total</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockCRMData.analytics.totalValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+8% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockCRMData.analytics.conversionRate}%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Above industry average</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers by name, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="prospect">Prospect</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Customer Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.contact}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{customer.industry}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(customer.value)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{customer.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.lastContact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" aria-label="View customer details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" aria-label="Send message">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" aria-label="Edit customer">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Interactions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      {interaction.type === 'call' && <Phone className="w-5 h-5 text-blue-600" />}
                      {interaction.type === 'email' && <Mail className="w-5 h-5 text-green-600" />}
                      {interaction.type === 'meeting' && <Calendar className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{interaction.description}</p>
                      <p className="text-xs text-gray-500">{interaction.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getOutcomeColor(interaction.outcome)}`}>
                      {interaction.outcome}
                    </span>
                    <span className="text-xs text-gray-500">{interaction.nextAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Breakdown */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Industry Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockCRMData.analytics.topIndustries.map((industry, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{industry.name}</h4>
                    <span className="text-sm text-gray-500">{industry.count} customers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(industry.value)}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(industry.value / mockCRMData.analytics.totalValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
