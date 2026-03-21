'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, MessageSquare, TrendingUp, Mail, Wallet, BarChart3, CreditCard, Building2, ShieldCheck } from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My RFQs', href: '/dashboard/rfqs', icon: FileText },
  { label: 'Quotes', href: '/dashboard/quotes', icon: MessageSquare },
  { label: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { label: 'Messages', href: '/dashboard/messages', icon: Mail },
  { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { label: 'Escrow', href: '/escrow', icon: ShieldCheck },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { label: 'Suppliers', href: '/dashboard/suppliers', icon: Building2 },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Dashboard Navigation</h3>
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
