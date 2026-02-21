'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useSession();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      if (data.success) {
        setThreads(data.threads);
      } else {
        setError(data.error || 'Failed to load message threads');
      }
    } catch (err) {
      console.error('Error fetching message threads:', err);
      setError('Failed to load message threads');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages?threadId=${threadId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          recipientId: selectedThread.participants.find((p: any) => p.id !== user.userId).id,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Message sent successfully!');
        setNewMessage('');
        fetchMessages(selectedThread.id);
        fetchThreads();
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOwnMessage = (message: any) => message.senderId === user.userId;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-400">
            <li>
              <a href="/dashboard" className="hover:text-white">Dashboard</a>
            </li>
            <li>
              <span className="text-white">Messages</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          <p className="text-slate-400">
            Communicate with buyers and suppliers
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-900/50 rounded-lg p-4 mb-6 text-green-300">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Conversations</h2>
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Loading conversations...</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No conversations found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {threads.map((thread: any) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-slate-100' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-medium text-white">
                        {getInitials(thread.participants[0].name)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{thread.participants[0].company}</div>
                        <div className="text-sm text-slate-400">
                          {thread.lastMessage.content}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">
                          {formatDateTime(thread.lastMessage.createdAt)}
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    {selectedThread.participants[0].company}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {selectedThread.participants[0].name}
                  </p>
                </div>

                {/* Messages */}
                <div className="max-h-96 overflow-y-auto mb-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            isOwnMessage(message) ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage(message)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-900'
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {isOwnMessage(message) ? 'You' : selectedThread.participants[0].name}
                            </div>
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {formatDateTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Composer */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : null}
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-slate-400">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}