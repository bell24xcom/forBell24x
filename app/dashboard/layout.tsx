'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboardMode } from '@/contexts/DashboardContext';
import {
  LayoutDashboard, PlusCircle, FileText, MessageSquare, Users2,
  Mail, Wallet, BarChart3, User, Bell, Settings, Search, Star,
  Mic, Video, FileEdit, Building2, Package, CreditCard, Menu, X, Shield
} from 'lucide-react';

interface NavItem {
  icon?: any;
  label: string;
  href?: string;
  divider?: boolean;
  highlight?: boolean;
}

const buyerNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { divider: true, label: 'POST RFQ' },
  { icon: Mic, label: 'Voice RFQ', href: '/voice-rfq', highlight: true },
  { icon: Video, label: 'Video RFQ', href: '/video-rfq' },
  { icon: FileEdit, label: 'Text RFQ', href: '/rfq/create' },
  { divider: true, label: 'MY RFQS' },
  { icon: FileText, label: 'My RFQs', href: '/dashboard/rfqs' },
  { icon: MessageSquare, label: 'Quotes Inbox', href: '/dashboard/quotes' },
  { icon: Users2, label: 'Active Deals', href: '/dashboard/deals' },
  { divider: true, label: 'TOOLS' },
  { icon: Mail, label: 'Messages', href: '/dashboard/messages' },
  { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { divider: true, label: 'ACCOUNT' },
  { icon: User, label: 'Profile & KYC', href: '/profile' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const supplierNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { divider: true, label: 'BUSINESS' },
  { icon: Search, label: 'Browse RFQs', href: '/supplier/browse-rfqs', highlight: true },
  { icon: FileText, label: 'My Quotes', href: '/supplier/my-quotes' },
  { icon: Users2, label: 'Active Deals', href: '/dashboard/deals' },
  { divider: true, label: 'PRODUCTS' },
  { icon: Package, label: 'Product Showcase', href: '/supplier/products/showcase' },
  { icon: PlusCircle, label: 'Add Product', href: '/supplier/products/add' },
  { icon: Package, label: 'Manage Products', href: '/supplier/products/manage' },
  { divider: true, label: 'TOOLS' },
  { icon: Mail, label: 'Messages', href: '/dashboard/messages' },
  { icon: Wallet, label: 'Wallet & Earnings', href: '/dashboard/wallet' },
  { icon: BarChart3, label: 'Performance', href: '/dashboard/analytics' },
  { divider: true, label: 'PROFILE' },
  { icon: Star, label: 'Profile & Trust Score', href: '/supplier/profile/edit' },
  { icon: Building2, label: 'Public Profile', href: '/supplier/public-profile' },
  { icon: CreditCard, label: 'GST Verification', href: '/supplier/gst' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { mode, setMode } = useDashboardMode();

  const navItems = mode === 'supplier' ? supplierNavItems : buyerNavItems;

  const switchMode = (newMode: 'buyer' | 'supplier') => {
    setMode(newMode);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3 hover:bg-slate-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="text-xl font-bold">Bell24h</Link>
          </div>

          {/* Center: Mode Tabs */}
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => switchMode('buyer')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'buyer'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buyer Dashboard
            </button>
            <button
              onClick={() => switchMode('supplier')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'supplier'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Supplier Dashboard
            </button>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="p-3 hover:bg-slate-800 rounded-lg relative min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link href="/profile" className="p-3 hover:bg-slate-800 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto transition-transform z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={index} className="pt-4 pb-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-3">
                      {item.label}
                    </h3>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));

              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
