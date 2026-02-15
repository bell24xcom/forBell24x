'use client';

import React from 'react';

interface MicrophonePermissionGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MicrophonePermissionGuide({
  isOpen,
  onClose,
}: MicrophonePermissionGuideProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-lg mr-3'>
                <span>🎤</span>
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Enable Microphone Access</h2>
                <p className='text-gray-600 text-sm'>
                  Follow these steps to allow Voice RFQ recording
                </p>
              </div>
            </div>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition'>
              <span>❌</span>
            </button>
          </div>

          {/* Browser-specific instructions */}
          <div className='space-y-6'>
            {/* Chrome/Edge */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <span>🌍</span>
                <h3 className='font-semibold text-gray-900'>Chrome / Edge / Brave</h3>
              </div>
              <ol className='list-decimal list-inside space-y-2 text-sm text-gray-700'>
                <li>
                  Look for the <strong>🔒 lock icon</strong> in the address bar (left of
                  localhost:3000)
                </li>
                <li>Click on the lock icon</li>
                <li>
                  Find <strong>"Microphone"</strong> in the permissions list
                </li>
                <li>
                  Change from{' '}
                  <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-xs'>"Block"</span>{' '}
                  to{' '}
                  <span className='bg-green-100 text-green-800 px-2 py-1 rounded text-xs'>
                    "Allow"
                  </span>
                </li>
                <li>Refresh the page (F5) and try recording again</li>
              </ol>
            </div>

            {/* Firefox */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <span>🌍</span>
                <h3 className='font-semibold text-gray-900'>Firefox</h3>
              </div>
              <ol className='list-decimal list-inside space-y-2 text-sm text-gray-700'>
                <li>
                  Click the <strong>microphone icon</strong> in the address bar
                </li>
                <li>
                  Select <strong>"Allow"</strong> from the dropdown
                </li>
                <li>
                  Check <strong>"Remember this decision"</strong> for future visits
                </li>
                <li>Refresh the page and try recording again</li>
              </ol>
            </div>

            {/* Safari */}
            <div className='border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <span>🌍</span>
                <h3 className='font-semibold text-gray-900'>Safari</h3>
              </div>
              <ol className='list-decimal list-inside space-y-2 text-sm text-gray-700'>
                <li>
                  Go to <strong>Safari</strong> → <strong>Preferences</strong> (⌘,)
                </li>
                <li>
                  Click the <strong>"Websites"</strong> tab
                </li>
                <li>
                  Select <strong>"Microphone"</strong> from the left sidebar
                </li>
                <li>
                  Find <strong>localhost</strong> and change to <strong>"Allow"</strong>
                </li>
                <li>Refresh the page and try recording again</li>
              </ol>
            </div>

            {/* General troubleshooting */}
            <div className='border border-gray-200 rounded-lg p-4 bg-yellow-50'>
              <div className='flex items-center mb-3'>
                <Monitor className='h-5 w-5 text-yellow-600 mr-2' />
                <h3 className='font-semibold text-gray-900'>Still Not Working?</h3>
              </div>
              <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                <li>
                  <strong>Check system permissions:</strong> Ensure your operating system allows the
                  browser to access the microphone
                </li>
                <li>
                  <strong>Try a different browser:</strong> Some browsers have better microphone
                  support
                </li>
                <li>
                  <strong>Check microphone connection:</strong> Test your microphone in other
                  applications
                </li>
                <li>
                  <strong>Restart browser:</strong> Close and reopen your browser completely
                </li>
                <li>
                  <strong>Clear browser data:</strong> Clear site data for localhost in browser
                  settings
                </li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex items-center justify-end space-x-3 mt-6 pt-4 border-t'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 hover:text-gray-800 transition'
            >
              Close
            </button>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
