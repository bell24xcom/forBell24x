'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  DollarSign,
  Calendar,
  User,
  Building2,
  Phone,
  Mail,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Award,
  XCircle,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// Mock negotiations data
const mockNegotiationsData = {
  activeNegotiations: [
    {
      id: 'NEG001',
      rfqId: 'RFQ001',
      title: 'Steel Beams Procurement - Negotiation',
      supplier: {
        name: 'SteelWorks Ltd',
        contact: 'Rajesh Kumar',
        email: 'rajesh@steelworks.com',
        phone: '+91-98765-43210',
        rating: 4.8,
        verified: true,
      },
      status: 'active',
      currentOffer: 450000,
      originalPrice: 500000,
      savings: 50000,
      savingsPercent: 10,
      lastActivity: '2 hours ago',
      messages: 12,
      deadline: '2024-10-30',
      priority: 'high',
      category: 'Steel & Metal',
    },
    {
      id: 'NEG002',
      rfqId: 'RFQ003',
      title: 'Custom Parts Manufacturing - Negotiation',
      supplier: {
        name: 'AutoParts Inc',
        contact: 'Priya Sharma',
        email: 'priya@autoparts.com',
        phone: '+91-98765-43211',
        rating: 4.5,
        verified: true,
      },
      status: 'pending',
      currentOffer: 950000,
      originalPrice: 1000000,
      savings: 50000,
      savingsPercent: 5,
      lastActivity: '1 day ago',
      messages: 8,
      deadline: '2024-11-05',
      priority: 'medium',
      category: 'Automotive',
    },
    {
      id: 'NEG003',
      rfqId: 'RFQ004',
      title: 'Digital Marketing Campaign - Negotiation',
      supplier: {
        name: 'MarketingPro Solutions',
        contact: 'Amit Patel',
        email: 'amit@marketingpro.com',
        phone: '+91-98765-43212',
        rating: 4.7,
        verified: true,
      },
      status: 'completed',
      currentOffer: 180000,
      originalPrice: 200000,
      savings: 20000,
      savingsPercent: 10,
      lastActivity: '3 days ago',
      messages: 15,
      deadline: '2024-10-25',
      priority: 'low',
      category: 'Marketing',
    },
  ],
  aiInsights: [
    {
      type: 'success',
      title: 'High Negotiation Success Rate',
      description: 'Your negotiation success rate is 87%, above industry average of 72%',
      impact: 'High',
    },
    {
      type: 'warning',
      title: 'Price Sensitivity Alert',
      description: 'Steel category showing 15% price increase trend - consider locking in prices',
      impact: 'Medium',
    },
    {
      type: 'info',
      title: 'Best Negotiation Time',
      description: 'Suppliers are most responsive on Tuesdays and Wednesdays',
      impact: 'Low',
    },
  ],
  statistics: {
    totalNegotiations: 24,
    activeNegotiations: 8,
    completedNegotiations: 16,
    totalSavings: 1250000,
    averageSavings: 8.5,
    successRate: 87,
  },
};

