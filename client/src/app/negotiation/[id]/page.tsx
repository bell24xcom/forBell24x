'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  MessageSquare, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Bot,
  User,
  FileText,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface NegotiationDetails {
  id: string;
  rfqId: string;
  buyerId: string;
  supplierId: string;
  status: 'active' | 'completed' | 'cancelled';
  currentOffer: number;
  counterOffer?: number;
  messages: NegotiationMessage[];
  rfqDetails: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    category: string;
    deadline: string;
  };
  aiAnalysis: {
    marketPrice: number;
    successProbability: number;
    suggestions: string[];
    riskScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface NegotiationMessage {
  id: string;
  sender: 'buyer' | 'supplier' | 'ai';
  message: string;
  offer?: number;
  timestamp: string;
  isAISuggestion?: boolean;
}

export default function NegotiationDetailPage() {
  const params = useParams();
  const negotiationId = params.id as string;
  
  const [negotiation, setNegotiation] = useState<NegotiationDetails | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'history'>('chat');

  // Mock data for demonstration
  useEffect(() => {
    const mockNegotiation: NegotiationDetails = {
      id: negotiationId,
      rfqId: 'rfq-123',
      buyerId: 'buyer-1',
      supplierId: 'supplier-1',
      status: 'active',
      currentOffer: 45000,
      counterOffer: 42000,
      messages: [
        {
          id: 'msg-1',
          sender: 'buyer',
          message: 'We need 1000 units of steel bars. What\'s your best price?',
          offer: 45000,
          timestamp: '2025-09-18T10:00:00Z'
        },
        {
          id: 'msg-2',
          sender: 'supplier',
          message: 'For 1000 units, we can offer ₹42,000 per ton.',
          offer: 42000,
          timestamp: '2025-09-18T10:15:00Z'
        },
        {
          id: 'msg-3',
          sender: 'ai',
          message: 'Based on market analysis, ₹41,500 per ton would be a fair price for this quantity.',
          offer: 41500,
          isAISuggestion: true,
          timestamp: '2025-09-18T10:20:00Z'
        }
      ],
      rfqDetails: {
        title: 'Steel Bars - Construction Grade',
        description: 'High-quality steel bars for construction project',
        quantity: 1000,
        unit: 'tons',
        category: 'Steel & Metals',
        deadline: '2025-09-25'
      },
      aiAnalysis: {
        marketPrice: 43000,
        successProbability: 85,
        suggestions: [
          'Consider bulk discount for 1000+ units',
          'Negotiate delivery terms for better pricing',
          'Ask for quality certificates upfront'
        ],
        riskScore: 15
      },
      createdAt: '2025-09-18T10:00:00Z',
      updatedAt: '2025-09-18T10:20:00Z'
    };
    setNegotiation(mockNegotiation);
  }, [negotiationId]);

  const handleSendMessage = async () => {
    if (!negotiation || (!newMessage && !newOffer)) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMsg: NegotiationMessage = {
        id: `msg-${Date.now()}`,
        sender: 'buyer',
        message: newMessage,
        offer: newOffer ? parseFloat(newOffer) : undefined,
        timestamp: new Date().toISOString()
      };

      setNegotiation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMsg]
      } : null);

      setNewMessage('');
      setNewOffer('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!negotiation) return;

    setIsLoading(true);
    
    try {
      // Call your existing AI negotiation API
      const response = await fetch('/api/negotiation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfqId: negotiation.rfqId,
          initialOffer: negotiation.currentOffer,
          minAcceptable: 40000,
          maxAcceptable: 45000,
          deliveryTerms: 'standard',
          contractTerms: 'standard',
          context: 'Steel bars negotiation'
        })
      });

      const result = await response.json();
      
      const aiMessage: NegotiationMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        message: result.explanation,
        offer: result.finalPrice,
        isAISuggestion: true,
        timestamp: new Date().toISOString()
      };

      setNegotiation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage]
      } : null);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'buyer': return <User className="w-4 h-4" />;
      case 'supplier': return <Users className="w-4 h-4" />;
      case 'ai': return <Bot className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!negotiation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading negotiation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/negotiation" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Negotiations
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {negotiation.rfqDetails.title}
              </h1>
              <p className="text-gray-600">RFQ #{negotiation.rfqId}</p>
            </div>
            <Badge className={getStatusColor(negotiation.status)}>
              {negotiation.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* RFQ Details Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  RFQ Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{negotiation.rfqDetails.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-medium">{negotiation.rfqDetails.quantity} {negotiation.rfqDetails.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{negotiation.rfqDetails.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deadline</p>
                  <p className="font-medium">{new Date(negotiation.rfqDetails.deadline).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Market Price</p>
                  <p className="font-medium">₹{negotiation.aiAnalysis.marketPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Probability</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${negotiation.aiAnalysis.successProbability}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{negotiation.aiAnalysis.successProbability}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <p className="font-medium text-red-600">{negotiation.aiAnalysis.riskScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">AI Suggestions</p>
                  <ul className="space-y-1">
                    {negotiation.aiAnalysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-xs text-gray-700">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'chat', name: 'Chat', icon: MessageSquare },
                    { id: 'analysis', name: 'Analysis', icon: BarChart3 },
                    { id: 'history', name: 'History', icon: Clock }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'chat' && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Negotiation Chat</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAISuggestion}
                        disabled={isLoading}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        AI Suggestion
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {negotiation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === 'buyer' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`flex gap-2 max-w-[80%] ${
                            message.sender === 'buyer' ? 'flex-row-reverse' : 'flex-row'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'buyer' ? 'bg-blue-500 text-white' :
                            message.sender === 'supplier' ? 'bg-green-500 text-white' :
                            'bg-purple-500 text-white'
                          }`}>
                            {getSenderIcon(message.sender)}
                          </div>
                          <div className={`p-3 rounded-lg ${
                            message.sender === 'buyer' ? 'bg-blue-500 text-white' :
                            message.sender === 'supplier' ? 'bg-green-100 text-green-900' :
                            'bg-purple-100 text-purple-900 border border-purple-200'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            {message.offer && (
                              <p className="font-semibold mt-1">₹{message.offer.toLocaleString()}</p>
                            )}
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Enter your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Offer amount"
                        type="number"
                        value={newOffer}
                        onChange={(e) => setNewOffer(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || (!newMessage && !newOffer)}
                        className="flex-1"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleAISuggestion}
                        disabled={isLoading}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        AI Help
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'analysis' && (
              <Card>
                <CardHeader>
                  <CardTitle>Negotiation Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Current Offer</p>
                        <p className="text-2xl font-bold text-blue-600">₹{negotiation.currentOffer.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Counter Offer</p>
                        <p className="text-2xl font-bold text-green-600">₹{negotiation.counterOffer?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Market Price</p>
                        <p className="text-2xl font-bold text-purple-600">₹{negotiation.aiAnalysis.marketPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">AI Recommendations</h3>
                      <ul className="space-y-2">
                        {negotiation.aiAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            <span className="text-gray-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'history' && (
              <Card>
                <CardHeader>
                  <CardTitle>Negotiation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {negotiation.messages.map((message, index) => (
                      <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'buyer' ? 'bg-blue-500 text-white' :
                          message.sender === 'supplier' ? 'bg-green-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {getSenderIcon(message.sender)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium capitalize">{message.sender}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-gray-700 mt-1">{message.message}</p>
                          {message.offer && (
                            <p className="font-semibold text-blue-600 mt-1">₹{message.offer.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
