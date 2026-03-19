'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Brain, Calendar, CreditCard, DollarSign, FileText, Globe, 
  Heart, Home, MessageCircle, Mic, Package, Settings, Shield, Star, 
  TrendingUp, Truck, Users, Video, Wallet, Zap, PlusCircle, Lightbulb, Activity 
} from 'lucide-react';
import Link from 'next/link';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (status === 'unauthenticated') {
      router.push('/auth/login-otp'); // Explicitly redirect if no session
      return;
    }

    setIsLoading(false); // Session is ready
  }, [status, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center text-white">Loading Bell24h Dashboard...</div>;
  }

  return (
    <UserDashboardLayout session={session}>
      <div className="p-6 space-y-6 bg-[#0a0b10] min-h-screen text-gray-100">
        {/* Your Gold Standard Dashboard Content - Buyer/Supplier Tabs */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name || 'Partner'}</h1>
          <div className="bg-blue-600/20 border border-blue-500/50 px-4 py-2 rounded-full text-blue-400 text-sm animate-pulse">
            Pilot Phase — Mumbai — Controlled live test
          </div>
        </div>

        {/* Action Buttons from your tested UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link href="/dashboard/create-rfq" className="flex items-center px-4 py-3 bg-[#0066ff] text-white rounded-lg hover:bg-[#0051cc] transition-colors">
            <FileText className="w-5 h-5 mr-2" />
            Create New RFQ
          </Link>
          <Link href="/dashboard/video-rfq" className="flex items-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Video className="w-5 h-5 mr-2" />
            Upload Video RFQ
          </Link>
          {/* Add other links as needed for live users */}
        </div>
        
        {/* Main Tabs Area */}
        <div className="bg-[#15171e] rounded-xl border border-gray-800 p-6">
           {/* Include the Tab logic (Buyer/Supplier) here */}
           <p className="text-gray-400">Your categorized 450+ B2B marketplace agents are active.</p>
        </div>
      </div>
    </UserDashboardLayout>
  );
}