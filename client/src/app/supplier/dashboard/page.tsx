'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupplierDashboard() {
  const [currentRole, setCurrentRole] = useState('supplier');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    }
  }, []);

  const handleRoleToggle = () => {
    setCurrentRole(currentRole === 'supplier' ? 'buyer' : 'supplier');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
=======
import { useEffect, useState } from 'react';
import Link from 'next/link';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Edit3, 
  BarChart3, 
  Settings, 
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';

export default function SupplierDashboard() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch company data for logged-in supplier
    // For now, use mock data
    setCompany({
      id: '1',
      name: 'Your Company',
      productsCount: 8,
      profileViews: 127,
      inquiries: 12,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </UserDashboardLayout>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    );
  }

  return (
<<<<<<< HEAD
    <main className='max-w-7xl mx-auto py-8 px-4'>
      {/* Header with Role Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            {currentRole === 'supplier' ? 'Supplier' : 'Buyer'} Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || 'User'}! 
            {currentRole === 'supplier' 
              ? ' Manage your products and respond to RFQs.' 
              : ' Find suppliers and create RFQs.'
            }
          </p>
        </div>
        
        {/* Role Toggle Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleRoleToggle}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
          >
            <span className="flex items-center gap-2">
              {currentRole === 'supplier' ? '🛒' : '🏭'}
              Switch to {currentRole === 'supplier' ? 'Buyer' : 'Supplier'} Mode
            </span>
          </button>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          currentRole === 'supplier' 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          <span className="mr-2">
            {currentRole === 'supplier' ? '🏭' : '🛒'}
          </span>
          Currently in {currentRole === 'supplier' ? 'Supplier' : 'Buyer'} mode
        </div>
      </div>

      {currentRole === 'supplier' ? (
        /* SUPPLIER MODE */
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Active RFQs</h3>
              <p className='text-3xl font-bold text-amber-600'>42</p>
              <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Products Listed</h3>
              <p className='text-3xl font-bold text-amber-600'>12</p>
              <p className="text-sm text-gray-500 mt-1">3 pending approval</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Orders</h3>
              <p className='text-3xl font-bold text-amber-600'>8</p>
              <p className="text-sm text-gray-500 mt-1">₹2.4L this month</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h3>
            <div className='flex flex-wrap gap-4'>
              <Link 
                href='/supplier/kyc-upload' 
                className='bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors'
              >
                📄 Upload KYC
              </Link>
              <Link 
                href='/supplier/products/add' 
                className='bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors'
              >
                📦 Add Product
              </Link>
              <Link 
                href='/supplier/rfqs' 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                📋 View RFQs
              </Link>
              <Link 
                href='/supplier/orders' 
                className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
              >
                📊 Manage Orders
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Recent Activity</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-green-500'>✅</span>
                  <div>
                    <p className='font-medium'>New RFQ Received</p>
                    <p className='text-sm text-gray-500'>Electronics components - 2 hours ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>₹45K</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-blue-500'>📦</span>
                  <div>
                    <p className='font-medium'>Product Approved</p>
                    <p className='text-sm text-gray-500'>PCB Manufacturing Kit - 1 day ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>Active</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-orange-500'>💰</span>
                  <div>
                    <p className='font-medium'>Payment Received</p>
                    <p className='text-sm text-gray-500'>Order #12345 - 2 days ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>₹12.5K</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BUYER MODE */
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Active RFQs</h3>
              <p className='text-3xl font-bold text-blue-600'>8</p>
              <p className="text-sm text-gray-500 mt-1">3 pending responses</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Suppliers Found</h3>
              <p className='text-3xl font-bold text-blue-600'>156</p>
              <p className="text-sm text-gray-500 mt-1">12 new this month</p>
            </div>
            <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Orders Placed</h3>
              <p className='text-3xl font-bold text-blue-600'>23</p>
              <p className="text-sm text-gray-500 mt-1">₹4.2L total spend</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Quick Actions</h3>
            <div className='flex flex-wrap gap-4'>
              <Link 
                href='/buyer/rfq/create' 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                📋 Create RFQ
              </Link>
              <Link 
                href='/buyer/suppliers' 
                className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                🔍 Find Suppliers
              </Link>
              <Link 
                href='/buyer/orders' 
                className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors'
              >
                📦 My Orders
              </Link>
              <Link 
                href='/buyer/analytics' 
                className='bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors'
              >
                📊 Analytics
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>Recent Activity</h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-blue-500'>📋</span>
                  <div>
                    <p className='font-medium'>RFQ Created</p>
                    <p className='text-sm text-gray-500'>Electronics components - 1 hour ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>5 quotes</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-green-500'>✅</span>
                  <div>
                    <p className='font-medium'>Order Placed</p>
                    <p className='text-sm text-gray-500'>Industrial machinery - 2 days ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>₹45K</span>
              </div>
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <span className='text-purple-500'>🤝</span>
                  <div>
                    <p className='font-medium'>Supplier Connected</p>
                    <p className='text-sm text-gray-500'>TechCorp Solutions - 3 days ago</p>
                  </div>
                </div>
                <span className='text-sm text-gray-500'>Verified</span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className='bg-white rounded-xl p-6 shadow-lg border border-gray-100'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>🤖 AI Recommendations</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'>
                <h4 className='font-semibold text-blue-800 mb-2'>Top Suppliers for Electronics</h4>
                <p className='text-sm text-blue-600 mb-3'>Based on your recent RFQs</p>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>TechSupply Pro</span>
                    <span className='text-green-600'>98% match</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>ElectroCorp</span>
                    <span className='text-green-600'>95% match</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>CircuitMasters</span>
                    <span className='text-green-600'>92% match</span>
                  </div>
                </div>
              </div>
              <div className='p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200'>
                <h4 className='font-semibold text-green-800 mb-2'>Cost Optimization</h4>
                <p className='text-sm text-green-600 mb-3'>Potential savings identified</p>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Bulk ordering</span>
                    <span className='text-green-600'>Save 15%</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Alternative suppliers</span>
                    <span className='text-green-600'>Save 8%</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Payment terms</span>
                    <span className='text-green-600'>Save 5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
=======
    <UserDashboardLayout>
      <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Supplier Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your company profile and products
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company?.productsCount || 0}
                </p>
              </div>
              <Package className="h-12 w-12 text-cyan-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company?.profileViews || 0}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inquiries</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {company?.inquiries || 0}
                </p>
              </div>
              <FileText className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  +12%
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/supplier/profile/edit">
            <Card className="p-6 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg">
                  <Edit3 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your company information
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/supplier/products/manage">
            <Card className="p-6 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    Manage Products
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add and edit your products
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/supplier/analytics">
            <Card className="p-6 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View your profile performance
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  New inquiry received
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  2 hours ago
                </p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Profile viewed 5 times
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Today
                </p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </UserDashboardLayout>
  );
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
