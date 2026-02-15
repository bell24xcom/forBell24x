'use client';

import { Calculator } from 'lucide-react';
import { useState } from 'react';

interface ShippingRate {
  courier_company_id: number;
  courier_name: string;
  freight_charge: number;
  cod_charges: number;
  other_charges: number;
  total_charges: number;
  etd: string;
  rating?: number;
}

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState('rates');
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);

  const [rateRequest, setRateRequest] = useState({
    pickup_postcode: '',
    delivery_postcode: '',
    weight: 1,
    cod: false,
  });

  const [trackingCode, setTrackingCode] = useState('');

  const handleGetRates = async () => {
    if (!rateRequest.pickup_postcode || !rateRequest.delivery_postcode) {
      alert('Please enter both pickup and delivery pin codes');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/logistics/shiprocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_rates',
          ...rateRequest,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setRates(result.rates || []);
      } else {
        alert('Failed to fetch rates: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error connecting to shipping service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
            <span>🚚</span>
            Bell24H Logistics Hub
          </h1>
          <p className='text-gray-600'>
            Shiprocket integration for real-time shipping rates and order management
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className='bg-white rounded-lg shadow-md mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              <button
                onClick={() => setActiveTab('rates')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'rates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calculator className='w-4 h-4 inline mr-2' />
                Shipping Calculator
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tracking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>📍</span>
                Track Shipment
              </button>
            </nav>
          </div>
        </div>

        {/* Shipping Calculator Tab */}
        {activeTab === 'rates' && (
          <div className='space-y-8'>
            <div className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Calculate Shipping Rates</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Pickup Pin Code
                  </label>
                  <input
                    type='text'
                    value={rateRequest.pickup_postcode}
                    onChange={e =>
                      setRateRequest(prev => ({ ...prev, pickup_postcode: e.target.value }))
                    }
                    placeholder='400001'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Delivery Pin Code
                  </label>
                  <input
                    type='text'
                    value={rateRequest.delivery_postcode}
                    onChange={e =>
                      setRateRequest(prev => ({ ...prev, delivery_postcode: e.target.value }))
                    }
                    placeholder='110001'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Weight (kg)
                  </label>
                  <input
                    type='number'
                    value={rateRequest.weight}
                    onChange={e =>
                      setRateRequest(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))
                    }
                    min='0.5'
                    step='0.1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Cash on Delivery
                  </label>
                  <div className='flex items-center h-10'>
                    <input
                      type='checkbox'
                      checked={rateRequest.cod}
                      onChange={e => setRateRequest(prev => ({ ...prev, cod: e.target.checked }))}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <span className='ml-2 text-sm text-gray-700'>Enable COD</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleGetRates}
                disabled={loading}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2'
              >
                {loading ? (
                  <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                ) : (
                  <Calculator className='w-4 h-4' />
                )}
                {loading ? 'Calculating...' : 'Get Shipping Rates'}
              </button>
            </div>

            {/* Shipping Rates Results */}
            {rates.length > 0 && (
              <div className='bg-white rounded-lg shadow-md p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Available Shipping Options
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {rates.map((rate, index) => (
                    <div
                      key={index}
                      className='border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-semibold text-gray-900'>{rate.courier_name}</h4>
                        {rate.rating && (
                          <div className='flex items-center gap-1'>
                            <span>⭐</span>
                            <span className='text-sm text-gray-600'>{rate.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className='space-y-1 text-sm text-gray-600'>
                        <div className='flex justify-between'>
                          <span>Freight:</span>
                          <span>Rs.{rate.freight_charge}</span>
                        </div>
                        {rate.cod_charges > 0 && (
                          <div className='flex justify-between'>
                            <span>COD Charges:</span>
                            <span>Rs.{rate.cod_charges}</span>
                          </div>
                        )}
                        {rate.other_charges > 0 && (
                          <div className='flex justify-between'>
                            <span>Other Charges:</span>
                            <span>Rs.{rate.other_charges}</span>
                          </div>
                        )}
                        <hr className='my-2' />
                        <div className='flex justify-between font-semibold text-gray-900'>
                          <span>Total:</span>
                          <span>Rs.{rate.total_charges}</span>
                        </div>
                        <div className='flex items-center gap-1 text-green-600'>
                          <span>🕐</span>
                          <span className='text-xs'>ETD: {rate.etd}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Track Your Shipment</h3>
            <div className='flex gap-4 mb-6'>
              <input
                type='text'
                value={trackingCode}
                onChange={e => setTrackingCode(e.target.value)}
                placeholder='Enter tracking number'
                className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              />
              <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2'>
                <span>📍</span>
                Track
              </button>
            </div>

            <div className='text-center py-12 text-gray-500'>
              <span>📦</span>
              <p>Enter a tracking number to see shipment details</p>
            </div>
          </div>
        )}

        {/* Demo Notice */}
        <div className='mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6'>
          <div className='flex items-start'>
            <span>🚚</span>
            <div>
              <h3 className='text-lg font-semibold text-blue-900 mb-2'>
                Shiprocket Logistics Integration - Demo Environment
              </h3>
              <p className='text-blue-800 leading-relaxed'>
                This logistics hub demonstrates Bell24H's integrated shipping solution with
                Shiprocket API for real-time rate calculation, order management, and tracking
                capabilities supporting Rs.5+ crore annual logistics volume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
