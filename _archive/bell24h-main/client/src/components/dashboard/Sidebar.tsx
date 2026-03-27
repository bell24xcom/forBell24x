'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/contexts/RoleContext';
import {
  Home,
  Brain,
  Mic,
  Video,
  MessageCircle,
  Shield,
  CreditCard,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Wallet,
  FileText,
  Zap,
  Activity,
  DollarSign,
  Package,
  Globe,
  Calendar,
  Bell,
  Store,
  ShoppingCart,
  Building2,
  Phone,
  Mail,
  MapPin,
  Receipt,
  MessageSquare,
  Grid3x3,
  UserCircle,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  // Buyer-specific menu items
  const buyerMenuItems = [
    {
      title: 'Main',
      items: [
        { icon: Home, label: 'Dashboard Overview', href: '/dashboard' },
        { icon: Activity, label: 'Comprehensive View', href: '/dashboard/comprehensive' },
      ],
    },
    {
      title: 'AI Features',
      items: [
        { icon: Brain, label: 'AI Features Hub', href: '/dashboard/ai-features' },
        { icon: Zap, label: 'AI Insights', href: '/dashboard/ai-insights' },
        { icon: Mic, label: 'Voice RFQ', href: '/dashboard/voice-rfq' },
        { icon: Video, label: 'Video RFQ', href: '/dashboard/video-rfq' },
        { icon: Shield, label: 'Supplier Risk', href: '/dashboard/supplier-risk' },
      ],
    },
    {
      title: 'Business',
      items: [
        { icon: FileText, label: 'My RFQs', href: '/rfq' },
        { icon: MessageCircle, label: 'Negotiations', href: '/dashboard/negotiations' },
        { icon: Users, label: 'Suppliers', href: '/suppliers' },
        { icon: Users, label: 'CRM', href: '/dashboard/crm' },
      ],
    },
    {
      title: 'Financial',
      items: [
        { icon: Wallet, label: 'Wallet & Escrow', href: '/wallet' },
        { icon: CreditCard, label: 'Invoice Discounting', href: '/dashboard/invoice-discounting' },
        { icon: DollarSign, label: 'Payments', href: '/payments' },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Market Trends', href: '/dashboard/market' },
        { icon: TrendingUp, label: 'Performance', href: '/dashboard/analytics' },
      ],
    },
    {
      title: 'Automation',
      items: [
        { icon: Zap, label: 'N8N Workflows', href: '/dashboard/n8n' },
        { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Settings, label: 'Settings', href: '/settings' },
        { icon: Globe, label: 'Profile', href: '/profile' },
      ],
    },
  ];

  // Supplier-specific menu items
  const supplierMenuItems = [
    {
      title: 'Main',
      items: [
        { icon: Home, label: 'Supplier Dashboard', href: '/supplier/dashboard' },
        { icon: Activity, label: 'Analytics', href: '/supplier/analytics' },
      ],
    },
    {
      title: 'Profile & Company',
      items: [
        { icon: Building2, label: 'Company Profile', href: '/supplier/profile/edit' },
        { icon: UserCircle, label: 'Registration', href: '/supplier/registration' },
        { icon: Receipt, label: 'GST & Tax Info', href: '/supplier/gst' },
        { icon: Phone, label: 'Contact Details', href: '/supplier/contact' },
      ],
    },
    {
      title: 'Products',
      items: [
        { icon: Grid3x3, label: 'Product Showcase', href: '/supplier/products/showcase' },
        { icon: Package, label: 'Manage Products', href: '/supplier/products/manage' },
        { icon: BarChart3, label: 'Product Analytics', href: '/supplier/products/analytics' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { icon: MessageSquare, label: 'Messaging', href: '/supplier/messaging' },
        { icon: MessageCircle, label: 'Inquiries', href: '/supplier/inquiries' },
        { icon: Bell, label: 'Notifications', href: '/supplier/notifications' },
      ],
    },
    {
      title: 'Business',
      items: [
        { icon: FileText, label: 'RFQ Responses', href: '/supplier/rfq-responses' },
        { icon: TrendingUp, label: 'Performance', href: '/supplier/performance' },
        { icon: Users, label: 'Buyers', href: '/supplier/buyers' },
      ],
    },
    {
      title: 'Financial',
      items: [
        { icon: Wallet, label: 'Wallet & Payments', href: '/supplier/wallet' },
        { icon: CreditCard, label: 'Invoices', href: '/supplier/invoices' },
        { icon: DollarSign, label: 'Earnings', href: '/supplier/earnings' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Settings, label: 'Settings', href: '/settings' },
        { icon: Globe, label: 'Profile', href: '/profile' },
      ],
    },
  ];

  // Use role to determine which menu items to show
  const menuItems = role === 'supplier' ? supplierMenuItems : buyerMenuItems;

  return (
    <aside className="w-64 bg-[#0a1128] text-white p-6 overflow-y-auto h-screen border-r border-white/10">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#0070f3] rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold">B</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">BELL24h</h2>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-[#0070f3] text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="px-3 py-2 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Quick Actions</p>
          {role === 'buyer' ? (
            <Link
              href="/rfq/create"
              className="text-sm text-[#0070f3] hover:text-[#0051cc] font-medium"
            >
              + Create RFQ
            </Link>
          ) : (
            <Link
              href="/supplier/products/manage"
              className="text-sm text-[#0070f3] hover:text-[#0051cc] font-medium"
            >
              + Add Product
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

