"use client";

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
    Bell, 
    ShoppingCart, 
    Search, 
    FileText, 
    Users, 
    Settings, 
    LogOut,
    TrendingUp,
    Package,
    DollarSign,
    Activity
} from 'lucide-react';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;
        
        if (!session) {
            router.push('/');
            return;
        }
        
        setIsLoading(false);
    }, [session, status, router]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    if (isLoading || status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-amber-500 rounded-full"></div>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect to home
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-white">
                                Bell<span className="text-amber-400">24h</span>
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                                <Bell className="h-5 w-5 text-gray-300" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
                                <ShoppingCart className="h-5 w-5 text-gray-300" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <img 
                                    src={session.user?.image || `https://avatar.vercel.sh/${session.user?.email}.png`} 
                                    alt="User" 
                                    className="w-8 h-8 rounded-full border-2 border-amber-400/50" 
                                />
                                <span className="text-sm text-gray-300">
                                    {session.user?.name || session.user?.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!
                    </h2>
                    <p className="text-gray-400">
                        Here's what's happening with your B2B marketplace today.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active RFQs</p>
                                <p className="text-2xl font-bold text-white">12</p>
                            </div>
                            <FileText className="h-8 w-8 text-amber-400" />
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Suppliers</p>
                                <p className="text-2xl font-bold text-white">1,247</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-white">₹2.4M</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Growth Rate</p>
                                <p className="text-2xl font-bold text-white">+18%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <button className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105">
                        <div className="flex items-center space-x-4">
                            <Search className="h-8 w-8 text-white" />
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-white">Create RFQ</h3>
                                <p className="text-amber-100 text-sm">Request quotes from suppliers</p>
                            </div>
                        </div>
                    </button>
                    
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
                        <div className="flex items-center space-x-4">
                            <Package className="h-8 w-8 text-white" />
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-white">Browse Suppliers</h3>
                                <p className="text-blue-100 text-sm">Find verified suppliers</p>
                            </div>
                        </div>
                    </button>
                    
                    <button className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105">
                        <div className="flex items-center space-x-4">
                            <Activity className="h-8 w-8 text-white" />
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-white">Analytics</h3>
                                <p className="text-green-100 text-sm">View performance insights</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-white">New RFQ created: "LED Bulbs Supply"</p>
                                <p className="text-gray-400 text-sm">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-white">3 new supplier quotes received</p>
                                <p className="text-gray-400 text-sm">4 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                            <div className="flex-1">
                                <p className="text-white">Payment processed: ₹125,000</p>
                                <p className="text-gray-400 text-sm">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 