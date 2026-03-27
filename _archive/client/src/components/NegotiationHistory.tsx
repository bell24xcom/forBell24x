'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  User,
  Users,
  Bot,
  DollarSign,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface NegotiationMessage {
  id: string;
  sender: 'buyer' | 'supplier' | 'ai';
  message: string;
  offer?: number;
  timestamp: string;
  isAISuggestion?: boolean;
}

interface NegotiationHistoryProps {
  messages: NegotiationMessage[];
  className?: string;
}

export default function NegotiationHistory({ 
  messages, 
  className = '' 
}: NegotiationHistoryProps) {
  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case 'buyer': return <User className="w-4 h-4" />;
      case 'supplier': return <Users className="w-4 h-4" />;
      case 'ai': return <Bot className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getSenderName = (sender: string) => {
    switch (sender) {
      case 'buyer': return 'Buyer';
      case 'supplier': return 'Supplier';
      case 'ai': return 'AI Assistant';
      default: return 'Unknown';
    }
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'buyer': return 'text-blue-600 bg-blue-50';
      case 'supplier': return 'text-green-600 bg-green-50';
      case 'ai': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOfferChange = (currentOffer?: number, previousOffer?: number) => {
    if (!currentOffer || !previousOffer) return null;
    
    const change = currentOffer - previousOffer;
    const percentage = ((change / previousOffer) * 100).toFixed(1);
    
    if (change > 0) {
      return { type: 'increase', value: `+₹${change.toLocaleString()} (+${percentage}%)` };
    } else if (change < 0) {
      return { type: 'decrease', value: `-₹${Math.abs(change).toLocaleString()} (${percentage}%)` };
    } else {
      return { type: 'same', value: 'No change' };
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Negotiation History
        </CardTitle>
        <p className="text-sm text-gray-600">
          Complete timeline of negotiation messages and offers
        </p>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No negotiation history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const offerChange = getOfferChange(message.offer, previousMessage?.offer);

              return (
                <div key={message.id} className="relative">
                  {/* Timeline Line */}
                  {index < messages.length - 1 && (
                    <div className="absolute left-4 top-12 w-0.5 h-8 bg-gray-200"></div>
                  )}

                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSenderColor(message.sender)}`}>
                      {getSenderIcon(message.sender)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {getSenderName(message.sender)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                        {message.isAISuggestion && (
                          <Badge variant="secondary" className="text-xs">
                            AI Suggestion
                          </Badge>
                        )}
                      </div>

                      {/* Message */}
                      <div className="mb-2">
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                      </div>

                      {/* Offer Details */}
                      {message.offer && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                            <DollarSign className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">
                              ₹{message.offer.toLocaleString()}
                            </span>
                          </div>
                          
                          {/* Offer Change Indicator */}
                          {offerChange && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              offerChange.type === 'increase' ? 'bg-red-100 text-red-700' :
                              offerChange.type === 'decrease' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {offerChange.type === 'increase' && <TrendingUp className="w-3 h-3" />}
                              {offerChange.type === 'decrease' && <TrendingUp className="w-3 h-3 rotate-180" />}
                              {offerChange.type === 'same' && <CheckCircle className="w-3 h-3" />}
                              {offerChange.value}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Suggestion Indicator */}
                      {message.isAISuggestion && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          <Bot className="w-3 h-3" />
                          <span>AI-powered suggestion</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
