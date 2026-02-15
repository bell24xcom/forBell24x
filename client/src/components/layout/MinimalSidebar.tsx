'use client';

import {
  BarChart3,
  Home,
  Leaf,
  Mic,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Categories', href: '/categories' },
  { icon: Mic, label: 'Voice RFQ', href: '/voice-rfq' },
  { icon: TrendingUp, label: 'Trading', href: '/trading' },
  { icon: Leaf, label: 'ESG Analytics', href: '/esg' },
  { icon: Wallet, label: 'Finance', href: '/finance' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Suppliers', href: '/suppliers' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function MinimalSidebar() {
  return (
    <div className='fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200'>
      {/* Logo */}
      <div className='flex items-center h-16 px-6 border-b border-gray-200'>
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>B24</span>
          </div>
          <span className='font-semibold text-gray-900'>Bell24H</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className='mt-6 px-3'>
        <div className='space-y-1'>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors'
              >
                <Icon className='h-5 w-5 mr-3' />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
