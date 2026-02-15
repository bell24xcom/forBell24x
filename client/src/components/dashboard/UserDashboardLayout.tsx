'use client';

<<<<<<< HEAD
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
  Shield,
  Square,
  Star,
  TrendingUp,
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

const TopNavigationBar = ({ user }) => (
  <nav className="bg-white p-4 flex items-center justify-between shadow-sm border-b border-gray-200 fixed top-0 w-full z-20">
    <div className="flex items-center space-x-4">
      <Link href="/" className="flex items-center text-blue-700 text-xl font-bold">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-amber-600 rounded-lg flex items-center justify-center mr-2">
          <span className="text-white font-bold text-sm">B24</span>
        </div>
        Bell24H
      </Link>
      <div className="hidden md:flex space-x-4 ml-6">
        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors">
          <PlusCircle size={16} className="mr-2" />
          Create RFQ
        </button>
        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors">
          <PlusCircle size={16} className="mr-2" />
          Post Product
        </button>
        <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors">
          <Video size={16} className="mr-2" />
          Upload Video
        </button>
      </div>
    </div>

    <div className="flex items-center space-x-4">
      <div className="relative">
        <Bell size={20} className="text-gray-600 hover:text-blue-600 cursor-pointer" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
      </div>
      
      <div className="relative group">
        <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none">
          <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
            <span className="text-sm font-medium">👤</span>
          </div>
          <span className="text-sm font-medium">{user?.name || 'User'}</span>
          <ChevronDown size={16} />
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Users size={16} className="mr-2" /> Profile
          </Link>
          <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Settings size={16} className="mr-2" /> Settings
          </Link>
          <Link href="/wallet" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
            <Wallet size={16} className="mr-2" /> Wallet
          </Link>
          <button className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const LeftSidebarMenu = () => (
  <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-md p-4 pt-6 border-r border-gray-200 z-10 hidden md:block">
    <nav className="space-y-2">
      {userNavigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-200"
          >
            <Icon size={20} className="mr-3" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
    
    {/* AI Chatbot Widget */}
    <div className="absolute bottom-4 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg text-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
      <MessageCircle size={20} className="inline mr-2" />
      <span className="text-sm font-medium">Chat with AI</span>
    </div>
  </aside>
);

export default function UserDashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavigationBar user={user} />
      <LeftSidebarMenu />
      
      {/* Main Content */}
      <main className="pt-20 pb-4 md:ml-64 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
=======
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import RoleSwitcher from './RoleSwitcher';

interface User {
  id?: string;
  name?: string;
  email?: string;
}

interface UserDashboardLayoutProps {
  children: React.ReactNode;
  user?: User;
}

export default function UserDashboardLayout({ children, user }: UserDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <RoleSwitcher />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
