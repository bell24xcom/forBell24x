'use client';

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
    );
  }

  return (
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

