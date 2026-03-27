'use client';

import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { MessageSquare, Send, Search, MoreVertical, CheckCircle, Clock } from 'lucide-react';

interface Message {
  id: string;
  buyerName: string;
  buyerCompany: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar?: string;
}

export default function MessagingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // TODO: Fetch messages from API
    setMessages([
      {
        id: '1',
        buyerName: 'Rajesh Kumar',
        buyerCompany: 'TechCorp Industries',
        lastMessage: 'Thank you for the quote. Can we discuss pricing?',
        timestamp: '2 hours ago',
        unread: true,
      },
      {
        id: '2',
        buyerName: 'Priya Sharma',
        buyerCompany: 'AutoParts Ltd',
        lastMessage: 'We are interested in your steel products.',
        timestamp: '1 day ago',
        unread: false,
      },
      {
        id: '3',
        buyerName: 'Amit Patel',
        buyerCompany: 'Construction Co',
        lastMessage: 'When can we expect delivery?',
        timestamp: '2 days ago',
        unread: false,
      },
    ]);
  }, []);

  const filteredMessages = messages.filter(msg =>
    msg.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMessage) return;
    
    // TODO: Implement API call to send message
    setNewMessage('');
    alert('Message sent!');
  };

  return (
    <UserDashboardLayout>
      <div className="w-full h-[calc(100vh-200px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Messaging
          </h1>
          <p className="text-gray-600 mt-1">Communicate with buyers and respond to inquiries</p>
        </div>

        <div className="flex-1 flex gap-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Messages List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-l-[#0070f3]' : ''
                  } ${message.unread ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{message.buyerName}</h3>
                      <p className="text-sm text-gray-500">{message.buyerCompany}</p>
                    </div>
                    {message.unread && (
                      <span className="w-2 h-2 bg-[#0070f3] rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-1">{message.lastMessage}</p>
                  <p className="text-xs text-gray-400">{message.timestamp}</p>
                </div>
              ))}
              {filteredMessages.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedMessage.buyerName}</h3>
                    <p className="text-sm text-gray-500">{selectedMessage.buyerCompany}</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Sample messages */}
                  <div className="flex justify-end">
                    <div className="bg-[#0070f3] text-white rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm">Hello! Thank you for your interest in our products.</p>
                      <p className="text-xs mt-1 opacity-75">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm">{selectedMessage.lastMessage}</p>
                      <p className="text-xs mt-1 text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0070f3] focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-[#0070f3] text-white rounded-lg hover:bg-[#0051cc] transition-colors flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}

