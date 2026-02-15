'use client';

import { useState } from 'react';

export default function ShippingTestComponent() {
  const [testResult, setTestResult] = useState<string>('');

  const testShippingRates = async () => {
    try {
      const response = await fetch(
        '/api/shipping/shiprocket?action=calculate&pickup_pincode=110001&delivery_pincode=400001&weight=1&length=10&breadth=10&height=5',
        {
          method: 'GET',
        }
      );

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  const testShipmentTracking = async () => {
    try {
      const response = await fetch('/api/shipping/shiprocket?action=track&awb=123456789012', {
        method: 'GET',
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>Shiprocket Integration Test</h2>
      <div className='space-y-4'>
        <button
          onClick={testShippingRates}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4'
        >
          Test Shipping Rates
        </button>
        <button
          onClick={testShipmentTracking}
          className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'
        >
          Test Shipment Tracking
        </button>
      </div>
      {testResult && (
        <div className='mt-4'>
          <h3 className='font-semibold mb-2'>Test Result:</h3>
          <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>{testResult}</pre>
        </div>
      )}
    </div>
  );
}
