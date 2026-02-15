'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  BarChart3,
  FileText
} from 'lucide-react';

interface NegotiationInterfaceProps {
  negotiation: {
    id: string;
    rfqId: string;
    status: 'active' | 'completed' | 'cancelled';
    currentOffer: number;
    counterOffer?: number;
    messages: Array<{
      id: string;
      sender: 'buyer' | 'supplier' | 'ai';
      message: string;
      offer?: number;
      timestamp: string;
      isAISuggestion?: boolean;
    }>;
  };
  onSendMessage: (message: string, offer?: number) => void;
  onAISuggestion: () => void;
  isLoading?: boolean;
}

export default function NegotiationInterface({ 
  negotiation, 
  onSendMessage, 
  onAISuggestion, 
  isLoading = false 
}: NegotiationInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [newOffer, setNewOffer] = useState('');

  const handleSend = () => {
    if (!newMessage && !newOffer) return;
    
    onSendMessage(newMessage, newOffer ? parseFloat(newOffer) : undefined);
    setNewMessage('');
    setNewOffer('');
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
    <div className="space-y-6">
      {/* Negotiation Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Negotiation #{negotiation.rfqId}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Current Offer: ₹{negotiation.currentOffer.toLocaleString()}
                {negotiation.counterOffer && (
                  <span className="ml-2">
                    | Counter: ₹{negotiation.counterOffer.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <Badge className={getStatusColor(negotiation.status)}>
              {negotiation.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Negotiation Chat</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onAISuggestion}
              disabled={isLoading}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Suggestion
            </Button>
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
                onClick={handleSend}
                disabled={isLoading || (!newMessage && !newOffer)}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={onAISuggestion}
                disabled={isLoading}
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Help
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
