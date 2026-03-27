<<<<<<< HEAD
'use client';

import Link from 'next/link';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Shield, 
  Settings, 
  BarChart3,
  FileText,
  MessageSquare,
  Database,
  Monitor
} from 'lucide-react';

export default function AdminIndexPage() {
  const adminModules = [
    {
      title: 'Dashboard',
      description: 'Platform overview and key metrics',
      icon: BarChart3,
      href: '/admin/dashboard',
      color: 'bg-blue-500',
      stats: 'Live Data'
    },
    {
      title: 'User Management',
      description: 'Manage suppliers, buyers, and roles',
      icon: Users,
      href: '/admin/users',
      color: 'bg-green-500',
      stats: '1,250 Users'
    },
    {
      title: 'Supplier Management',
      description: 'Verify and manage supplier accounts',
      icon: Building2,
      href: '/admin/suppliers',
      color: 'bg-purple-500',
      stats: '847 Suppliers'
    },
    {
      title: 'RFQ Management',
      description: 'Review and moderate RFQs',
      icon: FileText,
      href: '/admin/rfqs',
      color: 'bg-orange-500',
      stats: '156 Active RFQs'
    },
    {
      title: 'Analytics',
      description: 'Business intelligence and reports',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'bg-indigo-500',
      stats: 'Real-time'
    },
    {
      title: 'System Monitoring',
      description: 'Performance and health monitoring',
      icon: Monitor,
      href: '/admin/monitoring',
      color: 'bg-red-500',
      stats: 'Healthy'
    },
    {
      title: 'Security',
      description: 'Access control and compliance',
      icon: Shield,
      href: '/admin/security',
      color: 'bg-yellow-500',
      stats: 'Secure'
    },
    {
      title: 'Launch Metrics',
      description: 'Marketing campaign tracking',
      icon: Activity,
      href: '/admin/launch-metrics',
      color: 'bg-pink-500',
      stats: 'Active'
    }
  ];

  // Quick stats with fallback values
  const quickStats = [
    { label: 'Total Users', value: '1,250', icon: Users, color: 'text-blue-600' },
    { label: 'Suppliers', value: '847', icon: Building2, color: 'text-green-600' },
    { label: 'Revenue', value: '₹1.25Cr', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Active RFQs', value: '156', icon: FileText, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bell24H Admin Portal</h1>
              <p className="text-gray-600">Complete marketplace management and oversight</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="group block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${module.color}`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {module.stats}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  {module.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                  Access Module
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
              Approve Pending
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium">
              System Backup
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium">
              Send Notifications
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Database: Operational</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">API: Healthy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Uptime: 99.9%</span>
            </div>
          </div>
        </div>
=======
export default function AdminHome() {
  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <h1 className="text-5xl font-black mb-6 text-cyan-400">BELL Admin Dashboard</h1>
      <p className="text-xl text-gray-300 mb-8">Welcome to your command center</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/dashboard" className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-400">Platform overview & metrics</p>
        </a>
        <a href="/admin/crm" className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold mb-2">CRM</h2>
          <p className="text-gray-400">Customer relationship management</p>
        </a>
        <a href="/admin/monitoring" className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold mb-2">Monitoring</h2>
          <p className="text-gray-400">System & project monitoring</p>
        </a>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
