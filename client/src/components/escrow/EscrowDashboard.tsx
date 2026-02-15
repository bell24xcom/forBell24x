'use client';
import { getMockEscrowTransactions } from '@/services/escrowService';
import { EscrowTransaction } from '@/types/escrow';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const EscrowDashboard: React.FC = () => {
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load escrow transactions
    const mockEscrows = getMockEscrowTransactions();
    setEscrows(mockEscrows);
    setSelectedEscrow(mockEscrows[0]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-slate-600 font-medium'>Loading Escrow Transactions...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <span>✅</span>;
      case 'pending_delivery':
        return <span>🕐</span>;
      case 'funded':
        return <span>🔒</span>;
      case 'disputed':
        return <AlertTriangle className='text-red-600' size={16} />;
      default:
        return <span>🕐</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_delivery':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'funded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'disputed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getMilestoneProgress = (escrow: EscrowTransaction) => {
    const completed = escrow.milestones.filter(m => m.status === 'completed').length;
    const total = escrow.milestones.length;
    return Math.round((completed / total) * 100);
  };

  const filteredEscrows =
    filterStatus === 'all' ? escrows : escrows.filter(e => e.status === filterStatus);

  const totalValue = escrows.reduce((sum, e) => sum + e.amount, 0);
  const activeEscrows = escrows.filter(
    e => e.status !== 'completed' && e.status !== 'disputed'
  ).length;
  const completedEscrows = escrows.filter(e => e.status === 'completed').length;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center space-x-4 mb-4'>
            <Link
              href='/'
              className='flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors'
            >
              <span>←</span>
              <span>🏠</span>
              <span className='font-medium'>Back to Home</span>
            </Link>
          </div>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between'>
            <div className='mb-4 lg:mb-0'>
              <h1 className='text-3xl font-bold text-slate-900'>Smart Contract Escrow</h1>
              <p className='text-slate-600 mt-1'>
                Secure blockchain-powered transaction management
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center'>
                <span>➕</span>
                Create Escrow
              </button>
              <button className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center'>
                <span>⬇️</span>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Total Escrow Value</p>
                <p className='text-3xl font-bold text-slate-900'>
                  ₹{(totalValue / 100000).toFixed(1)}L
                </p>
                <p className='text-xs text-slate-500 mt-1'>Across {escrows.length} transactions</p>
              </div>
              <div className='p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg'>
                <span>🛡️</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Active Escrows</p>
                <p className='text-3xl font-bold text-blue-600'>{activeEscrows}</p>
                <p className='text-xs text-slate-500 mt-1'>In progress</p>
              </div>
              <div className='p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg'>
                <span>🕐</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Completed</p>
                <p className='text-3xl font-bold text-green-600'>{completedEscrows}</p>
                <p className='text-xs text-slate-500 mt-1'>Successfully finished</p>
              </div>
              <div className='p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg'>
                <span>✅</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Platform Revenue</p>
                <p className='text-3xl font-bold text-slate-900'>
                  ₹{Math.round((totalValue * 0.015) / 1000)}K
                </p>
                <p className='text-xs text-slate-500 mt-1'>From escrow fees</p>
              </div>
              <div className='p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg'>
                <span>📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-xl shadow-sm border p-6 mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
            <div className='flex items-center space-x-4'>
              <h2 className='text-2xl font-bold text-slate-900'>Escrow Transactions</h2>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>All Status</option>
                <option value='funded'>Funded</option>
                <option value='pending_delivery'>Pending Delivery</option>
                <option value='completed'>Completed</option>
                <option value='disputed'>Disputed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Escrow List & Details */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Escrow List */}
          <div className='lg:col-span-2'>
            <div className='space-y-4'>
              {filteredEscrows.map(escrow => (
                <div
                  key={escrow.id}
                  onClick={() => setSelectedEscrow(escrow)}
                  className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedEscrow?.id === escrow.id ? 'ring-2 ring-blue-500 border-blue-200' : ''
                  }`}
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h3 className='text-lg font-semibold text-slate-900'>
                        Order #{escrow.orderId}
                      </h3>
                      <p className='text-sm text-slate-600'>Escrow ID: {escrow.id}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        escrow.status
                      )}`}
                    >
                      <div className='flex items-center'>
                        {getStatusIcon(escrow.status)}
                        <span className='ml-1 capitalize'>{escrow.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div>
                      <p className='text-xs text-slate-500'>Escrow Amount</p>
                      <p className='text-lg font-bold text-slate-900'>
                        ₹{(escrow.amount / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-slate-500'>Progress</p>
                      <p className='text-lg font-bold text-blue-600'>
                        {getMilestoneProgress(escrow)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='w-full bg-slate-200 rounded-full h-2 mb-4'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${getMilestoneProgress(escrow)}%` }}
                    ></div>
                  </div>

                  <div className='flex items-center justify-between text-sm text-slate-600'>
                    <span>{escrow.milestones.length} milestones</span>
                    <span>Expires: {new Date(escrow.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Details */}
          {selectedEscrow && (
            <div className='bg-white rounded-xl shadow-sm border p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-bold text-slate-900'>Escrow Details</h3>
                <button className='px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors'>
                  View Contract
                </button>
              </div>

              <div className='space-y-6'>
                {/* Basic Info */}
                <div>
                  <h4 className='font-semibold text-slate-900 mb-3'>Transaction Info</h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Amount:</span>
                      <span className='font-medium text-slate-900'>
                        ₹{(selectedEscrow.amount / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Currency:</span>
                      <span className='font-medium text-slate-900'>{selectedEscrow.currency}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Platform Fee:</span>
                      <span className='font-medium text-slate-900'>
                        ₹{selectedEscrow.fees.platformFee.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Blockchain Fee:</span>
                      <span className='font-medium text-slate-900'>
                        ₹{selectedEscrow.fees.blockchainFee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className='font-semibold text-slate-900 mb-3'>Milestones</h4>
                  <div className='space-y-3'>
                    {selectedEscrow.milestones.map((milestone, index) => (
                      <div key={milestone.id} className='border border-slate-200 rounded-lg p-3'>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-sm font-medium text-slate-900'>
                            Milestone {index + 1}
                          </span>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              milestone.status
                            )}`}
                          >
                            {getStatusIcon(milestone.status)}
                            <span className='ml-1 capitalize'>{milestone.status}</span>
                          </div>
                        </div>
                        <p className='text-sm text-slate-600 mb-2'>{milestone.description}</p>
                        <div className='flex justify-between text-xs text-slate-500'>
                          <span>Amount: ₹{(milestone.amount / 100000).toFixed(1)}L</span>
                          <span>
                            Confirmations: {milestone.currentConfirmations}/
                            {milestone.requiredConfirmations}
                          </span>
                        </div>

                        {milestone.evidence.length > 0 && (
                          <div className='mt-2'>
                            <p className='text-xs text-slate-500 mb-1'>Evidence:</p>
                            <div className='flex flex-wrap gap-1'>
                              {milestone.evidence.map((evidence, i) => (
                                <span
                                  key={i}
                                  className='px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded'
                                >
                                  {evidence}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className='pt-4 border-t border-slate-100'>
                  <div className='space-y-2'>
                    <button className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'>
                      Confirm Milestone
                    </button>
                    <button className='w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm'>
                      Raise Dispute
                    </button>
                    <button className='w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm'>
                      View on Blockchain
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className='mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6'>
          <div className='flex items-start'>
            <span>🛡️</span>
            <div>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                🔒 Smart Contract Escrow Platform - Blockchain Security Demo
              </h3>
              <p className='text-blue-800 leading-relaxed'>
                This comprehensive escrow management system demonstrates Bell24H's
                blockchain-powered transaction security capabilities including milestone-based
                payments, automated dispute resolution, and smart contract automation for
                enterprise-grade transaction security.
              </p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  Smart Contracts
                </span>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  Milestone Payments
                </span>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  Dispute Resolution
                </span>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  Blockchain Security
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscrowDashboard;
