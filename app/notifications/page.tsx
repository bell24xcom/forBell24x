'use client';
import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  rfq_match:      'bg-indigo-900/40 border-indigo-700',
  quote_received: 'bg-green-900/40 border-green-700',
  quote_accepted: 'bg-emerald-900/40 border-emerald-700',
  quote_rejected: 'bg-red-900/40 border-red-700',
  counter_offer:  'bg-yellow-900/40 border-yellow-700',
  system:         'bg-slate-700/40 border-slate-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-xs rounded-full px-2 py-0.5">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-slate-400 py-12 text-center">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center text-slate-400">
            <BellOff className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm mt-1">You'll see RFQ matches, quotes, and updates here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:opacity-90 ${
                  TYPE_COLORS[notif.type] ?? 'bg-slate-800 border-slate-700'
                } ${notif.isRead ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{notif.title}</div>
                    <div className="text-slate-300 text-sm mt-0.5">{notif.message}</div>
                    <div className="text-slate-500 text-xs mt-1">
                      {new Date(notif.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1" />
                  )}
                </div>
                {notif.link && (
                  <a
                    href={notif.link}
                    className="text-indigo-400 text-xs mt-2 inline-block hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    View details →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
