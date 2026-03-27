'use client';
import { useState } from 'react';
import { FileText, ShoppingCart, Users, DollarSign, Plus, Search, BarChart3, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const stats = [
    { title: 'Active RFQs', value: '12', icon: FileText, color: 'text-blue-400' },
    { title: 'Pending Orders', value: '5', icon: ShoppingCart, color: 'text-orange-400' },
    { title: 'Suppliers Connected', value: '48', icon: Users, color: 'text-green-400' },
    { title: 'Monthly Spend', value: '₹2.1L', icon: DollarSign, color: 'text-purple-400' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'rfq_created',
      title: 'New RFQ Created',
      description: 'Electronics components for Q4 production',
      time: '2 hours ago',
      status: 'pending',
    },
    {
      id: 2,
      type: 'supplier_matched',
      title: 'Supplier Matched',
      description: 'TechCorp Solutions matched to your RFQ',
      time: '4 hours ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'order_placed',
      title: 'Order Placed',
      description: '₹45,000 order for industrial machinery',
      time: '1 day ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'payment_processed',
      title: 'Payment Processed',
      description: '₹12,500 payment to ABC Suppliers',
      time: '2 days ago',
      status: 'success',
    },
  ];

  const quickActions = [
    { title: 'Create RFQ', icon: Plus, action: () => alert('Create RFQ clicked') },
    { title: 'Find Suppliers', icon: Search, action: () => alert('Find Suppliers clicked') },
    { title: 'View Reports', icon: BarChart3, action: () => alert('View Reports clicked') },
    { title: 'Schedule Demo', icon: Calendar, action: () => alert('Schedule Demo clicked') },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <span>✅</span>;
      case 'pending':
        return <span>🕐</span>;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-400' />;
      default:
        return <span>✅</span>;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <header className='bg-slate-800/50 backdrop-blur-sm border-b border-slate-700'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <div className='text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent'>
                Bell24H
              </div>
              <div className='text-sm text-slate-400 border-l border-slate-600 pl-4'>Dashboard</div>
            </div>

            <div className='flex items-center space-x-4'>
              <button className='text-slate-400 hover:text-amber-400 transition-colors'>
                <span>🔔</span>
              </button>
              <button className='text-slate-400 hover:text-amber-400 transition-colors'>
                <span>⚙️</span>
              </button>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center'>
                  <span className='text-white font-medium text-sm'>
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </div>
                <div className='text-sm'>
                  <div className='text-white font-medium'>{user.name}</div>
                  <div className='text-slate-400'>{user.company}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className='text-slate-400 hover:text-red-400 transition-colors'
              >
                <span>🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='bg-slate-800/30 border-b border-slate-700'>
        <div className='container mx-auto px-4'>
          <div className='flex space-x-8'>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'rfqs', label: 'My RFQs', icon: FileText },
              { id: 'suppliers', label: 'Suppliers', icon: Users },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <tab.icon className='h-4 w-4' />
                <span className='font-medium'>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        {activeTab === 'dashboard' && (
          <div className='space-y-8'>
            {/* Welcome Section */}
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>
              <p className='text-slate-400'>
                Here's what's happening with your Global B2B Operating System today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 hover:bg-slate-700/50 transition-colors group'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div
                      className={`p-3 rounded-xl bg-slate-700/50 group-hover:scale-110 transition-transform`}
                    >
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <span>📈</span>
                  </div>
                  <div className='text-3xl font-bold text-white mb-1'>{stat.value}</div>
                  <div className='text-slate-400 text-sm'>{stat.title}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>Quick Actions</h2>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className='flex flex-col items-center space-y-3 p-4 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-colors group'
                  >
                    <div className='p-3 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors'>
                      <action.icon className='h-6 w-6 text-amber-400' />
                    </div>
                    <span className='text-slate-300 font-medium text-sm'>{action.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-white'>Recent Activity</h2>
                <button className='text-amber-400 hover:text-amber-300 text-sm font-medium'>
                  View All
                </button>
              </div>
              <div className='space-y-4'>
                {recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className='flex items-center space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors'
                  >
                    <div className='flex-shrink-0'>{getStatusIcon(activity.status)}</div>
                    <div className='flex-1'>
                      <div className='text-white font-medium'>{activity.title}</div>
                      <div className='text-slate-400 text-sm'>{activity.description}</div>
                    </div>
                    <div className='text-slate-500 text-sm'>{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Procurement Performance</h3>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-400'>Cost Savings</span>
                    <span className='text-green-400 font-bold'>15.2%</span>
                  </div>
                  <div className='w-full bg-slate-700 rounded-full h-2'>
                    <div className='bg-green-400 h-2 rounded-full' style={{ width: '15.2%' }}></div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-slate-400'>Supplier Response Time</span>
                    <span className='text-blue-400 font-bold'>2.3 days</span>
                  </div>
                  <div className='w-full bg-slate-700 rounded-full h-2'>
                    <div className='bg-blue-400 h-2 rounded-full' style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>

              <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>Upcoming Deadlines</h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 bg-slate-700/30 rounded-lg'>
                    <div>
                      <div className='text-white font-medium'>RFQ Submission</div>
                      <div className='text-slate-400 text-sm'>Electronics Components</div>
                    </div>
                    <div className='text-amber-400 font-bold'>2 days</div>
                  </div>
                  <div className='flex items-center justify-between p-3 bg-slate-700/30 rounded-lg'>
                    <div>
                      <div className='text-white font-medium'>Payment Due</div>
                      <div className='text-slate-400 text-sm'>ABC Suppliers</div>
                    </div>
                    <div className='text-orange-400 font-bold'>5 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rfqs' && (
          <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-6'>My RFQs</h2>
            <p className='text-slate-400'>RFQ management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-6'>Suppliers</h2>
            <p className='text-slate-400'>Supplier management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-6'>Orders</h2>
            <p className='text-slate-400'>Order management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6'>
            <h2 className='text-2xl font-bold text-white mb-6'>Analytics</h2>
            <p className='text-slate-400'>Analytics dashboard coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}
