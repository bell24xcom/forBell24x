'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Shield, 
  FileText,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 1250,
    totalSuppliers: 847,
    totalRevenue: 125000000,
    activeRFQs: 156,
    completedOrders: 2341,
    systemHealth: 99.8
  });

  const [revenueData] = useState([
    { month: 'Jan', revenue: 8500000, orders: 145 },
    { month: 'Feb', revenue: 9200000, orders: 167 },
    { month: 'Mar', revenue: 10100000, orders: 189 },
    { month: 'Apr', revenue: 11500000, orders: 201 },
    { month: 'May', revenue: 12800000, orders: 234 },
    { month: 'Jun', revenue: 14200000, orders: 267 }
  ]);

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Suppliers',
      value: dashboardData.totalSuppliers.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-green-500'
    },
    {
      title: 'Total Revenue',
      value: `₹${(dashboardData.totalRevenue / 10000000).toFixed(1)}Cr`,
      change: '+15.3%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Active RFQs',
      value: dashboardData.activeRFQs.toString(),
      change: '+4.1%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      title: 'System Health',
      value: `${dashboardData.systemHealth}%`,
      change: '+0.1%',
      changeType: 'positive',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      title: 'Completed Orders',
      value: dashboardData.completedOrders.toLocaleString(),
      change: '+18.7%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-indigo-500'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'New supplier registration', user: 'Textile Exports Ltd', time: '2 minutes ago', type: 'supplier' },
    { id: 2, action: 'RFQ created', user: 'Manufacturing Corp', time: '5 minutes ago', type: 'rfq' },
    { id: 3, action: 'Order completed', user: 'Global Traders', time: '12 minutes ago', type: 'order' },
    { id: 4, action: 'Payment processed', user: 'Export House', time: '18 minutes ago', type: 'payment' },
    { id: 5, action: 'Supplier verified', user: 'Quality Textiles', time: '25 minutes ago', type: 'verification' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 ${stat.color} rounded-md flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trends</h3>
              <div className="space-y-4">
                {revenueData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-900">₹{(month.revenue / 10000000).toFixed(1)}Cr</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(month.revenue / 15000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity, index) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {index !== recentActivities.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'supplier' ? 'bg-green-500' :
                              activity.type === 'rfq' ? 'bg-blue-500' :
                              activity.type === 'order' ? 'bg-purple-500' :
                              activity.type === 'payment' ? 'bg-yellow-500' : 'bg-indigo-500'
                            }`}>
                              <Activity className="w-5 h-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.action} by <span className="font-medium text-gray-900">{activity.user}</span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Health & Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">99.8%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">142ms</div>
                <div className="text-sm text-gray-500">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2.3GB</div>
                <div className="text-sm text-gray-500">Data Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">847</div>
                <div className="text-sm text-gray-500">Active Sessions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
