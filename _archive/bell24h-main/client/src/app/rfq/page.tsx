'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Plus, Search } from 'lucide-react';

export default function RFQListPage() {
  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">All RFQs</h1>
            <p className="text-gray-400">
              Browse active requests for quotation across all buyers
            </p>
          </div>
          <Link
            href="/rfq/create"
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create RFQ
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFQs by product, category, or location..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              />
            </div>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Filters
            </button>
          </div>
        </div>

        {/* RFQ List Placeholder */}
        <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold mb-2 text-gray-300">No RFQs Found</h2>
          <p className="text-gray-500 mb-6">
            This page will display all active RFQs once data is connected.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/rfq/create"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
            >
              Create Your First RFQ
            </Link>
            <Link
              href="/rfq/demo/all"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
            >
              View Demo RFQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

