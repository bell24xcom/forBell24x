import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  usage: {
    voiceRfqs: number;
    supplierContacts: number;
    searches: number;
  };
  limits: {
    voiceRfqs: number;
    supplierContacts: number;
    searches: number;
  };
}

interface TrialManagementProps {
  userId: string;
  onUpgrade: () => void;
}

export default function TrialManagement({ userId, onUpgrade }: TrialManagementProps) {
  const router = useRouter();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isActive: true,
    daysRemaining: 30,
    usage: {
      voiceRfqs: 0,
      supplierContacts: 0,
      searches: 0,
    },
    limits: {
      voiceRfqs: 5,
      supplierContacts: 20,
      searches: 100,
    },
  });

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    // Load trial status from API
    loadTrialStatus();
  }, [userId]);

  const loadTrialStatus = async () => {
    try {
      const response = await fetch(`/api/trial/status/${userId}`);
      const data = await response.json();
      setTrialStatus(data);

      // Show upgrade prompt if limits reached
      if (
        data.usage.voiceRfqs >= data.limits.voiceRfqs ||
        data.usage.supplierContacts >= data.limits.supplierContacts
      ) {
        setShowUpgradePrompt(true);
      }
    } catch (error) {
      console.error('Failed to load trial status:', error);
    }
  };

  const trackUsage = async (feature: 'voiceRfqs' | 'supplierContacts' | 'searches') => {
    if (trialStatus.usage[feature] >= trialStatus.limits[feature]) {
      setShowUpgradePrompt(true);
      return false;
    }

    try {
      await fetch('/api/trial/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, feature }),
      });

      setTrialStatus(prev => ({
        ...prev,
        usage: {
          ...prev.usage,
          [feature]: prev.usage[feature] + 1,
        },
      }));

      return true;
    } catch (error) {
      console.error('Failed to track usage:', error);
      return false;
    }
  };

  const getUsagePercentage = (feature: keyof typeof trialStatus.usage) => {
    return (trialStatus.usage[feature] / trialStatus.limits[feature]) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      {/* Trial Status Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Trial Dashboard</h2>
          <p className='text-gray-600'>
            {trialStatus.isActive
              ? `${trialStatus.daysRemaining} days remaining in your free trial`
              : 'Trial expired - upgrade to continue'}
          </p>
        </div>

        {trialStatus.isActive && (
          <div className='text-right'>
            <div className='text-3xl font-bold text-blue-600'>{trialStatus.daysRemaining}</div>
            <div className='text-sm text-gray-500'>Days Left</div>
          </div>
        )}
      </div>

      {/* Usage Tracking */}
      <div className='space-y-4 mb-6'>
        <h3 className='text-lg font-semibold text-gray-900'>Feature Usage</h3>

        {/* Voice RFQs */}
        <div className='border rounded-lg p-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium'>Voice RFQ Requests</span>
            <span className='text-sm text-gray-600'>
              {trialStatus.usage.voiceRfqs} / {trialStatus.limits.voiceRfqs}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${getProgressColor(getUsagePercentage('voiceRfqs'))}`}
              style={{ width: `${Math.min(getUsagePercentage('voiceRfqs'), 100)}%` }}
            />
          </div>
        </div>

        {/* Supplier Contacts */}
        <div className='border rounded-lg p-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium'>Supplier Contacts</span>
            <span className='text-sm text-gray-600'>
              {trialStatus.usage.supplierContacts} / {trialStatus.limits.supplierContacts}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${getProgressColor(
                getUsagePercentage('supplierContacts')
              )}`}
              style={{ width: `${Math.min(getUsagePercentage('supplierContacts'), 100)}%` }}
            />
          </div>
        </div>

        {/* Searches */}
        <div className='border rounded-lg p-4'>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium'>AI Searches</span>
            <span className='text-sm text-gray-600'>
              {trialStatus.usage.searches} / {trialStatus.limits.searches}
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${getProgressColor(getUsagePercentage('searches'))}`}
              style={{ width: `${Math.min(getUsagePercentage('searches'), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6'>
          <div className='flex items-center mb-4'>
            <div className='flex-shrink-0'>
              <svg
                className='h-8 w-8 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-lg font-medium text-blue-900'>Upgrade to Continue</h3>
              <p className='text-blue-700'>
                You've reached your trial limits. Upgrade to unlock unlimited access!
              </p>
            </div>
          </div>

          <div className='flex space-x-3'>
            <button
              onClick={onUpgrade}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors'
            >
              Upgrade Now
            </button>
            <button
              onClick={() => setShowUpgradePrompt(false)}
              className='text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors'
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Trial Benefits */}
      <div className='bg-gray-50 rounded-lg p-4'>
        <h4 className='font-semibold text-gray-900 mb-2'>Trial Benefits</h4>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>• Access to 50+ business categories</li>
          <li>• AI-powered Voice RFQ system</li>
          <li>• Advanced search and analytics</li>
          <li>• Supplier discovery and contact</li>
          <li>• Professional B2B marketplace experience</li>
        </ul>
      </div>
    </div>
  );
}
