'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EnhancedAuthModal from '@/components/EnhancedAuthModal';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'automotive', label: 'Automotive' }
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Redirect to marketplace with search parameters
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      window.location.href = `/marketplace?${params.toString()}`;
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePopularSearch = (query: string) => {
    setSearchQuery(query);
    window.location.href = `/marketplace?q=${encodeURIComponent(query)}`;
  };

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        alert('Successfully subscribed to newsletter!');
        e.currentTarget.reset();
      } else {
        alert('Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
    // Redirect to dashboard or show success message
    window.location.href = '/dashboard';
  };

  return (
    <>
      {/* Trial Offer Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium">
            🎉 <strong>LAUNCH SPECIAL:</strong> Get Professional plan FREE for 3 months! 
            <span className="ml-2 underline cursor-pointer" onClick={() => setShowAuthModal(true)}>
              Start Free Trial Now →
            </span>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              India's Fastest B2B Marketplace
          </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-slide-up">
              Connect with verified suppliers and buyers with advanced matching technology and secure escrow payments.
          </p>

          {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, suppliers, or services..."
                    className="w-full px-6 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
                </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 text-gray-900 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
              </select>
              <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            </form>

          {/* Popular Searches */}
            <div className="animate-slide-up">
              <p className="text-blue-100 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['Steel Pipes', 'Textile Machinery', 'Electronics Components', 'Packaged Food', 'Auto Parts'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handlePopularSearch(item)}
                    className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-colors"
                  >
                    {item}
                  </button>
                ))}
        </div>
          </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Bell24h?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the tools and technology you need to succeed in B2B commerce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
        </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
              <p className="text-gray-600">All suppliers are verified and trusted for quality and reliability</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Escrow protection ensures safe and secure transactions</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Matching</h3>
              <p className="text-gray-600">Smart algorithms match you with the best suppliers</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your B2B Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses already using Bell24h to grow their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Get Started Free
              </Link>
              <Link href="/suppliers" className="btn-secondary text-lg px-8 py-4">
                Browse Suppliers
              </Link>
            </div>
                </div>
              </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-8">
              Get the latest B2B insights and marketplace updates delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Enhanced Auth Modal */}
      <EnhancedAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}