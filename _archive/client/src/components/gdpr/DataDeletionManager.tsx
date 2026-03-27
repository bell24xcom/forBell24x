'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  rightToBeForgotten,
  DeletionRequest,
  DeletionReason,
  DeletionScope,
  DATA_RETENTION_POLICIES,
  deletionUtils,
} from '@/lib/gdpr-right-to-be-forgotten';

interface DataDeletionManagerProps {
  className?: string;
}

export default function DataDeletionManager({ className }: DataDeletionManagerProps) {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState<'request' | 'status' | 'history'>('request');
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReasonDetails, setShowReasonDetails] = useState(false);
  const [showScopeDetails, setShowScopeDetails] = useState(false);
  const [showRetentionInfo, setShowRetentionInfo] = useState(false);

  // Form state
  const [selectedReason, setSelectedReason] = useState<DeletionReason>({
    type: 'withdrawal_consent',
    description: '',
  });
  const [selectedScope, setSelectedScope] = useState<DeletionScope>({
    profile: true,
    company: false,
    rfqs: false,
    orders: false,
    communications: true,
    analytics: true,
    backups: true,
    thirdPartyShares: true,
    cookies: true,
    logs: true,
  });

  // Load deletion requests on component mount
  useEffect(() => {
    if (user?.id) {
      loadDeletionRequests();
    }
  }, [user?.id]);

  const loadDeletionRequests = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const requests = await rightToBeForgotten.getDeletionHistory(user.id);
      setDeletionRequests(requests);
    } catch (error) {
      console.error('Error loading deletion requests:', error);
      showError('Failed to load deletion requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDeletion = async () => {
    if (!user?.id) return;

    // Validate request
    const validation = rightToBeForgotten.validateDeletionRequest(selectedReason, selectedScope);

    if (!validation.valid) {
      showError(`Invalid request: ${validation.errors.join(', ')}`);
      return;
    }

    if (validation.warnings.length > 0) {
      showWarning(`Warning: ${validation.warnings.join(', ')}`);
    }

    setIsLoading(true);
    try {
      const result = await rightToBeForgotten.submitDeletionRequest(
        user.id,
        selectedReason,
        selectedScope
      );

      showSuccess(
        'Deletion request submitted successfully',
        `Request ID: ${
          result.requestId
        }. Estimated completion: ${result.estimatedCompletion.toLocaleDateString()}`
      );

      // Switch to status tab and reload requests
      setActiveTab('status');
      await loadDeletionRequests();
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      showError('Failed to submit deletion request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      const success = await rightToBeForgotten.cancelDeletionRequest(requestId);
      if (success) {
        showSuccess('Deletion request cancelled successfully');
        await loadDeletionRequests();
      } else {
        showError('Failed to cancel deletion request');
      }
    } catch (error) {
      console.error('Error cancelling deletion request:', error);
      showError('Failed to cancel deletion request');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeletionRequestForm = () => (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <div className='flex items-center space-x-2'>
          <AlertTriangle className='h-5 w-5 text-red-600' />
          <h3 className='text-lg font-semibold text-red-800'>Right to be Forgotten</h3>
        </div>
        <p className='text-red-700 mt-2'>
          This will permanently delete your personal data from our systems. This action cannot be
          undone. Please review the information below carefully before proceeding.
        </p>
      </div>

      {/* Deletion Reason */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-lg font-semibold text-gray-900'>Reason for Deletion</h4>
          <button
            onClick={() => setShowReasonDetails(!showReasonDetails)}
            className='text-blue-600 hover:text-blue-800 flex items-center space-x-1'
          >
            <Info className='h-4 w-4' />
            <span>{showReasonDetails ? 'Hide' : 'Show'} Details</span>
            {showReasonDetails ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </button>
        </div>

        <div className='space-y-3'>
          {[
            {
              type: 'withdrawal_consent',
              label: 'Withdrawal of Consent',
              description: 'I no longer consent to the processing of my personal data',
            },
            {
              type: 'no_longer_necessary',
              label: 'No Longer Necessary',
              description: 'My data is no longer needed for the original purpose',
            },
            {
              type: 'unlawful_processing',
              label: 'Unlawful Processing',
              description: 'My data is being processed unlawfully',
            },
            {
              type: 'object_to_processing',
              label: 'Object to Processing',
              description: 'I object to the processing of my personal data',
            },
            {
              type: 'direct_marketing',
              label: 'Direct Marketing',
              description: 'I object to direct marketing communications',
            },
            {
              type: 'compliance_obligation',
              label: 'Compliance Obligation',
              description: 'I have a legal obligation to delete this data',
            },
          ].map(reason => (
            <div key={reason.type} className='flex items-start space-x-3'>
              <input
                type='radio'
                id={reason.type}
                name='deletionReason'
                value={reason.type}
                checked={selectedReason.type === reason.type}
                onChange={e =>
                  setSelectedReason({ ...selectedReason, type: e.target.value as any })
                }
                className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              <div>
                <label htmlFor={reason.type} className='block text-sm font-medium text-gray-900'>
                  {reason.label}
                </label>
                {showReasonDetails && (
                  <p className='text-sm text-gray-600 mt-1'>{reason.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Additional Details (Optional)
          </label>
          <textarea
            value={selectedReason.description || ''}
            onChange={e => setSelectedReason({ ...selectedReason, description: e.target.value })}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Please provide any additional context for your deletion request...'
          />
        </div>
      </div>

      {/* Data Scope Selection */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-lg font-semibold text-gray-900'>Data to Delete</h4>
          <button
            onClick={() => setShowScopeDetails(!showScopeDetails)}
            className='text-blue-600 hover:text-blue-800 flex items-center space-x-1'
          >
            <Database className='h-4 w-4' />
            <span>{showScopeDetails ? 'Hide' : 'Show'} Details</span>
            {showScopeDetails ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {Object.entries(selectedScope).map(([key, value]) => {
            const labels = {
              profile: 'Profile Data',
              company: 'Company Information',
              rfqs: 'RFQ Records',
              orders: 'Order History',
              communications: 'Communications',
              analytics: 'Analytics Data',
              backups: 'Backup Data',
              thirdPartyShares: 'Third-party Shares',
              cookies: 'Cookies & Tracking',
              logs: 'System Logs',
            };

            const canDelete = {
              profile: true,
              company: true,
              rfqs: false,
              orders: false,
              communications: true,
              analytics: true,
              backups: true,
              thirdPartyShares: true,
              cookies: true,
              logs: true,
            };

            return (
              <div key={key} className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  id={key}
                  checked={value}
                  onChange={e => setSelectedScope({ ...selectedScope, [key]: e.target.checked })}
                  disabled={!canDelete[key as keyof typeof canDelete]}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50'
                />
                <label
                  htmlFor={key}
                  className='text-sm font-medium text-gray-900 flex items-center'
                >
                  {labels[key as keyof typeof labels]}
                  {!canDelete[key as keyof typeof canDelete] && (
                    <span>🛡️</span>
                  )}
                </label>
              </div>
            );
          })}
        </div>

        {showScopeDetails && (
          <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
            <h5 className='font-semibold text-gray-900 mb-2'>Data Retention Information</h5>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center space-x-2'>
                <span>✅</span>
                <span className='text-green-700'>Can be deleted immediately</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span>🛡️</span>
                <span className='text-yellow-700'>Retained for legal compliance (7 years)</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span>🕐</span>
                <span className='text-blue-700'>Retained temporarily (varies by data type)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Impact Summary */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h4 className='font-semibold text-blue-900 mb-2'>Deletion Impact Summary</h4>
        <div className='space-y-2 text-sm'>
          <div className='flex items-center space-x-2'>
            <Info className='h-4 w-4 text-blue-600' />
            <span className='text-blue-800'>Processing time: 7-30 days as required by GDPR</span>
          </div>
          <div className='flex items-center space-x-2'>
            <AlertTriangle className='h-4 w-4 text-blue-600' />
            <span className='text-blue-800'>Some data may be retained for legal compliance</span>
          </div>
          <div className='flex items-center space-x-2'>
            <span>👤</span>
            <span className='text-blue-800'>Identity verification may be required</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className='flex justify-end space-x-4'>
        <button
          onClick={() => setShowRetentionInfo(!showRetentionInfo)}
          className='px-4 py-2 text-blue-600 hover:text-blue-800 font-medium'
        >
          View Data Retention Policy
        </button>
        <button
          onClick={handleSubmitDeletion}
          disabled={isLoading}
          className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center space-x-2'
        >
          {isLoading ? (
            <span>🔄</span>
          ) : (
            <span>🗑️</span>
          )}
          <span>Submit Deletion Request</span>
        </button>
      </div>

      {/* Data Retention Policy */}
      {showRetentionInfo && (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
          <h4 className='font-semibold text-gray-900 mb-4'>Data Retention Policy</h4>
          <div className='space-y-3'>
            {DATA_RETENTION_POLICIES.map(policy => (
              <div key={policy.dataType} className='flex items-start space-x-3'>
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    policy.canBeDeleted ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <div>
                  <div className='font-medium text-gray-900'>
                    {policy.dataType.replace('_', ' ')}
                  </div>
                  <div className='text-sm text-gray-600'>{policy.description}</div>
                  <div className='text-sm text-gray-500'>
                    Retention: {rightToBeForgotten.formatRetentionPeriod(policy.retentionPeriod)} •
                    Legal basis: {policy.legalBasis}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDeletionStatus = () => {
    const pendingRequests = deletionRequests.filter(
      req => req.status === 'pending' || req.status === 'processing'
    );

    if (pendingRequests.length === 0) {
      return (
        <div className='text-center py-8'>
          <span>🗑️</span>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Active Deletion Requests</h3>
          <p className='text-gray-600'>You don't have any pending deletion requests.</p>
        </div>
      );
    }

    return (
      <div className='space-y-6'>
        {pendingRequests.map(request => (
          <div key={request.id} className='bg-white border border-gray-200 rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h4 className='text-lg font-semibold text-gray-900'>Deletion Request</h4>
                <p className='text-sm text-gray-600'>Request ID: {request.id}</p>
              </div>
              <div className='flex items-center space-x-2'>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Submitted</label>
                <p className='text-sm text-gray-900'>{request.requestedAt.toLocaleDateString()}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Expected Completion
                </label>
                <p className='text-sm text-gray-900'>
                  {request.estimatedCompletion.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Reason</label>
                <p className='text-sm text-gray-900'>
                  {deletionUtils.getDeletionReasonText(request.reason)}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Time Remaining
                </label>
                <p className='text-sm text-gray-900'>
                  {deletionUtils.getTimeRemaining(request.requestedAt)}
                </p>
              </div>
            </div>

            {request.status === 'pending' && (
              <div className='flex justify-end space-x-3'>
                <button
                  onClick={() => handleCancelRequest(request.id)}
                  disabled={isLoading}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 font-medium'
                >
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDeletionHistory = () => {
    const completedRequests = deletionRequests.filter(
      req => req.status === 'completed' || req.status === 'rejected' || req.status === 'cancelled'
    );

    if (completedRequests.length === 0) {
      return (
        <div className='text-center py-8'>
          <span>📄</span>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>No Deletion History</h3>
          <p className='text-gray-600'>You haven't completed any deletion requests yet.</p>
        </div>
      );
    }

    return (
      <div className='space-y-4'>
        {completedRequests.map(request => (
          <div key={request.id} className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-semibold text-gray-900'>{request.id}</h4>
                <p className='text-sm text-gray-600'>
                  {deletionUtils.getDeletionReasonText(request.reason)} • Submitted:{' '}
                  {request.requestedAt.toLocaleDateString()}
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                {request.status === 'completed' && (
                  <span>✅</span>
                )}
                {request.status === 'rejected' && <span>❌</span>}
                {request.status === 'cancelled' && <span>❌</span>}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='border-b border-gray-200'>
        <div className='flex items-center space-x-4 mb-4'>
          <span>🗑️</span>
          <h2 className='text-2xl font-bold text-gray-900'>Data Deletion</h2>
        </div>
        <p className='text-gray-600 mb-4'>
          Exercise your right to be forgotten under GDPR Article 17. Request permanent deletion of
          your personal data.
        </p>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8'>
          {[
            { id: 'request', label: 'Request Deletion', icon: Trash2 },
            { id: 'status', label: 'Status', icon: Clock },
            { id: 'history', label: 'History', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className='h-4 w-4' />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'request' && renderDeletionRequestForm()}
      {activeTab === 'status' && renderDeletionStatus()}
      {activeTab === 'history' && renderDeletionHistory()}
    </div>
  );
}
=======
import React, { useState } from 'react';

export default function DataDeletionManager() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate deletion
    setTimeout(() => {
      setIsDeleting(false);
      alert('Data deletion request submitted');
    }, 1000);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Data Deletion</h3>
      <p className="text-sm text-gray-600 mb-4">
        Request deletion of your personal data
      </p>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Processing...' : 'Request Data Deletion'}
      </button>
    </div>
  );
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
