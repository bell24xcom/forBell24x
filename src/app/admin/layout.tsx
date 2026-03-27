'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { href: string; label: string; icon: string; group?: string };

const NAV: NavItem[] = [
  // Core
  { href: '/admin',                  label: 'Dashboard',        icon: '▤',  group: 'Intelligence' },
  { href: '/admin/kpi',              label: 'KPI',              icon: '📈' },
  { href: '/admin/analytics',        label: 'Analytics',        icon: '📊' },
  { href: '/admin/heatmap',          label: 'Heatmap',          icon: '🔥' },
  { href: '/admin/revenue',          label: 'Revenue',          icon: '💰' },
  // Users & Suppliers
  { href: '/admin/crm',              label: 'CRM / Users',      icon: '👥', group: 'People' },
  { href: '/admin/suppliers',        label: 'Suppliers',        icon: '🏭' },
  { href: '/admin/leads',            label: 'Leads',            icon: '🎯' },
  { href: '/admin/customers',        label: 'Customers',        icon: '🤝' },
  // Operations
  { href: '/admin/rfqs',             label: 'RFQs',             icon: '📋', group: 'Operations' },
  { href: '/admin/marketing',        label: 'Marketing',        icon: '📣' },
  { href: '/admin/outreach',         label: 'Outreach',         icon: '📢' },
  { href: '/admin/control-panel',    label: 'Control Panel',    icon: '⚙️' },
  { href: '/admin/feature-flags',    label: 'Feature Flags',    icon: '🚩' },
  // System
  { href: '/admin/n8n',              label: 'Automation',       icon: '⚡', group: 'System' },
  { href: '/admin/monitoring',       label: 'Monitoring',       icon: '🔍' },
  { href: '/admin/security',         label: 'Security',         icon: '🔒' },
  { href: '/admin/errors',           label: 'Error Logs',       icon: '🐛' },
  // Data
  { href: '/admin/import',           label: 'Import Suppliers', icon: '📥', group: 'Data' },
  { href: '/admin/seed-rfqs',        label: 'Seed RFQs',        icon: '🌱' },
  { href: '/admin/launch-metrics',   label: 'Launch Metrics',   icon: '🚀' },
  { href: '/admin/email-health',     label: 'Email DNS',        icon: '📧' },
  { href: '/admin/flow-test',        label: 'Flow Test',        icon: '🧪' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminName, setAdminName]     = useState('');

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async (attempt = 1) => {
      // 1. Try localStorage first (instant, no DB call)
      try {
        const stored = localStorage.getItem('bell24h_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.role === 'ADMIN' || u?.role === 'SUPER_ADMIN') {
            if (!cancelled) { setAdminName(u.name || u.phone || ''); setAuthChecked(true); }
            return;
          }
          if (u?.role) {
            if (!cancelled) window.location.href = '/dashboard';
            return;
          }
        }
      } catch {}

      // 2. localStorage empty/no role — verify via cookie
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('/api/auth/me', { credentials: 'include', signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
          if (!cancelled) window.location.href = '/auth/phone-email?redirect=/admin';
          return;
        }
        const data = await res.json();
        if (data?.success && data?.user) {
          localStorage.setItem('bell24h_user', JSON.stringify(data.user));
          if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
            if (!cancelled) { setAdminName(data.user.name || data.user.phone || ''); setAuthChecked(true); }
          } else {
            if (!cancelled) window.location.href = '/dashboard';
          }
        } else {
          if (!cancelled) window.location.href = '/auth/phone-email?redirect=/admin';
        }
      } catch {
        // Timeout or network error — retry once (handles Neon cold start)
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 2000));
          if (!cancelled) checkAdmin(2);
          return;
        }
        if (!cancelled) window.location.href = '/auth/phone-email?redirect=/admin';
      }
    };

    checkAdmin();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    // Clear auth-token cookie for all domain variants
    const domains = ['', 'bell24h.com', 'www.bell24h.com', window.location.hostname];
    domains.forEach(domain => {
      const d = domain ? `; domain=${domain}` : '';
      document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d}`;
      document.cookie = `admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d}`;
    });
    window.location.href = '/auth/phone-email';
  };

  // Show loading spinner while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Checking admin access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0">B</div>
          {sidebarOpen && <span className="text-white font-semibold text-sm truncate">Bell24h Admin</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
          {NAV.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <div key={item.href}>
                {item.group && sidebarOpen && (
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pt-3 pb-1">
                    {item.group}
                  </p>
                )}
                {item.group && !sidebarOpen && (
                  <div className="my-1.5 mx-1 h-px bg-slate-700/50" />
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="w-full flex items-center justify-center py-2 text-slate-500 hover:text-white text-xs gap-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? '◀ Collapse' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-slate-300 text-sm font-medium">
            {NAV.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Admin'}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">{adminName || 'ADMIN'}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
