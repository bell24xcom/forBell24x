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
      title: 'Lead Management',
      description: 'Monitor and manage buyer leads',
      icon: FileText,
      href: '/admin/leads',
      color: 'bg-orange-500',
      stats: '156 Leads'
    },
    {
      title: 'RFQ Management',
      description: 'Review and moderate RFQs',
      icon: MessageSquare,
      href: '/admin/rfqs',
      color: 'bg-indigo-500',
      stats: '89 Active RFQs'
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
    { label: 'Total Users', value: '1,250', change: '+12.5%', trend: 'up' },
    { label: 'Active Suppliers', value: '847', change: '+8.2%', trend: 'up' },
    { label: 'Total Revenue', value: '₹1.25Cr', change: '+15.3%', trend: 'up' },
    { label: 'System Health', value: '99.8%', change: '+0.1%', trend: 'up' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Bell24h Admin Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center`}>
                      <Database className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminModules.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <Link key={index} href={module.href} className="group block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{module.stats}</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Database: Operational</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">APIs: All Services Running</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Security: No Threats Detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
