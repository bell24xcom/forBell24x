'use client';

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center mb-4'>
          <span>⚙️</span>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Settings</h2>
            <p className='text-gray-600'>
              Manage your account, notifications, and security preferences
            </p>
          </div>
        </div>
        <div className='bg-gray-50 rounded-lg p-4 inline-block'>
          <div className='text-2xl font-bold text-gray-700'>Coming Soon</div>
          <div className='text-sm text-gray-600'>Personalization and security controls</div>
        </div>
      </div>
      {/* Feature Benefits */}
      <div className='bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>Settings Benefits</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-start space-x-3'>
            <span>👤</span>
            <div>
              <h4 className='font-medium text-gray-900'>Account Management</h4>
              <p className='text-sm text-gray-600'>Update profile, email, and password</p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <span>🔔</span>
            <div>
              <h4 className='font-medium text-gray-900'>Notifications</h4>
              <p className='text-sm text-gray-600'>Control alerts and communication preferences</p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <span>🛡️</span>
            <div>
              <h4 className='font-medium text-gray-900'>Security</h4>
              <p className='text-sm text-gray-600'>Manage 2FA, sessions, and privacy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
