'use client';

import ShipmentTracker from '@/components/shipping/ShipmentTracker';
import ShippingCalculator from '@/components/shipping/ShippingCalculator';
import { useState } from 'react';

type TabType = 'calculator' | 'tracker' | 'orders' | 'analytics';

export default function ShippingDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');

  const tabs = [
    { id: 'calculator', name: 'Shipping Calculator', icon: '📦' },
    { id: 'tracker', name: 'Track Shipment', icon: '🔍' },
    { id: 'orders', name: 'My Orders', icon: '📋' },
    { id: 'analytics', name: 'Shipping Analytics', icon: '📊' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <ShippingCalculator />;
      case 'tracker':
        return <ShipmentTracker />;
      case 'orders':
        return <OrdersTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <ShippingCalculator />;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Shipping & Logistics</h1>
              <p className='text-gray-600'>Manage your shipments and track deliveries</p>
            </div>
            <div className='flex items-center space-x-4'>
              <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                Create New Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <nav className='flex space-x-8'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='py-8'>{renderTabContent()}</div>
    </div>
  );
}

// Orders Tab Component
function OrdersTab() {
  const [orders] = useState([
    {
      id: 'ORD001',
      awb: 'SR123456789',
      status: 'In Transit',
      courier: 'Delhivery',
      origin: 'Mumbai',
      destination: 'Delhi',
      created: '2024-01-15',
      estimated: '2024-01-18',
    },
    {
      id: 'ORD002',
      awb: 'SR987654321',
      status: 'Delivered',
      courier: 'Blue Dart',
      origin: 'Bangalore',
      destination: 'Chennai',
      created: '2024-01-10',
      estimated: '2024-01-12',
    },
  ]);

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='bg-white rounded-lg shadow'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>My Orders</h3>
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Order ID
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  AWB
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Courier
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Route
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {orders.map(order => (
                <tr key={order.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {order.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{order.awb}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {order.courier}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {order.origin} → {order.destination}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {order.created}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button className='text-blue-600 hover:text-blue-900 mr-3'>Track</button>
                    <button className='text-green-600 hover:text-green-900'>Invoice</button>
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

// Analytics Tab Component
function AnalyticsTab() {
  const [analytics] = useState({
    totalShipments: 156,
    delivered: 142,
    inTransit: 12,
    pending: 2,
    totalSpent: 45600,
    averageDeliveryTime: 2.3,
    topCouriers: [
      { name: 'Delhivery', shipments: 45, success: 98 },
      { name: 'Blue Dart', shipments: 32, success: 95 },
      { name: 'DTDC', shipments: 28, success: 92 },
    ],
  });

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-blue-100 text-blue-600'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Shipments</p>
              <p className='text-2xl font-bold text-gray-900'>{analytics.totalShipments}</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-green-100 text-green-600'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Delivered</p>
              <p className='text-2xl font-bold text-gray-900'>{analytics.delivered}</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-yellow-100 text-yellow-600'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>In Transit</p>
              <p className='text-2xl font-bold text-gray-900'>{analytics.inTransit}</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex items-center'>
            <div className='p-3 rounded-full bg-purple-100 text-purple-600'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Spent</p>
              <p className='text-2xl font-bold text-gray-900'>
                ₹{analytics.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Top Couriers</h3>
          <div className='space-y-4'>
            {analytics.topCouriers.map((courier, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <span className='text-sm font-medium text-gray-900'>{courier.name}</span>
                  <span className='ml-2 text-xs text-gray-500'>
                    ({courier.shipments} shipments)
                  </span>
                </div>
                <div className='flex items-center'>
                  <span className='text-sm text-green-600 font-medium'>{courier.success}%</span>
                  <div className='ml-2 w-16 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full'
                      style={{ width: `${courier.success}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Delivery Performance</h3>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Average Delivery Time</span>
              <span className='text-lg font-bold text-blue-600'>
                {analytics.averageDeliveryTime} days
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Success Rate</span>
              <span className='text-lg font-bold text-green-600'>91%</span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>On-Time Delivery</span>
              <span className='text-lg font-bold text-green-600'>89%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
