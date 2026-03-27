"use client";
import { useState } from 'react';
import { Search, ChevronDown, Shield, Globe, Zap, CheckCircle } from 'lucide-react';

export default function SearchInterface() {
  const [searchCategory, setSearchCategory] = useState('Verified Suppliers');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Verified Suppliers',
    'All Suppliers', 
    'Products',
    'RFQ Leads',
    'Export Opportunities',
    'Risk Assessment'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
    console.log('Searching for:', searchQuery, 'in category:', searchCategory);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Interface - Thomasnet Inspired */}
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-blue-500/30">
        <h3 className="text-2xl font-bold text-center mb-6 text-white">
          Search the largest network of <span className="text-amber-400">verified suppliers</span>
        </h3>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          {/* Category Dropdown */}
          <div className="relative flex-1">
            <div className="relative">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full px-4 py-4 bg-white/20 border border-gray-300/30 rounded-l-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-800 text-white">
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="By Product, Service, or Company Name"
              className="w-full px-4 py-4 bg-white/20 border border-gray-300/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg sm:rounded-r-lg transition-colors duration-200 flex items-center justify-center min-h-[44px]"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Search
          </button>
        </form>

        {/* Trust Indicators */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
            <span>534,672+ Verified Suppliers</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-400 mr-1" />
            <span>Escrow Protected</span>
          </div>
          <div className="flex items-center">
            <Globe className="h-4 w-4 text-purple-400 mr-1" />
            <span>Global Export Ready</span>
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-amber-400 mr-1" />
            <span>Smart Matching</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 mb-2">
            For 2+ years, Bell24h has connected Indian SMEs with global buyers
          </p>
          <p className="text-amber-400 font-semibold">
            Every 30 seconds, a verified supplier finds their perfect match on Bell24h.
          </p>
        </div>
      </div>
    </div>
  );
}
