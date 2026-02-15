'use client';

import { useState } from 'react';
import { Search, Filter, ChevronRight, ArrowUpRight, Star, Eye } from 'lucide-react';

// Import the existing categories data
import { ALL_CATEGORIES } from '../data/categories';

interface Category {
  id: string;
  name: string;
  icon: string;
  supplierCount: string;
  trending?: boolean;
  description: string;
  subcategories: string[];
}

interface MockRFQ {
  id: string;
  title: string;
  budget: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  timeAgo: string;
  buyer: string;
  category: string;
}

// Generate mock RFQs for each category
const generateMockRFQs = (category: Category): MockRFQ[] => {
  const mockTitles = [
    `Bulk ${category.name} Supply Required`,
    `Premium ${category.name} Components`,
    `Custom ${category.name} Solutions`,
    `Industrial ${category.name} Equipment`,
    `High-Quality ${category.name} Products`
  ];

  const mockBuyers = [
    'TechCorp Industries',
    'Manufacturing Solutions Ltd',
    'Global Trade Co',
    'Industrial Partners',
    'Supply Chain Experts'
  ];

  const urgencies: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const timeAgoOptions = ['2 min ago', '15 min ago', '1 hour ago', '3 hours ago', '1 day ago'];

  return Array.from({ length: 3 }, (_, index) => ({
    id: `RFQ-${category.id}-${index + 1}`,
    title: mockTitles[index % mockTitles.length],
    budget: `₹${(Math.random() * 50 + 5).toFixed(1)}L`,
    urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
    timeAgo: timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)],
    buyer: mockBuyers[Math.floor(Math.random() * mockBuyers.length)],
    category: category.name
  }));
};

export default function CategoriesSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const filteredCategories = ALL_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedCategories = showAllCategories ? filteredCategories : filteredCategories.slice(0, 12);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-neutral-900 mb-4">400+ Product Categories</h2>
          <p className="text-xl text-neutral-600 mb-8">Find suppliers across all major industries with live RFQ examples</p>
          
          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories (e.g., Steel, Electronics, Textiles...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {displayedCategories.map((category) => {
            const mockRFQs = generateMockRFQs(category);
            
            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="p-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{category.icon}</div>
                    {category.trending && (
                      <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                        <ArrowUpRight className="w-3 h-3" />
                        Trending
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{category.description}</p>
                  
                  {/* Supplier Count */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-neutral-700">{category.supplierCount} Suppliers</span>
                  </div>

                  {/* Subcategories Preview */}
                  <div className="mb-4">
                    <p className="text-xs text-neutral-500 mb-2">Key Subcategories:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span
                          key={index}
                          className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full"
                        >
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-xs text-neutral-500">+{category.subcategories.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Live RFQs Preview */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-600">Live RFQs</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-neutral-500">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {mockRFQs.slice(0, 2).map((rfq) => (
                        <div key={rfq.id} className="bg-neutral-50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-neutral-900 line-clamp-1">{rfq.title}</span>
                            <div className={`w-2 h-2 rounded-full ${getUrgencyColor(rfq.urgency)}`}></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>{rfq.budget}</span>
                            <span>{rfq.timeAgo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View More Button */}
                  <button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-emerald-700 transition-all duration-300">
                    View Category Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        <div className="text-center">
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            {showAllCategories ? 'Show Less Categories' : `View All ${ALL_CATEGORIES.length} Categories`}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Category Detail Modal */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{selectedCategory.icon}</div>
                    <div>
                      <h3 className="text-3xl font-bold text-neutral-900">{selectedCategory.name}</h3>
                      <p className="text-neutral-600">{selectedCategory.supplierCount} Verified Suppliers</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-400 hover:text-neutral-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Subcategories */}
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900 mb-4">Subcategories</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCategory.subcategories.map((sub, index) => (
                        <div key={index} className="bg-neutral-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-neutral-900">{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live RFQs */}
                  <div>
                    <h4 className="text-xl font-bold text-neutral-900 mb-4">Live RFQs in this Category</h4>
                    <div className="space-y-3">
                      {generateMockRFQs(selectedCategory).map((rfq) => (
                        <div key={rfq.id} className="bg-neutral-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-neutral-900 line-clamp-1">{rfq.title}</h5>
                            <div className={`w-2 h-2 rounded-full ${getUrgencyColor(rfq.urgency)}`}></div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-neutral-600">
                            <span>{rfq.buyer}</span>
                            <span>{rfq.budget}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-neutral-500 mt-1">
                            <span>{rfq.urgency}</span>
                            <span>{rfq.timeAgo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-emerald-700 transition-all duration-300">
                    Post RFQ in this Category
                  </button>
                  <button className="flex-1 bg-white text-indigo-600 border-2 border-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300">
                    View All Suppliers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
