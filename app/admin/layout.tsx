'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin',                label: 'Dashboard',      icon: '▤' },
  { href: '/admin/crm',            label: 'CRM / Users',    icon: '👥' },
  { href: '/admin/control-panel',  label: 'Control Panel',  icon: '⚙️' },
  { href: '/admin/rfqs',           label: 'RFQs',           icon: '📋' },
  { href: '/admin/analytics',      label: 'Analytics',      icon: '📊' },
  { href: '/admin/leads',          label: 'Leads',          icon: '🎯' },
  { href: '/admin/monitoring',     label: 'Monitoring',     icon: '🔍' },
  { href: '/admin/security',       label: 'Security',       icon: '🔒' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
  };

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
        <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
          {NAV.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
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
            {NAV.find(n => n.href === pathname || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label ?? 'Admin'}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">ADMIN</span>
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
