'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    rfqs: number;
    leads: number;
    transactions: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    totalUsers: number;
    buyers: number;
    suppliers: number;
    activeUsers: number;
    newUsersThisWeek: number;
  };
}

export default function UsersPage() {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsersData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { isActive: !isActive }
        })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  if (isLoading && !usersData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-400 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Users</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 text-sm">Manage suppliers, buyers, and user roles</p>
      </div>

      {/* Stats Cards */}
      {usersData?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Users',  value: usersData.stats.totalUsers,        color: 'text-blue-400',   border: 'border-blue-500/20' },
            { label: 'Buyers',       value: usersData.stats.buyers,            color: 'text-green-400',  border: 'border-green-500/20' },
            { label: 'Suppliers',    value: usersData.stats.suppliers,         color: 'text-purple-400', border: 'border-purple-500/20' },
            { label: 'Active',       value: usersData.stats.activeUsers,       color: 'text-amber-400',  border: 'border-amber-500/20' },
          ].map(s => (
            <div key={s.label} className={`bg-slate-800/60 border ${s.border} rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search users by name, email, or phone…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          title="Filter users by role"
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Roles</option>
          <option value="BUYER">Buyers</option>
          <option value="SUPPLIER">Suppliers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">User</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Role</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Activity</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Joined</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {usersData?.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <p className="text-slate-500 text-xs">{user.email}</p>
                    {user.phone && <p className="text-slate-500 text-xs">{user.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                      user.role === 'ADMIN'    ? 'bg-red-900/50 text-red-400' :
                      user.role === 'SUPPLIER' ? 'bg-purple-900/50 text-purple-400' :
                      'bg-green-900/50 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <div>RFQs: <span className="text-white">{user._count.rfqs}</span></div>
                    <div>Leads: <span className="text-white">{user._count.leads}</span></div>
                    <div>Txns: <span className="text-white">{user._count.transactions}</span></div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                      user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        user.isActive
                          ? 'bg-red-900/40 text-red-400 hover:bg-red-900/70'
                          : 'bg-green-900/40 text-green-400 hover:bg-green-900/70'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.pagination && usersData.pagination.pages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-slate-700/50">
            <p className="text-xs text-slate-500">
              Showing {(currentPage - 1) * usersData.pagination.limit + 1}–
              {Math.min(currentPage * usersData.pagination.limit, usersData.pagination.total)} of {usersData.pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(usersData.pagination.pages, currentPage + 1))}
                disabled={currentPage === usersData.pagination.pages}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs disabled:opacity-40 hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
