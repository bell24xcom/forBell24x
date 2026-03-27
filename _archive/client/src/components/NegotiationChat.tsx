'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send,
  Bot,
  User,
  Users,
  MessageSquare,
  DollarSign,
  Clock
} from 'lucide-react';

interface NegotiationMessage {
  id: string;
  sender: 'buyer' | 'supplier' | 'ai';
  message: string;
  offer?: number;
  timestamp: string;
  isAISuggestion?: boolean;
}

interface NegotiationChatProps {
  messages: NegotiationMessage[];
  onSendMessage: (message: string, offer?: number) => void;
  onAISuggestion: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function NegotiationChat({ 
  messages, 
  onSendMessage, 
  onAISuggestion, 
  isLoading = false,
  className = ''
}: NegotiationChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage && !newOffer) return;
    
    onSendMessage(newMessage, newOffer ? parseFloat(newOffer) : undefined);
    setNewMessage('');
    setNewOffer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  const getSenderName = (sender: string) => {
    switch (sender) {
      case 'buyer': return 'You';
      case 'supplier': return 'Supplier';
      case 'ai': return 'AI Assistant';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet. Start the negotiation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
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
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'buyer' ? 'bg-blue-500 text-white' :
                  message.sender === 'supplier' ? 'bg-green-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {getSenderIcon(message.sender)}
                </div>

                {/* Message Content */}
                <div className={`p-3 rounded-lg ${
                  message.sender === 'buyer' ? 'bg-blue-500 text-white' :
                  message.sender === 'supplier' ? 'bg-green-100 text-green-900' :
                  'bg-purple-100 text-purple-900 border border-purple-200'
                }`}>
                  {/* Sender Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-70">
                      {getSenderName(message.sender)}
                    </span>
                    {message.isAISuggestion && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                        AI Suggestion
                      </span>
                    )}
                  </div>

                  {/* Message Text */}
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>

                  {/* Offer Amount */}
                  {message.offer && (
                    <div className="flex items-center gap-1 mt-2 p-2 bg-white bg-opacity-20 rounded">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">₹{message.offer.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs opacity-70 mt-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Input
            placeholder="Offer ₹"
            type="number"
            value={newOffer}
            onChange={(e) => setNewOffer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-32"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSend}
            disabled={isLoading || (!newMessage && !newOffer)}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
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
    </div>
  );
}
