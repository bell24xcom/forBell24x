// app/marketing/campaigns/page.tsx - Marketing Campaigns Page
'use client';

import { ArrowRight, Plus, Target, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export default function MarketingCampaignsPage() {
  const [campaigns] = useState([
    {
      id: 1,
      name: 'Supplier Verification Campaign',
      status: 'Active',
      target: 'SMEs',
      budget: '₹50,000',
      spent: '₹32,500',
      leads: 245,
      conversions: 12
    },
    {
      id: 2,
      name: 'RFQ Writing Service',
      status: 'Paused',
      target: 'Exporters',
      budget: '₹25,000',
      spent: '₹18,750',
      leads: 156,
      conversions: 8
    },
    {
      id: 3,
      name: 'Featured Suppliers',
      status: 'Draft',
      target: 'Manufacturers',
      budget: '₹75,000',
      spent: '₹0',
      leads: 0,
      conversions: 0
    }
  ]);

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
          <h1 className="text-3xl font-bold mb-2">Marketing Campaigns</h1>
          <p className="text-gray-400">Manage your marketing campaigns and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Campaigns</p>
                <p className="text-2xl font-bold text-white">{campaigns.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-400">
                  {campaigns.filter(c => c.status === 'Active').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-purple-400">
                  {campaigns.reduce((sum, c) => sum + c.leads, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Conversions</p>
                <p className="text-2xl font-bold text-amber-400">
                  {campaigns.reduce((sum, c) => sum + c.conversions, 0)}
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Campaigns</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Campaign Name</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Target</th>
                  <th className="text-left py-3 px-4">Budget</th>
                  <th className="text-left py-3 px-4">Spent</th>
                  <th className="text-left py-3 px-4">Leads</th>
                  <th className="text-left py-3 px-4">Conversions</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="py-3 px-4 font-medium">{campaign.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${campaign.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          campaign.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{campaign.target}</td>
                    <td className="py-3 px-4 text-gray-300">{campaign.budget}</td>
                    <td className="py-3 px-4 text-gray-300">{campaign.spent}</td>
                    <td className="py-3 px-4 text-gray-300">{campaign.leads}</td>
                    <td className="py-3 px-4 text-gray-300">{campaign.conversions}</td>
                    <td className="py-3 px-4">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">Advanced Campaign Management</h3>
          <p className="text-gray-300 mb-4">
            Advanced campaign features including A/B testing, automated targeting, and detailed analytics are coming soon.
          </p>
          <div className="flex space-x-4">
            <button className="bg-amber-500 text-black px-4 py-2 rounded hover:bg-amber-400 transition-colors">
              Request Early Access
            </button>
            <button className="border border-amber-500 text-amber-400 px-4 py-2 rounded hover:bg-amber-500/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
