#!/usr/bin/env node

// 🎨 VIBE CODING MCP SERVER - SIMPLIFIED VERSION
// Natural language processing for instant page generation

const fs = require('fs');
const path = require('path');

console.log('🎨 VIBE CODING MCP SERVER - AI-POWERED CODING');
console.log('==============================================\n');

// AI-powered template generator
const vibeTemplates = {
  'suppliers page with search and filter': {
    type: 'suppliers',
    template: `'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' },
    { value: 'location', label: 'Location' },
    { value: 'verified', label: 'Verification' }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm, selectedCategory, sortBy]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('sort', sortBy);
      
      const response = await fetch('/api/suppliers?' + params);
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Suppliers</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with verified suppliers across India with advanced search and filtering
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search suppliers, companies, products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : suppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{supplier.company}</h3>
                        <p className="text-gray-600">{supplier.name}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        {supplier.verified && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                            ✓ Verified
                          </span>
                        )}
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📍</span> {supplier.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">🏷️</span> {supplier.category}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Products:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.products?.slice(0, 3).map((product, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {product}
                          </span>
                        ))}
                        {supplier.products?.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{supplier.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        View Profile
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        💬
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}`
  },

  'products catalog with comparison features': {
    type: 'products',
    template: `'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [compareList, setCompareList] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('minPrice', priceRange[0]);
      params.append('maxPrice', priceRange[1]);
      
      const response = await fetch('/api/products?' + params);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompare = (product) => {
    if (compareList.find(p => p.id === product.id)) {
      setCompareList(compareList.filter(p => p.id !== product.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, product]);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Catalog</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover and compare products from verified suppliers
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={'p-3 rounded-lg ' + (viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600')}
                    >
                      ⊞
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={'p-3 rounded-lg ' + (viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600')}
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {compareList.length > 0 && (
          <div className="bg-blue-600 text-white py-4">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Compare ({compareList.length}/3):</span>
                {compareList.map((product, index) => (
                  <span key={product.id} className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm">
                    {product.name}
                    <button
                      onClick={() => toggleCompare(product)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Compare Now
              </button>
            </div>
          </div>
        )}

        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className={'grid gap-6 ' + (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1')}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={'grid gap-6 ' + (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1')}>
                {products.map((product) => (
                  <div key={product.id} className={'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ' + (viewMode === 'list' ? 'flex' : '')}>
                    <div className={'aspect-w-16 aspect-h-9 ' + (viewMode === 'list' ? 'w-48 flex-shrink-0' : '')}>
                      <img
                        src={product.image || '/images/placeholder-product.jpg'}
                        alt={product.name}
                        className={'w-full object-cover ' + (viewMode === 'list' ? 'h-32' : 'h-48')}
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className={'p-4 ' + (viewMode === 'list' ? 'flex-1' : '')}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                        <button
                          onClick={() => toggleCompare(product)}
                          className={'p-2 rounded-full ' + (compareList.find(p => p.id === product.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                        >
                          {compareList.find(p => p.id === product.id) ? '✓' : '+'}
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-blue-600">₹{product.price?.toLocaleString()}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                        <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                          💬
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}`
  }
};

// AI-powered vibe processing
function processVibe(vibeDescription) {
  const lowerVibe = vibeDescription.toLowerCase();
  
  // AI pattern matching for different vibes
  if (lowerVibe.includes('suppliers') && (lowerVibe.includes('search') || lowerVibe.includes('filter'))) {
    return 'suppliers page with search and filter';
  } else if (lowerVibe.includes('products') && (lowerVibe.includes('catalog') || lowerVibe.includes('comparison'))) {
    return 'products catalog with comparison features';
  } else if (lowerVibe.includes('rfq') && (lowerVibe.includes('form') || lowerVibe.includes('validation'))) {
    return 'RFQ creation form with validation';
  } else if (lowerVibe.includes('dashboard') && (lowerVibe.includes('analytics') || lowerVibe.includes('chart'))) {
    return 'dashboard with analytics and charts';
  } else if (lowerVibe.includes('admin') && (lowerVibe.includes('panel') || lowerVibe.includes('management'))) {
    return 'admin panel for user management';
  } else if (lowerVibe.includes('profile') && (lowerVibe.includes('settings') || lowerVibe.includes('account'))) {
    return 'user profile with settings';
  }
  
  return null;
}

// Generate page from vibe
function generateFromVibe(vibeDescription, outputPath) {
  const startTime = process.hrtime.bigint();
  
  const vibeKey = processVibe(vibeDescription);
  if (!vibeKey || !vibeTemplates[vibeKey]) {
    console.log(`❌ Vibe not recognized: ${vibeDescription}`);
    return false;
  }

  const template = vibeTemplates[vibeKey];
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(outputPath, template.template);
  
  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  
  return { success: true, duration, vibeKey };
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎨 VIBE CODING MCP SERVER - USAGE:');
    console.log('node mcp-vibe-coding-simple.js vibe "description" <type>');
    console.log('node mcp-vibe-coding-simple.js session');
    console.log('\nExamples:');
    console.log('node mcp-vibe-coding-simple.js vibe "Create a suppliers page with search and filter" suppliers');
    console.log('node mcp-vibe-coding-simple.js vibe "Build a products catalog with comparison features" products');
    return;
  }

  const command = args[0];

  if (command === 'vibe' && args.length >= 3) {
    const vibeDescription = args[1];
    const pageType = args[2];
    const outputPath = `app/${pageType}/page.tsx`;
    
    console.log(`🎨 Processing vibe: "${vibeDescription}"`);
    const result = generateFromVibe(vibeDescription, outputPath);
    
    if (result.success) {
      console.log(`✅ Generated ${pageType} page in ${result.duration.toFixed(2)}ms`);
      console.log(`🎯 Vibe: ${result.vibeKey}`);
      console.log(`📁 File: ${outputPath}`);
    }
  } else if (command === 'session') {
    console.log('🎨 Starting multi-vibe coding session...');
    console.log('Available vibes:');
    Object.keys(vibeTemplates).forEach((vibe, index) => {
      console.log(`${index + 1}. ${vibe}`);
    });
    console.log('\nUse: node mcp-vibe-coding-simple.js vibe "description" <type>');
  } else {
    console.log('❌ Invalid command. Use: vibe or session');
  }
}

// Run the script
main();
