'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Search, Filter, MapPin, IndianRupee, Clock, MessageSquare, Mic, Video, FileText } from 'lucide-react';

interface RFQ {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number;
  type: 'VOICE' | 'VIDEO' | 'TEXT';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  quotesCount: number;
  createdAt: string;
}

export default function BrowseRFQsPage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchRFQs();
  }, []);

  const fetchRFQs = async () => {
    try {
      const response = await fetch('/api/marketplace/rfqs?status=active', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VOICE': return <Mic className="w-4 h-4" />;
      case 'VIDEO': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-900/40 text-red-300';
      case 'MEDIUM': return 'bg-yellow-900/40 text-yellow-300';
      default: return 'bg-green-900/40 text-green-300';
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    if (searchQuery && !rfq.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && rfq.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer">
          ← Back
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Active RFQs</h1>
          <p className="text-slate-400">Find RFQs matching your business and submit competitive quotes</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search RFQs by title, product, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Steel & Metal">Steel & Metal</option>
              <option value="Electronics">Electronics</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Machinery">Machinery</option>
              <option value="Textiles">Textiles</option>
            </select>
          </div>
        </div>

        {/* RFQ Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading active RFQs...</p>
          </div>
        ) : filteredRFQs.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active RFQs Found</h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search filters'
                : 'New RFQs are posted daily — check back soon!'}
            </p>
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRFQs.map((rfq) => (
              <div
                key={rfq.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors"
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-sm">
                    {getTypeIcon(rfq.type)}
                    {rfq.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(rfq.urgency)}`}>
                    {rfq.urgency}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                  {rfq.title}
                </h3>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Filter className="w-4 h-4 text-slate-500" />
                    {rfq.category}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {rfq.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <IndianRupee className="w-4 h-4 text-slate-500" />
                    Budget: ₹{rfq.budget.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <MessageSquare className="w-4 h-4" />
                    {rfq.quotesCount} quotes submitted
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/rfq/${rfq.id}`}
                  className="block w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-medium transition-colors"
                >
                  View & Quote →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
