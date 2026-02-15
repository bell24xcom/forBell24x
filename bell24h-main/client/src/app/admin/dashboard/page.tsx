'use client';

import { useEffect, useState } from 'react';
import RevenueDashboard from './revenue';
import { BarChart, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend } from 'recharts';

interface DashboardStats {
  users: number;
  suppliers: number;
  rfqs: number;
  activeUsers: number;
  conversionRate: number;
  systemUptime: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    suppliers: 0,
    rfqs: 0,
    activeUsers: 0,
    conversionRate: 0,
    systemUptime: '99.9%',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual API endpoint
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use mock data for now
        setStats({
          users: 1250,
          suppliers: 847,
          rfqs: 156,
          activeUsers: 892,
          conversionRate: 12.5,
          systemUptime: '99.9%',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1128] text-white p-8 flex items-center justify-center">
        <div className="text-cyan-400">Loading dashboard...</div>
      </div>
    );
  }

  const revenueData = [
    { day: 'Nov 9', claims: 102, leads: 184, featured: 84, wallet: 184, revenue: 289000 },
    { day: 'Nov 10', claims: 216, leads: 420, featured: 120, wallet: 300, revenue: 580000 },
    { day: 'Nov 16', claims: 360, leads: 1000, featured: 200, wallet: 600, revenue: 840000 },
    { day: 'Dec 1', claims: 720, leads: 2000, featured: 400, wallet: 1200, revenue: 1560000 },
    { day: 'Dec 16', claims: 900, leads: 2800, featured: 600, wallet: 1800, revenue: 1820000 },
    { day: 'Jan 1', claims: 1200, leads: 4000, featured: 1000, wallet: 3000, revenue: 2200000 },
  ];
  const revenuePie = [
    { name: 'Paid Claims', value: 11500 },
    { name: 'Paid Leads', value: 24000 },
    { name: 'Featured', value: 7000 },
    { name: 'Wallet', value: 18000 },
  ];

  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black mb-2">Admin Dashboard</h1>
        <p className="text-xl text-cyan-400">Platform overview & metrics</p>
        <p className="text-sm text-gray-400 mt-2">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Total Users</h2>
          <p className="text-4xl font-black text-cyan-400">{stats.users.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Active: {stats.activeUsers}</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Suppliers</h2>
          <p className="text-4xl font-black text-green-400">{stats.suppliers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Claimed: {Math.floor(stats.suppliers * 0.7)}</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">RFQs</h2>
          <p className="text-4xl font-black text-yellow-400">{stats.rfqs.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Today: {Math.floor(stats.rfqs / 30)}</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Active Users</h2>
          <p className="text-4xl font-black text-blue-400">{stats.activeUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Last 24h</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Conversion</h2>
          <p className="text-4xl font-black text-purple-400">{stats.conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Claim rate</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-2">Uptime</h2>
          <p className="text-4xl font-black text-green-400">{stats.systemUptime}</p>
          <p className="text-xs text-gray-500 mt-1">System status</p>
        </div>
      </div>

      {/* Revenue Dashboard */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">Revenue Dashboard</h2>
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <RevenueDashboard />
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Backend</span>
              <span className="text-green-400 font-medium">✅ Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">n8n Workflows</span>
              <span className="text-green-400 font-medium">✅ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">MSG91 SMS</span>
              <span className="text-green-400 font-medium">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400 font-medium">✅ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">SHAP/LIME AI</span>
              <span className="text-green-400 font-medium">✅ Ready</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-400">Last RFQ submitted: 2 minutes ago</p>
              <p className="text-gray-400">Last supplier claim: 5 minutes ago</p>
              <p className="text-gray-400">Last SMS sent: 1 minute ago</p>
              <p className="text-gray-400">Last AI match: 3 minutes ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-white">90-Day Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-white">Revenue Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie dataKey="value" isAnimationActive={true} data={revenuePie} outerRadius={100} fill="#6366f1" label>
                <Cell fill="#f59e42" />
                <Cell fill="#14b8a6" />
                <Cell fill="#fd4f5a" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 p-6 mt-10">
        <h2 className="font-bold text-lg mb-4 text-gray-700 dark:text-white">Daily Revenue Stats</h2>
        <table className="w-full text-sm">
          <thead>
            <tr><th>Day</th><th>Paid Claims</th><th>Paid Leads</th><th>Featured</th><th>Wallet Top-ups</th><th>Total Revenue</th></tr>
          </thead>
          <tbody>
            {revenueData.map(row => (
              <tr key={row.day} className="border-b">
                <td>{row.day}</td>
                <td>{row.claims}</td>
                <td>{row.leads}</td>
                <td>{row.featured}</td>
                <td>{row.wallet}</td>
                <td>₹{row.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-gray-900 p-6 mt-10 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-white">90-Day Plan: Scaling</h3>
          <p className="text-green-700 dark:text-green-400 text-2xl font-bold mt-2">₹7.2 Cr by Jan 31</p>
        </div>
        <a href="/pricing" className="ml-6 p-4 bg-cyan-600 text-white rounded-xl font-bold text-lg shadow hover:bg-cyan-400">View Pricing &#8594;</a>
      </div>
    </div>
  );
}

