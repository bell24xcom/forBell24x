'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingCart,
  Wallet,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Mic,
  Video,
  BarChart3,
  Package,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  userType: 'buyer' | 'supplier';
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Navigation items based on user type
  const buyerNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/buyer/dashboard' },
    { icon: FileText, label: 'My RFQs', href: '/buyer/rfqs' },
    { icon: Mic, label: 'Voice RFQ', href: '/buyer/rfq/voice' },
    { icon: Video, label: 'Video RFQ', href: '/buyer/rfq/video' },
    { icon: Users, label: 'Suppliers', href: '/buyer/suppliers' },
    { icon: ShoppingCart, label: 'Orders', href: '/buyer/orders' },
    { icon: MessageSquare, label: 'Messages', href: '/buyer/messages', badge: 5 },
    { icon: BarChart3, label: 'Analytics', href: '/buyer/analytics' },
    { icon: Wallet, label: 'Wallet', href: '/buyer/wallet' },
    { icon: Settings, label: 'Settings', href: '/buyer/settings' },
  ];

  const supplierNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/supplier/dashboard' },
    { icon: FileText, label: 'Browse RFQs', href: '/supplier/rfqs' },
    { icon: Package, label: 'My Products', href: '/supplier/products' },
    { icon: ShoppingCart, label: 'Orders', href: '/supplier/orders' },
    { icon: MessageSquare, label: 'Messages', href: '/supplier/messages', badge: 3 },
    { icon: BarChart3, label: 'Analytics', href: '/supplier/analytics' },
    { icon: Wallet, label: 'Wallet', href: '/supplier/wallet' },
    { icon: Settings, label: 'Settings', href: '/supplier/settings' },
  ];

  const navItems = userType === 'buyer' ? buyerNavItems : supplierNavItems;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="font-bold text-xl hidden sm:block">Bell24h</span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFQs, suppliers, products..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <span className="hidden sm:block font-medium text-gray-900 dark:text-white">User Name</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-10
            w-64 bg-white dark:bg-slate-800 border-r
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            mt-16 lg:mt-0
          `}
        >
          <nav className="p-4 space-y-2 h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Quick Actions */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick Actions</p>
              {userType === 'buyer' ? (
                <Link href="/rfq/create">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Create RFQ
                  </Button>
                </Link>
              ) : (
                <Link href="/supplier/products/add">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Package className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>

            {/* Navigation Items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Navigation</p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Type Badge */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className={`p-3 rounded-lg ${
                userType === 'buyer' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                  : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              }`}>
                <p className="text-xs font-semibold uppercase mb-1">Account Type</p>
                <p className="font-bold capitalize">{userType}</p>
              </div>

              {/* Logout */}
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                    window.location.href = '/';
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

