// app/crm/leads/page.tsx - CRM Leads Management Page
'use client';

import { Calendar, Filter, Mail, Phone, Plus, Search, Star } from 'lucide-react';
import { useState } from 'react';

export default function CRMLeadsPage() {
  const [leads] = useState([
    {
      id: 1,
      name: 'Rajesh Kumar',
      company: 'Kumar Industries',
      phone: '+91 98765 43210',
      email: 'rajesh@kumarindustries.com',
      location: 'Mumbai, Maharashtra',
      source: 'Website',
      status: 'Hot',
      value: '₹2,50,000',
      lastContact: '2025-09-08',
      notes: 'Interested in supplier verification services'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      company: 'Sharma Exports',
      phone: '+91 87654 32109',
      email: 'priya@sharmaexports.com',
      location: 'Delhi, NCR',
      source: 'Referral',
      status: 'Warm',
      value: '₹1,80,000',
      lastContact: '2025-09-07',
      notes: 'Looking for RFQ writing services'
    },
    {
      id: 3,
      name: 'Amit Patel',
      company: 'Patel Manufacturing',
      phone: '+91 76543 21098',
      email: 'amit@patelmanufacturing.com',
      location: 'Ahmedabad, Gujarat',
      source: 'LinkedIn',
      status: 'Cold',
      value: '₹95,000',
      lastContact: '2025-09-05',
      notes: 'Initial inquiry about platform features'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return 'bg-red-500/20 text-red-400';
      case 'Warm': return 'bg-yellow-500/20 text-yellow-400';
      case 'Cold': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">🔔</span>
            </div>
            <h1 className="text-2xl font-bold">Bell<span className="text-amber-400">24h</span></h1>
          </div>
          <nav className="flex items-center space-x-4">
            <a href="/" className="text-white hover:text-amber-400 transition-colors">Home</a>
            <a href="/admin" className="text-white hover:text-amber-400 transition-colors">Admin</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CRM Leads</h1>
          <p className="text-gray-400">Manage your leads and track sales pipeline</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{leads.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hot Leads</p>
                <p className="text-2xl font-bold text-red-400">
                  {leads.filter(l => l.status === 'Hot').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pipeline Value</p>
                <p className="text-2xl font-bold text-green-400">₹5.25L</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-400">12.5%</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search leads by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>

              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Contact Info</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Value</th>
                  <th className="text-left py-3 px-4">Last Contact</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="text-sm text-gray-400">{lead.location}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-300">{lead.company}</p>
                      <p className="text-sm text-gray-400">{lead.source}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-300">{lead.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-300">{lead.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-300 font-medium">{lead.value}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{lead.lastContact}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="text-green-400 hover:text-green-300 transition-colors">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          <Star className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Advanced CRM Features</h3>
          <p className="text-gray-300 mb-4">
            Advanced CRM features including automated follow-ups, email campaigns, and detailed analytics are coming soon.
          </p>
          <div className="flex space-x-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition-colors">
              Request Early Access
            </button>
            <button className="border border-blue-500 text-blue-400 px-4 py-2 rounded hover:bg-blue-500/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
