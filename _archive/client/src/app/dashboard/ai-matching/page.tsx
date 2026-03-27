'use client';

import React, { useState } from 'react';
import { Brain, Search, Star, MapPin, Phone, Mail, CheckCircle, XCircle, Filter, RefreshCw } from 'lucide-react';

// Mock data for AI matching
const matchingData = {
  currentRFQ: {
    id: 'RFQ-001',
    title: 'Steel Rods - 1000 units',
    category: 'Steel & Metal',
    description: 'High-quality steel rods for construction purposes. Specifications: Grade 60, 12mm diameter, 6m length.',
    budget: 250000,
    deadline: '2024-01-25',
    location: 'Mumbai, Maharashtra'
  },
  matches: [
    {
      id: 1,
      name: 'SteelWorks Ltd',
      category: 'Steel & Metal',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      confidence: 94,
      price: 240000,
      deliveryTime: '7 days',
      experience: '15 years',
      completedOrders: 1250,
      contact: {
        phone: '+91 98765 43210',
        email: 'contact@steelworks.com'
      },
      strengths: ['Quality certified', 'On-time delivery', 'Competitive pricing'],
      weaknesses: ['Limited customization options'],
      aiInsights: 'Perfect match based on location, experience, and price range. High success rate with similar orders.'
    },
    {
      id: 2,
      name: 'MetalCraft Industries',
      category: 'Steel & Metal',
      location: 'Pune, Maharashtra',
      rating: 4.6,
      confidence: 89,
      price: 235000,
      deliveryTime: '10 days',
      experience: '12 years',
      completedOrders: 890,
      contact: {
        phone: '+91 98765 43211',
        email: 'sales@metalcraft.com'
      },
      strengths: ['Custom solutions', 'Quality assurance', 'Good customer service'],
      weaknesses: ['Slightly longer delivery time'],
      aiInsights: 'Strong match with excellent quality track record. Slightly lower confidence due to delivery time.'
    },
    {
      id: 3,
      name: 'SteelMax Solutions',
      category: 'Steel & Metal',
      location: 'Delhi, NCR',
      rating: 4.4,
      confidence: 82,
      price: 245000,
      deliveryTime: '12 days',
      experience: '8 years',
      completedOrders: 650,
      contact: {
        phone: '+91 98765 43212',
        email: 'info@steelmax.com'
      },
      strengths: ['Competitive pricing', 'Bulk order expertise', 'Quality materials'],
      weaknesses: ['Longer delivery time', 'Less experience'],
      aiInsights: 'Good match with competitive pricing. Lower confidence due to distance and experience level.'
    },
    {
      id: 4,
      name: 'Premium Steel Co',
      category: 'Steel & Metal',
      location: 'Chennai, Tamil Nadu',
      rating: 4.7,
      confidence: 78,
      price: 255000,
      deliveryTime: '15 days',
      experience: '20 years',
      completedOrders: 2100,
      contact: {
        phone: '+91 98765 43213',
        email: 'orders@premiumsteel.com'
      },
      strengths: ['Premium quality', 'Extensive experience', 'Certified materials'],
      weaknesses: ['Higher price', 'Long delivery time'],
      aiInsights: 'Premium option with excellent quality but higher cost and longer delivery time.'
    }
  ]
};

const MatchCard = ({ match, index }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-2 ${
    index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
  } hover:shadow-md transition-shadow`}>
    {index === 0 && (
      <div className="flex items-center mb-4">
        <Star className="w-5 h-5 text-yellow-500 mr-2" />
        <span className="text-sm font-medium text-blue-600">AI Recommended</span>
      </div>
    )}
    
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{match.name}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {match.location}
            </span>
          <span>•</span>
          <span>{match.experience} years experience</span>
          <span>•</span>
          <span>{match.completedOrders} orders completed</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{match.rating}</span>
          </div>
          <div className="flex items-center">
            <Brain className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm font-medium text-blue-600">{match.confidence}% match</span>
              </div>
            </div>
          </div>
      </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div>
        <p className="text-xs text-gray-500">Price</p>
        <p className="text-sm font-medium text-gray-900">₹{match.price.toLocaleString()}</p>
          </div>
      <div>
        <p className="text-xs text-gray-500">Delivery</p>
        <p className="text-sm font-medium text-gray-900">{match.deliveryTime}</p>
          </div>
      <div>
        <p className="text-xs text-gray-500">Rating</p>
        <p className="text-sm font-medium text-gray-900">{match.rating}/5</p>
          </div>
      <div>
        <p className="text-xs text-gray-500">Match Score</p>
        <p className="text-sm font-medium text-blue-600">{match.confidence}%</p>
        </div>
      </div>

    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">AI Insights</h4>
      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{match.aiInsights}</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
        <ul className="space-y-1">
          {match.strengths.map((strength, idx) => (
            <li key={idx} className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-3 h-3 mr-2" />
              {strength}
            </li>
          ))}
        </ul>
      </div>
          <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Considerations</h4>
        <ul className="space-y-1">
          {match.weaknesses.map((weakness, idx) => (
            <li key={idx} className="flex items-center text-sm text-yellow-600">
              <XCircle className="w-3 h-3 mr-2" />
              {weakness}
            </li>
          ))}
        </ul>
            </div>
          </div>

    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <button className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
          <Phone className="w-4 h-4 mr-1" />
          Call
        </button>
        <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Mail className="w-4 h-4 mr-1" />
          Email
        </button>
                  </div>
      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
        Send Quote Request
      </button>
            </div>
          </div>
);

export default function AIMatchingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredMatches = matchingData.matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        match.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConfidence = confidenceFilter === 'all' || 
                            (confidenceFilter === 'high' && match.confidence >= 90) ||
                            (confidenceFilter === 'medium' && match.confidence >= 70 && match.confidence < 90) ||
                            (confidenceFilter === 'low' && match.confidence < 70);
    return matchesSearch && matchesConfidence;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Matching</h1>
          <p className="text-gray-600">Find the best suppliers using AI-powered matching</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Matches'}
        </button>
      </div>

      {/* Current RFQ Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current RFQ Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">RFQ ID</p>
            <p className="text-lg font-medium text-gray-900">{matchingData.currentRFQ.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="text-lg font-medium text-gray-900">{matchingData.currentRFQ.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-lg font-medium text-gray-900">₹{matchingData.currentRFQ.budget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Deadline</p>
            <p className="text-lg font-medium text-gray-900">{matchingData.currentRFQ.deadline}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">Description</p>
          <p className="text-sm text-gray-800 mt-1">{matchingData.currentRFQ.description}</p>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Confidence Levels</option>
              <option value="high">High (90%+)</option>
              <option value="medium">Medium (70-89%)</option>
              <option value="low">Low (Below 70%)</option>
            </select>
                </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredMatches.length} matches found
            </span>
                  </div>
                </div>
              </div>

      {/* AI Matches */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">AI-Powered Matches</h2>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Powered by AI</span>
          </div>
                  </div>
        
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Refresh Matches
            </button>
                  </div>
                )}
      </div>
    </div>
  );
}
