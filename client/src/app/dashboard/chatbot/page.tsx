'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Phone,
  Video,
  FileText,
  BarChart3,
  Package,
  TrendingUp,
  Search,
  Lightbulb,
  Zap,
  Brain,
  HelpCircle,
  Settings,
  Download,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Share2,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// Mock AI responses
const mockAIResponses = {
  'suppliers': {
    response: "I found 15 suppliers in the electronics category. Here are the top 3 matches:\n\n1. **TechCorp Solutions** - 4.8★ rating, 96% on-time delivery\n2. **ElectroMax India** - 4.6★ rating, 94% on-time delivery\n3. **Digital Components Ltd** - 4.5★ rating, 92% on-time delivery\n\nWould you like me to show more details about any specific supplier?",
    suggestions: ['Show TechCorp details', 'Compare suppliers', 'View pricing']
  },
  'analytics': {
    response: "Here's your revenue analytics for this month:\n\n📊 **Key Metrics:**\n• Total Revenue: ₹2,45,000 (+12% vs last month)\n• Active RFQs: 24\n• Success Rate: 87.5%\n• Top Category: Electronics (35% of revenue)\n\n📈 **Trends:**\n• Electronics demand up 15%\n• Steel prices stable\n• New supplier onboarding increased 8%\n\nWould you like a detailed breakdown of any specific metric?",
    suggestions: ['Export report', 'View detailed charts', 'Set up alerts']
  },
  'orders': {
    response: "Here are your recent orders:\n\n📦 **Active Orders:**\n• Order #1234 - Industrial Equipment (In Transit)\n• Order #1235 - Steel Beams (Delivered)\n• Order #1236 - Electronics (Processing)\n\n🚚 **Delivery Status:**\n• 2 orders delivered this week\n• 1 order delayed (weather conditions)\n• Average delivery time: 3.2 days\n\nNeed help tracking any specific order?",
    suggestions: ['Track Order #1234', 'View all orders', 'Set delivery alerts']
  },
  'market': {
    response: "Current market trends analysis:\n\n📈 **Price Trends:**\n• Steel: ₹45,000/ton (+3.2% this week)\n• Electronics: Stable pricing\n• Chemicals: ₹8,500/ton (+1.8% this week)\n\n🎯 **Opportunities:**\n• High demand for industrial machinery in Q4\n• Export opportunities in Southeast Asia\n• Seasonal surge in agricultural equipment\n\nWould you like me to set up price alerts for any category?",
    suggestions: ['Set price alerts', 'View detailed trends', 'Export market report']
  },
  'default': {
    response: "I'm here to help you with your B2B marketplace needs! I can assist with:\n\n• Finding suppliers and products\n• Analyzing your business performance\n• Tracking orders and shipments\n• Market trends and insights\n• RFQ management\n• Payment and wallet queries\n\nWhat would you like to know?",
    suggestions: ['Find suppliers', 'View analytics', 'Track orders', 'Market trends']
  }
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick, color = 'blue' }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-3 bg-${color}-50 hover:bg-${color}-100 text-${color}-700 rounded-lg transition-colors border border-${color}-200`}
  >
    <Icon className="w-5 h-5 mr-2" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Message Component
const Message = ({ message, isUser, timestamp, onLike, onDislike, onCopy }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setDisliked(false);
    onLike && onLike();
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
    onDislike && onDislike();
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600 text-white ml-3' : 'bg-purple-600 text-white mr-3'
          }`}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          
          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-4 rounded-lg ${
              isUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900 border border-gray-200'
            }`}>
              <div className="whitespace-pre-wrap text-sm">{message}</div>
              <div className={`text-xs mt-2 ${
                isUser ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {timestamp}
              </div>
            </div>
            
            {!isUser && (
              <div className="flex items-center mt-2 space-x-2">
                <button
                  onClick={handleLike}
                  className={`p-1 rounded ${
                    liked ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDislike}
                  className={`p-1 rounded ${
                    disliked ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={onCopy}
                  className="p-1 rounded text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Suggestion Chip Component
const SuggestionChip = ({ suggestion, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200 transition-colors"
  >
    {suggestion}
  </button>
);

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Bell24H AI Assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(['Find suppliers in electronics', 'Show revenue analytics', 'Track my recent orders', 'Market trends analysis']);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(text);
      const aiMessage = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.suggestions || []);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('supplier') || input.includes('suppliers')) {
      return mockAIResponses.suppliers;
    } else if (input.includes('analytics') || input.includes('revenue') || input.includes('performance')) {
      return mockAIResponses.analytics;
    } else if (input.includes('order') || input.includes('orders') || input.includes('track')) {
      return mockAIResponses.orders;
    } else if (input.includes('market') || input.includes('trend') || input.includes('price')) {
      return mockAIResponses.market;
    } else {
      return mockAIResponses.default;
    }
  };

  const handleQuickAction = (action) => {
    const actionTexts = {
      'Find suppliers in electronics': 'Find suppliers in electronics',
      'Show revenue analytics': 'Show revenue analytics',
      'Track my recent orders': 'Track my recent orders',
      'Market trends analysis': 'Market trends analysis',
    };
    
    handleSendMessage(actionTexts[action] || action);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
    if (!isRecording) {
      // Start recording
      console.log('Starting voice recording...');
    } else {
      // Stop recording and process
      console.log('Stopping voice recording...');
      // Simulate voice-to-text conversion
      setTimeout(() => {
        handleSendMessage('Find suppliers for industrial equipment');
      }, 1000);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  const handleLikeMessage = () => {
    console.log('Message liked');
    // Implement like functionality
  };

  const handleDislikeMessage = () => {
    console.log('Message disliked');
    // Implement dislike functionality
  };

  const user = { name: 'Rajesh Kumar', company: 'TechCorp Industries' };

  return (
    <UserDashboardLayout user={user}>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
              AI Chatbot
            </h1>
            <p className="text-gray-600 mt-1">Your intelligent assistant for B2B marketplace queries</p>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Chat
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionButton
              icon={Search}
              label="Find suppliers in electronics"
              onClick={() => handleQuickAction('Find suppliers in electronics')}
              color="blue"
            />
            <QuickActionButton
              icon={BarChart3}
              label="Show revenue analytics"
              onClick={() => handleQuickAction('Show revenue analytics')}
              color="green"
            />
            <QuickActionButton
              icon={Package}
              label="Track my recent orders"
              onClick={() => handleQuickAction('Track my recent orders')}
              color="purple"
            />
            <QuickActionButton
              icon={TrendingUp}
              label="Market trends analysis"
              onClick={() => handleQuickAction('Market trends analysis')}
              color="orange"
            />
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Bell24H AI Assistant</h3>
                <p className="text-sm text-gray-600">Explainability Service • Business Intelligence Chatbot</p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
                onLike={handleLikeMessage}
                onDislike={handleDislikeMessage}
                onCopy={handleCopyMessage}
              />
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white mr-3 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <SuggestionChip
                    key={index}
                    suggestion={suggestion}
                    onClick={() => handleQuickAction(suggestion)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleVoiceRecord}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about suppliers, analytics, orders..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Press Enter to send • Click microphone for voice input
            </div>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-800 font-medium">AI Assistant Active</span>
            <span className="text-green-600 text-sm ml-2">• Powered by advanced AI algorithms</span>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}