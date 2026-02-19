'use client';
import { useEffect, useState } from 'react';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  company: string;
  avatar: string | null;
}

interface Msg {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Thread {
  partner: Partner;
  messages: Msg[];
  lastMessage: Msg;
  unread: number;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  async function fetchThreads() {
    setLoading(true);
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.success) {
        setThreads(data.threads || []);
        // Derive my userId from first message where I'm the sender
        const myMsg = data.messages?.find((m: Msg) => m.fromId && m.toId);
        if (myMsg && data.threads?.length > 0) {
          const t = data.threads[0] as Thread;
          const partnerId = t.partner.id;
          const firstMsg = t.messages[0];
          if (firstMsg) {
            setMyId(firstMsg.fromId === partnerId ? firstMsg.toId : firstMsg.fromId);
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function fetchThread(partnerId: string) {
    try {
      const res = await fetch(`/api/messages?with=${partnerId}`);
      const data = await res.json();
      if (data.success && data.threads?.length > 0) {
        const updated = data.threads[0] as Thread;
        setSelectedThread(updated);
        setThreads(prev => prev.map(t => t.partner.id === partnerId ? updated : t));
      }
    } catch {
      // silent
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toId: selectedThread.partner.id, content: newMessage.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        fetchThread(selectedThread.partner.id);
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        <div className="flex flex-1 gap-4 h-[calc(100vh-140px)]">
          {/* Thread list */}
          <div className={`w-80 flex-shrink-0 bg-slate-800 rounded-xl overflow-y-auto ${selectedThread ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
            {loading ? (
              <div className="p-6 text-slate-400 text-sm text-center">Loading…</div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-slate-400 text-sm text-center">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                No conversations yet
              </div>
            ) : (
              threads.map(thread => (
                <button
                  key={thread.partner.id}
                  onClick={() => { setSelectedThread(thread); fetchThread(thread.partner.id); }}
                  className={`p-4 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 ${
                    selectedThread?.partner.id === thread.partner.id ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">{thread.partner.company || thread.partner.name}</div>
                    {thread.unread > 0 && (
                      <span className="bg-indigo-600 text-xs rounded-full px-2 py-0.5">{thread.unread}</span>
                    )}
                  </div>
                  <div className="text-slate-400 text-xs mt-1 truncate">{thread.lastMessage?.content}</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {thread.lastMessage && new Date(thread.lastMessage.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat area */}
          {selectedThread ? (
            <div className="flex-1 bg-slate-800 rounded-xl flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                <button onClick={() => setSelectedThread(null)} className="md:hidden text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="font-semibold">{selectedThread.partner.company || selectedThread.partner.name}</div>
                  <div className="text-slate-400 text-xs">{selectedThread.partner.name}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedThread.messages.map(msg => {
                  const isMine = myId ? msg.fromId === myId : msg.toId === selectedThread.partner.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-sm ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <div className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send */}
              <form onSubmit={sendMessage} className="p-4 border-t border-slate-700 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 bg-slate-800 rounded-xl hidden md:flex items-center justify-center text-slate-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-3 text-slate-600" />
                <p>Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
