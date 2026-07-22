'use client';

import { Fragment, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    rfqs: number;
    quotes: number;
  };
}

interface KycDocument {
  id: string;
  documentType: 'ID_PROOF' | 'GST_CERTIFICATE' | 'BUSINESS_REGISTRATION';
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  createdAt: string;
}

const DOCUMENT_TYPE_LABEL: Record<KycDocument['documentType'], string> = {
  ID_PROOF: 'ID Proof',
  GST_CERTIFICATE: 'GST Certificate',
  BUSINESS_REGISTRATION: 'Business Registration',
};

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
    kycPending: number;
    kycApproved: number;
  };
}

export default function UsersPage() {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [documentsByUser, setDocumentsByUser] = useState<Record<string, KycDocument[]>>({});
  const [documentsLoading, setDocumentsLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);
      if (kycStatusFilter) params.append('kycStatus', kycStatusFilter);

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
  }, [currentPage, searchTerm, roleFilter, kycStatusFilter]);

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

  const toggleDocuments = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);
    if (!documentsByUser[userId]) {
      setDocumentsLoading(userId);
      try {
        const res = await fetch(`/api/kyc/documents?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setDocumentsByUser(prev => ({ ...prev, [userId]: data.documents }));
        }
      } catch (err) {
        console.error('Error fetching KYC documents:', err);
      } finally {
        setDocumentsLoading(null);
      }
    }
  };

  const reviewDocument = async (userId: string, documentId: string, status: 'VERIFIED' | 'REJECTED') => {
    let rejectionReason: string | undefined;
    if (status === 'REJECTED') {
      rejectionReason = window.prompt('Reason for rejecting this document?') || undefined;
      if (!rejectionReason?.trim()) return;
    }
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'review-kyc-document', documentId, status, rejectionReason }),
      });
      if (response.ok) {
        const res = await fetch(`/api/kyc/documents?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setDocumentsByUser(prev => ({ ...prev, [userId]: data.documents }));
        }
      }
    } catch (err) {
      console.error('Error reviewing document:', err);
    }
  };

  const toggleKycStatus = async (userId: string, isVerified: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { isVerified: !isVerified }
        })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating KYC status:', err);
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Users',  value: usersData.stats.totalUsers,        color: 'text-blue-400',   border: 'border-blue-500/20' },
            { label: 'Buyers',       value: usersData.stats.buyers,            color: 'text-green-400',  border: 'border-green-500/20' },
            { label: 'Suppliers',    value: usersData.stats.suppliers,         color: 'text-purple-400', border: 'border-purple-500/20' },
            { label: 'Active',       value: usersData.stats.activeUsers,       color: 'text-amber-400',  border: 'border-amber-500/20' },
            { label: 'KYC Pending',  value: usersData.stats.kycPending,        color: 'text-yellow-400', border: 'border-yellow-500/20' },
            { label: 'KYC Approved', value: usersData.stats.kycApproved,       color: 'text-emerald-400', border: 'border-emerald-500/20' },
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
        <select
          value={kycStatusFilter}
          onChange={(e) => { setKycStatusFilter(e.target.value); setCurrentPage(1); }}
          title="Filter users by KYC status"
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="">All KYC Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
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
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">KYC Status</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Joined</th>
                <th className="text-left text-xs text-slate-400 font-medium uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {usersData?.users.map((user) => (
                <Fragment key={user.id}>
                <tr className="hover:bg-slate-700/20 transition-colors">
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
                    <div>Quotes: <span className="text-white">{user._count.quotes}</span></div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                      user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                      user.isVerified ? 'bg-emerald-900/50 text-emerald-400' : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {user.isVerified ? '✅ Approved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
                      <button
                        onClick={() => toggleKycStatus(user.id, user.isVerified)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          user.isVerified
                            ? 'bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/70'
                            : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/70'
                        }`}
                      >
                        {user.isVerified ? 'Revoke KYC' : 'Approve KYC'}
                      </button>
                      <button
                        onClick={() => toggleDocuments(user.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900/70 transition-colors"
                      >
                        {expandedUserId === user.id ? 'Hide Docs' : 'Documents'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedUserId === user.id && (
                  <tr className="bg-slate-950/40">
                    <td colSpan={7} className="px-4 py-4">
                      {documentsLoading === user.id ? (
                        <p className="text-slate-500 text-xs">Loading documents…</p>
                      ) : !documentsByUser[user.id]?.length ? (
                        <p className="text-slate-500 text-xs">No KYC documents uploaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {documentsByUser[user.id].map(doc => (
                            <div key={doc.id} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
                              <p className="text-white text-xs font-semibold">{DOCUMENT_TYPE_LABEL[doc.documentType]}</p>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 text-xs hover:underline"
                              >
                                View file
                              </a>
                              <p className={`text-[10px] font-bold uppercase mt-1 ${
                                doc.status === 'VERIFIED' ? 'text-emerald-400' :
                                doc.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {doc.status}
                              </p>
                              {doc.status === 'REJECTED' && doc.rejectionReason && (
                                <p className="text-red-400/80 text-[10px] mt-0.5">{doc.rejectionReason}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => reviewDocument(user.id, doc.id, 'VERIFIED')}
                                  disabled={doc.status === 'VERIFIED'}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/70 disabled:opacity-30 transition-colors"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => reviewDocument(user.id, doc.id, 'REJECTED')}
                                  disabled={doc.status === 'REJECTED'}
                                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-900/40 text-red-400 hover:bg-red-900/70 disabled:opacity-30 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                </Fragment>
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
