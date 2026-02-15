'use client';

import React, { useState, useEffect } from 'react';
// Simple UI components for negotiation page
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Button = ({ children, className = '', onClick, disabled = false, variant = 'default' }: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void; 
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'destructive';
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Input = ({ className = '', ...props }: { className?: string; [key: string]: any }) => (
  <input className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`} {...props} />
);

const Textarea = ({ className = '', ...props }: { className?: string; [key: string]: any }) => (
  <textarea className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`} {...props} />
);
import { 
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
  User
} from 'lucide-react';

interface Negotiation {
  id: string;
  rfqId: string;
  buyerId: string;
  supplierId: string;
  status: 'active' | 'completed' | 'cancelled';
  currentOffer: number;
  counterOffer?: number;
  messages: NegotiationMessage[];
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

export default function NegotiationPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockNegotiations: Negotiation[] = [
      {
        id: 'neg-1',
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
        createdAt: '2025-09-18T10:00:00Z',
        updatedAt: '2025-09-18T10:20:00Z'
      }
    ];
    setNegotiations(mockNegotiations);
  }, []);

  const handleSendMessage = async () => {
    if (!selectedNegotiation || (!newMessage && !newOffer)) return;

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

      setNegotiations(prev => prev.map(neg => 
        neg.id === selectedNegotiation.id 
          ? { ...neg, messages: [...neg.messages, newMsg] }
          : neg
      ));

      setNewMessage('');
      setNewOffer('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!selectedNegotiation) return;

    setIsLoading(true);
    
    try {
      // Call your existing AI negotiation API
      const response = await fetch('/api/negotiation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfqId: selectedNegotiation.rfqId,
          initialOffer: selectedNegotiation.currentOffer,
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

      setNegotiations(prev => prev.map(neg => 
        neg.id === selectedNegotiation.id 
          ? { ...neg, messages: [...neg.messages, aiMessage] }
          : neg
      ));
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Negotiations</h1>
          <p className="text-gray-600">Intelligent negotiation system with AI assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Negotiations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Active Negotiations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {negotiations.map((negotiation) => (
                  <div
                    key={negotiation.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedNegotiation?.id === negotiation.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedNegotiation(negotiation)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">RFQ #{negotiation.rfqId}</h3>
                        <p className="text-sm text-gray-600">Steel Bars Negotiation</p>
                      </div>
                      <Badge className={getStatusColor(negotiation.status)}>
                        {negotiation.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Current: ₹{negotiation.currentOffer?.toLocaleString()}</span>
                        {negotiation.counterOffer && (
                          <span className="ml-2">Counter: ₹{negotiation.counterOffer.toLocaleString()}</span>
                        )}
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            {selectedNegotiation ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Negotiation #{selectedNegotiation.rfqId}</span>
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
                    {selectedNegotiation.messages.map((message) => (
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
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Negotiation</h3>
                  <p className="text-gray-600">Choose a negotiation from the list to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
