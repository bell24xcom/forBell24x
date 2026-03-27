'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/src/app/contexts/AuthContext';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/phone-email';
    }
  }, [user, loading]);

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
      const response = await fetch('/api/messages', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setThreads(data.threads || []);
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
      const response = await fetch(`/api/messages?threadId=${threadId}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedThread?.participants?.find((p: any) => p.id !== user?.userId)?.id,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (data.success) {
        setSuccess('Message sent!');
        setNewMessage('');
        fetchMessages(selectedThread.id);
        fetchThreads();
        setTimeout(() => setSuccess(''), 3000);
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
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOwnMessage = (message: any) => message.senderId === user?.userId;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-300">
            <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
            <li><span className="text-white">Messages</span></li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Messages</h1>
          <p className="text-slate-300">Communicate with buyers and suppliers</p>
        </div>

        {success && (
          <div className="bg-green-900/50 rounded-lg p-4 mb-6 text-green-300">{success}</div>
        )}
        {error && (
          <div className="bg-red-900/50 rounded-lg p-4 mb-6 text-red-300">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Conversations</h2>
              {isLoading ? (
                <div className="text-center py-8 text-slate-400"><p>Loading conversations...</p></div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><p>No conversations found</p></div>
              ) : (
                <div className="space-y-2">
                  {threads.map((thread: any) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full flex items-center p-3 rounded-lg hover:bg-slate-700/50 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-slate-700/50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-medium text-white text-sm">
                        {getInitials(thread.participants?.[0]?.name || '')}
                      </div>
                      <div className="ml-3 flex-1 text-left">
                        <div className="font-medium text-white text-sm">{thread.participants?.[0]?.company || thread.participants?.[0]?.name}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {thread.lastMessage?.content || 'No messages'}
                        </div>
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                          {thread.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">
                    {selectedThread.participants?.[0]?.company || selectedThread.participants?.[0]?.name}
                  </h2>
                  <p className="text-sm text-slate-400">{selectedThread.participants?.[0]?.name}</p>
                </div>

                <div className="max-h-96 overflow-y-auto mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400"><p>No messages yet</p></div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage(message)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}>
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs text-slate-300 mt-1 opacity-70">
                              {formatDateTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center text-slate-400">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
