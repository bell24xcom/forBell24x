'use client';

import ESGTestComponent from '@/components/esg/ESGTestComponent';
import ShippingTestComponent from '@/components/shipping/ShippingTestComponent';
import { useState } from 'react';

export default function TestFeaturesPage() {
  const [activeTab, setActiveTab] = useState('esg');

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            BELL24H Feature Testing Dashboard
          </h1>
          <p className='text-gray-600'>Test and verify all implemented features</p>
        </div>

        {/* Tab Navigation */}
        <div className='bg-white rounded-lg shadow-md mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('esg')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'esg'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ESG Scoring System
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shipping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shiprocket Integration
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Traffic Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className='space-y-6'>
          {activeTab === 'esg' && (
            <div>
              <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h2 className='text-2xl font-semibold mb-4'>ESG Scoring System</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Features Implemented:</h3>
                    <ul className='list-disc list-inside space-y-1 text-gray-600'>
                      <li>Environmental scoring (carbon emissions, energy efficiency, etc.)</li>
                      <li>Social scoring (labor rights, community engagement, etc.)</li>
                      <li>Governance scoring (board diversity, transparency, etc.)</li>
                      <li>Industry benchmarking</li>
                      <li>Automated recommendations</li>
                      <li>Historical score tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Business Value:</h3>
                    <ul className='list-disc list-inside space-y-1 text-gray-600'>
                      <li>₹15 Crore revenue potential</li>
                      <li>Compliance reporting</li>
                      <li>Investor confidence</li>
                      <li>Sustainability tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
              <ESGTestComponent />
            </div>
          )}

          {activeTab === 'shipping' && (
            <div>
              <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h2 className='text-2xl font-semibold mb-4'>Shiprocket Integration</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Features Implemented:</h3>
                    <ul className='list-disc list-inside space-y-1 text-gray-600'>
                      <li>Real-time shipping rate calculation</li>
                      <li>Shipment tracking with AWB</li>
                      <li>Order creation and management</li>
                      <li>Multiple courier options</li>
                      <li>Shipping analytics dashboard</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Business Value:</h3>
                    <ul className='list-disc list-inside space-y-1 text-gray-600'>
                      <li>₹5 Crore revenue potential</li>
                      <li>Logistics optimization</li>
                      <li>Cost reduction</li>
                      <li>Customer satisfaction</li>
                    </ul>
                  </div>
                </div>
              </div>
              <ShippingTestComponent />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h2 className='text-2xl font-semibold mb-4'>Traffic Analytics System</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Features Implemented:</h3>
                    <ul className='list-disc list-inside space-y-1 text-gray-600'>
                      <li>Page view tracking</li>
                      <li>User interaction analytics</li>
                      <li>Conversion tracking</li>
                      <li>Traffic source analysis</li>
                      <li>Real-time dashboards</li>
                      <li>Session management</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Business Value:</h3>
                    <ul className='list-disc list-inside space-y-1 text-gray-600'>
                      <li>Data-driven decisions</li>
                      <li>User behavior insights</li>
                      <li>Performance optimization</li>
                      <li>ROI measurement</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-medium mb-4'>Analytics Dashboard</h3>
                <p className='text-gray-600 mb-4'>
                  Visit the analytics dashboard to see real-time traffic data and insights.
                </p>
                <a
                  href='/analytics/traffic'
                  className='inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'
                >
                  View Analytics Dashboard
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Implementation Status */}
        <div className='bg-white rounded-lg shadow-md p-6 mt-8'>
          <h2 className='text-2xl font-semibold mb-4'>Implementation Status</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='font-medium'>Traffic Analytics</h3>
              <p className='text-sm text-gray-600'>Complete</p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='font-medium'>Shiprocket Integration</h3>
              <p className='text-sm text-gray-600'>Complete</p>
            </div>
            <div className='text-center'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='font-medium'>ESG Scoring System</h3>
              <p className='text-sm text-gray-600'>Complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
