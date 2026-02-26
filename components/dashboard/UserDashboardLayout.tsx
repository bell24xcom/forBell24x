'use client';

import {
  BarChart3,
  Brain,
  FileBarChart,
  FileText,
  HelpCircle,
  Home,
  MessageCircle,
  Mic,
  Settings,
  Truck,
  Video,
  Wallet,
  Users,
  Bell,
  ChevronDown,
  PlusCircle,
  LogOut,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const userNavigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My RFQs', href: '/dashboard/rfqs', icon: FileText },
  { name: 'Negotiations', href: '/dashboard/negotiations', icon: MessageCircle },
  { name: 'AI Matches', href: '/dashboard/ai-matches', icon: Brain },
  { name: 'Suppliers', href: '/dashboard/suppliers', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Logistics', href: '/dashboard/logistics', icon: Truck },
  { name: 'Wallet & Escrow', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Invoice Discounting', href: '/dashboard/invoice-discounting', icon: CreditCard },
  { name: 'Video RFQ', href: '/dashboard/video-rfq', icon: Video },
  { name: 'Voice RFQ', href: '/dashboard/voice-rfq', icon: Mic },
  { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
];

const TopNavigationBar = ({ user }: any) => (
  <nav className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shadow-sm fixed top-0 w-full z-20">
    <div className="flex items-center space-x-4">
      <Link href="/" className="flex items-center text-blue-400 text-xl font-bold">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-amber-600 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white font-bold text-sm">B24</span>
        </div>
        Bell24H
      </Link>
      <div className="hidden md:flex space-x-4 ml-6">
        <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors">
          <PlusCircle size={16} className="mr-2" />
          Create RFQ
        </button>
        <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors">
          <PlusCircle size={16} className="mr-2" />
          Post Product
        </button>
        <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-md transition-colors">
          <Video size={16} className="mr-2" />
          Upload Video
        </button>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <div className="relative">
        <Bell size={20} className="text-slate-400 hover:text-blue-400 cursor-pointer" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
      </div>

      <div className="relative group">
        <button className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 focus:outline-none">
          <div className="bg-slate-700 rounded-full h-8 w-8 flex items-center justify-center">
            <span className="text-sm font-medium">👤</span>
          </div>
          <span className="text-sm font-medium">{user?.name || 'User'}</span>
          <ChevronDown size={16} />
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
          <Link href="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center">
            <Users size={16} className="mr-2" /> Profile
          </Link>
          <Link href="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center">
            <Settings size={16} className="mr-2" /> Settings
          </Link>
          <Link href="/wallet" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center">
            <Wallet size={16} className="mr-2" /> Wallet
          </Link>
          <button className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center">
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const LeftSidebarMenu = () => (
  <aside className="fixed left-0 top-16 h-full w-64 bg-slate-900 border-r border-slate-800 shadow-md p-4 pt-6 z-10 hidden md:block">
    <nav className="space-y-2">
      {userNavigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition-colors duration-200"
          >
            <Icon size={20} className="mr-3" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>

    <div className="absolute bottom-4 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg text-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
      <MessageCircle size={20} className="inline mr-2" />
      <span className="text-sm font-medium">Chat with AI</span>
    </div>
  </aside>
);

export default function UserDashboardLayout({ children, user }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <TopNavigationBar user={user} />
      <LeftSidebarMenu />

      <main className="pt-20 pb-4 md:ml-64 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
