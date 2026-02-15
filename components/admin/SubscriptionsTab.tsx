'use client';

import { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: {
    name: string;
    type: 'basic' | 'premium' | 'enterprise';
    price: number;
    currency: string;
    features: string[];
  };
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  renewalDate: string;
  paymentMethod: string;
  billingCycle: 'monthly' | 'yearly';
  revenue: number;
  usage: {
    rfqLimit: number;
    rfqUsed: number;
    storageLimit: number;
    storageUsed: number;
    apiCallsLimit: number;
    apiCallsUsed: number;
  };
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  annualRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  trialConversions: number;
}

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    averageRevenuePerUser: 0,
    churnRate: 0,
    trialConversions: 0,
  });
  const [filter, setFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data - in production, this would come from your API
    const mockSubscriptions: Subscription[] = [
      {
        id: 'SUB-001',
        userId: 'USER-001',
        userName: 'TechCorp Solutions',
        userEmail: 'admin@techcorp.com',
        plan: {
          name: 'Enterprise Plan',
          type: 'enterprise',
          price: 999,
          currency: 'USD',
          features: ['Unlimited RFQs', 'Priority Support', 'Custom Integrations', 'Advanced Analytics'],
        },
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        renewalDate: '2024-12-31',
        paymentMethod: 'Credit Card',
        billingCycle: 'yearly',
        revenue: 999,
        usage: {
          rfqLimit: -1, // unlimited
          rfqUsed: 1250,
          storageLimit: 1000, // GB
          storageUsed: 450,
          apiCallsLimit: 100000,
          apiCallsUsed: 25000,
        },
      },
      {
        id: 'SUB-002',
        userId: 'USER-002',
        userName: 'Manufacturing Co',
        userEmail: 'contact@manufacturing.com',
        plan: {
          name: 'Premium Plan',
          type: 'premium',
          price: 299,
          currency: 'USD',
          features: ['500 RFQs/month', 'Priority Support', 'Advanced Analytics', 'API Access'],
        },
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        renewalDate: '2024-02-15',
        paymentMethod: 'Bank Transfer',
        billingCycle: 'monthly',
        revenue: 299,
        usage: {
          rfqLimit: 500,
          rfqUsed: 320,
          storageLimit: 100,
          storageUsed: 75,
          apiCallsLimit: 10000,
          apiCallsUsed: 6500,
        },
      },
      {
        id: 'SUB-003',
        userId: 'USER-003',
        userName: 'Startup Inc',
        userEmail: 'founder@startup.com',
        plan: {
          name: 'Basic Plan',
          type: 'basic',
          price: 99,
          currency: 'USD',
          features: ['100 RFQs/month', 'Email Support', 'Basic Analytics'],
        },
        status: 'trial',
        startDate: '2024-01-20',
        endDate: '2024-02-20',
        renewalDate: '2024-02-20',
        paymentMethod: 'Credit Card',
        billingCycle: 'monthly',
        revenue: 0,
        usage: {
          rfqLimit: 100,
          rfqUsed: 25,
          storageLimit: 10,
          storageUsed: 2,
          apiCallsLimit: 1000,
          apiCallsUsed: 150,
        },
      },
      {
        id: 'SUB-004',
        userId: 'USER-004',
        userName: 'Global Trading',
        userEmail: 'info@globaltrading.com',
        plan: {
          name: 'Premium Plan',
          type: 'premium',
          price: 299,
          currency: 'USD',
          features: ['500 RFQs/month', 'Priority Support', 'Advanced Analytics', 'API Access'],
        },
        status: 'cancelled',
        startDate: '2023-12-01',
        endDate: '2024-01-01',
        renewalDate: '2024-01-01',
        paymentMethod: 'Credit Card',
        billingCycle: 'monthly',
        revenue: 299,
        usage: {
          rfqLimit: 500,
          rfqUsed: 450,
          storageLimit: 100,
          storageUsed: 95,
          apiCallsLimit: 10000,
          apiCallsUsed: 8500,
        },
      },
      {
        id: 'SUB-005',
        userId: 'USER-005',
        userName: 'E-commerce Hub',
        userEmail: 'admin@ecommercehub.com',
        plan: {
          name: 'Enterprise Plan',
          type: 'enterprise',
          price: 999,
          currency: 'USD',
          features: ['Unlimited RFQs', 'Priority Support', 'Custom Integrations', 'Advanced Analytics'],
        },
        status: 'active',
        startDate: '2024-01-10',
        endDate: '2024-12-10',
        renewalDate: '2024-12-10',
        paymentMethod: 'Bank Transfer',
        billingCycle: 'yearly',
        revenue: 999,
        usage: {
          rfqLimit: -1,
          rfqUsed: 2100,
          storageLimit: 1000,
          storageUsed: 600,
          apiCallsLimit: 100000,
          apiCallsUsed: 45000,
        },
      },
    ];

    setSubscriptions(mockSubscriptions);

    // Calculate stats
    const totalSubscriptions = mockSubscriptions.length;
    const activeSubscriptions = mockSubscriptions.filter(sub => sub.status === 'active').length;
    const monthlyRevenue = mockSubscriptions
      .filter(sub => sub.billingCycle === 'monthly' && sub.status === 'active')
      .reduce((sum, sub) => sum + sub.revenue, 0);
    const annualRevenue = mockSubscriptions
      .filter(sub => sub.billingCycle === 'yearly' && sub.status === 'active')
      .reduce((sum, sub) => sum + sub.revenue, 0);
    const totalRevenue = monthlyRevenue + annualRevenue;
    const averageRevenuePerUser = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;
    const cancelledSubscriptions = mockSubscriptions.filter(sub => sub.status === 'cancelled').length;
    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;
    const trialConversions = mockSubscriptions.filter(sub => sub.status === 'trial').length;

    setStats({
      totalSubscriptions,
      activeSubscriptions,
      monthlyRevenue,
      annualRevenue,
      averageRevenuePerUser,
      churnRate,
      trialConversions,
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return (used / limit) * 100;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesStatus = filter === 'all' || subscription.status === filter;
    const matchesPlan = planFilter === 'all' || subscription.plan.type === planFilter;
    const matchesSearch = searchTerm === '' || 
      subscription.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPlan && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600">Monitor subscriptions, pricing, and revenue</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Data
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.monthlyRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ARPU</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.averageRevenuePerUser.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">📉</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.churnRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subscription.userName}</div>
                      <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(subscription.plan.type)}`}>
                        {subscription.plan.name}
                      </span>
                      <div className="text-sm text-gray-500">
                        ${subscription.plan.price}/{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${subscription.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subscription.billingCycle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center justify-between">
                        <span>RFQs</span>
                        <span className={getUsageColor(getUsagePercentage(subscription.usage.rfqUsed, subscription.usage.rfqLimit))}>
                          {subscription.usage.rfqLimit === -1 ? '∞' : subscription.usage.rfqUsed}/{subscription.usage.rfqLimit === -1 ? '∞' : subscription.usage.rfqLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${getUsagePercentage(subscription.usage.rfqUsed, subscription.usage.rfqLimit) >= 90 ? 'bg-red-500' : getUsagePercentage(subscription.usage.rfqUsed, subscription.usage.rfqLimit) >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(getUsagePercentage(subscription.usage.rfqUsed, subscription.usage.rfqLimit), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      View
                    </button>
                    {subscription.status === 'trial' && (
                      <button className="text-green-600 hover:text-green-900">
                        Convert
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