// Negotiation Card Component
const NegotiationCard = ({ negotiation, onViewDetails, onSendMessage }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">{negotiation.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(negotiation.status)}`}>
              {negotiation.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ml-2 ${getPriorityColor(negotiation.priority)}`}>
              {negotiation.priority} priority
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="font-medium">{negotiation.supplier.name}</span>
            <span className="mx-2">•</span>
            <span>{negotiation.supplier.contact}</span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span>{negotiation.supplier.rating}</span>
            </div>
            {negotiation.supplier.verified && (
              <Shield className="w-4 h-4 text-green-500 ml-2" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Offer</div>
          <div className="text-lg font-semibold text-gray-900">
            ₹{negotiation.currentOffer.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Original: ₹{negotiation.originalPrice.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600">Savings</div>
          <div className="text-lg font-semibold text-green-700">
            ₹{negotiation.savings.toLocaleString()}
          </div>
          <div className="text-xs text-green-600">
            {negotiation.savingsPercent}% discount
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600">Activity</div>
          <div className="text-lg font-semibold text-blue-700">
            {negotiation.messages} messages
          </div>
          <div className="text-xs text-blue-600">
            {negotiation.lastActivity}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <Calendar className="w-4 h-4 inline mr-1" />
          Deadline: {negotiation.deadline}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(negotiation.id)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
          <button
            onClick={() => onSendMessage(negotiation.id)}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

// AI Insights Panel
const AIInsightsPanel = ({ insights }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-blue-600" />
        AI Negotiation Insights
      </h3>
      <span className="text-sm text-gray-500">Updated 5 minutes ago</span>
    </div>
    
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div key={index} className={`p-4 rounded-lg border ${
          insight.type === 'success' ? 'bg-green-50 border-green-200' :
          insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{insight.title}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${
              insight.impact === 'High' ? 'text-red-600 bg-red-100' :
              insight.impact === 'Medium' ? 'text-yellow-600 bg-yellow-100' :
              'text-green-600 bg-green-100'
            }`}>
              {insight.impact}
            </span>
          </div>
          <p className="text-sm text-gray-700">{insight.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Chat Interface Component
const ChatInterface = ({ negotiation, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'supplier',
      message: 'Hello! I received your RFQ for steel beams. I can offer a 10% discount for bulk orders.',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      sender: 'buyer',
      message: 'That sounds good. Can you also provide delivery within 2 weeks?',
      timestamp: '1 hour ago',
    },
    {
      id: 3,
      sender: 'supplier',
      message: 'Yes, we can deliver within 2 weeks. I can also offer additional 5% discount for early payment.',
      timestamp: '30 minutes ago',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'buyer',
        message: message.trim(),
        timestamp: 'Just now',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Negotiation Chat - {negotiation?.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'buyer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Send className="w-4 h-4 mr-1" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NegotiationsPage() {
  const [selectedNegotiation, setSelectedNegotiation] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNegotiations = mockNegotiationsData.activeNegotiations.filter((negotiation) => {
    const matchesFilter = filter === 'all' || negotiation.status === filter;
    const matchesSearch = negotiation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         negotiation.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (negotiationId) => {
    const negotiation = mockNegotiationsData.activeNegotiations.find(n => n.id === negotiationId);
    setSelectedNegotiation(negotiation);
    // You can implement a detailed view modal here
    console.log('View details for negotiation:', negotiationId);
  };

  const handleSendMessage = (negotiationId) => {
    const negotiation = mockNegotiationsData.activeNegotiations.find(n => n.id === negotiationId);
    setSelectedNegotiation(negotiation);
    setIsChatOpen(true);
  };

  const user = { name: "Rajesh Kumar" };

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Negotiations</h1>
            <p className="text-gray-600 mt-1">Manage your RFQ negotiations and supplier communications</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Start New Negotiation
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Negotiations</p>
                <p className="text-2xl font-bold text-gray-900">{mockNegotiationsData.statistics.totalNegotiations}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">{mockNegotiationsData.statistics.activeNegotiations} active</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{mockNegotiationsData.statistics.totalSavings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">
                {mockNegotiationsData.statistics.averageSavings}% average
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockNegotiationsData.statistics.successRate}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">Above industry average</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{mockNegotiationsData.statistics.completedNegotiations}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">This month</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <AIInsightsPanel insights={mockNegotiationsData.aiInsights} />

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search negotiations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Negotiations List */}
        <div className="space-y-4">
          {filteredNegotiations.map((negotiation) => (
            <NegotiationCard
              key={negotiation.id}
              negotiation={negotiation}
              onViewDetails={handleViewDetails}
              onSendMessage={handleSendMessage}
            />
          ))}
        </div>

        {/* Chat Interface */}
        <ChatInterface
          negotiation={selectedNegotiation}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>
    </UserDashboardLayout>
  );
}
