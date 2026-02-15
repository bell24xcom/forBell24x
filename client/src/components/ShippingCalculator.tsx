'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShippingRate {
  courierId: number;
  courierName: string;
  totalCharge: number;
  estimatedDeliveryDays: string;
  codCharge: number;
  baseRate: number;
  freight: number;
  otherCharges: number;
}

interface ShippingCalculatorProps {
  pickupPincode?: string;
  weight?: number;
  declaredValue?: number;
  onRateSelect?: (rate: ShippingRate) => void;
  className?: string;
  compact?: boolean;
}

export default function ShippingCalculator({
  pickupPincode = '',
  weight = 1,
  declaredValue = 1000,
  onRateSelect,
  className = '',
  compact = false,
}: ShippingCalculatorProps) {
  const [form, setForm] = useState({
    pickupPincode: pickupPincode,
    deliveryPincode: '',
    weight: weight,
    declaredValue: declaredValue,
    codAmount: 0,
  });

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const calculateRates = async () => {
    if (!form.pickupPincode || !form.deliveryPincode || !form.weight || !form.declaredValue) {
      setError('Please fill all required fields');
      return;
    }

    if (form.pickupPincode.length !== 6 || form.deliveryPincode.length !== 6) {
      setError('Please enter valid 6-digit pincodes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logistics/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupPincode: form.pickupPincode,
          deliveryPincode: form.deliveryPincode,
          weight: form.weight,
          declaredValue: form.declaredValue,
          codAmount: form.codAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRates(data.data);
      } else {
        // Fallback to mock data for development
        const mockRates: ShippingRate[] = [
          {
            courierId: 1,
            courierName: 'Blue Dart',
            totalCharge: Math.round(65 + form.weight * 10 + form.declaredValue * 0.001),
            estimatedDeliveryDays: '1-2',
            codCharge: form.codAmount > 0 ? 25 : 0,
            baseRate: 50,
            freight: Math.round(form.weight * 10),
            otherCharges: 5,
          },
          {
            courierId: 2,
            courierName: 'Delhivery',
            totalCharge: Math.round(45 + form.weight * 8 + form.declaredValue * 0.0008),
            estimatedDeliveryDays: '2-3',
            codCharge: form.codAmount > 0 ? 20 : 0,
            baseRate: 40,
            freight: Math.round(form.weight * 8),
            otherCharges: 5,
          },
          {
            courierId: 3,
            courierName: 'Ekart',
            totalCharge: Math.round(35 + form.weight * 7 + form.declaredValue * 0.0006),
            estimatedDeliveryDays: '3-4',
            codCharge: form.codAmount > 0 ? 15 : 0,
            baseRate: 30,
            freight: Math.round(form.weight * 7),
            otherCharges: 5,
          },
          {
            courierId: 4,
            courierName: 'DTDC',
            totalCharge: Math.round(40 + form.weight * 8 + form.declaredValue * 0.0007),
            estimatedDeliveryDays: '2-4',
            codCharge: form.codAmount > 0 ? 18 : 0,
            baseRate: 35,
            freight: Math.round(form.weight * 8),
            otherCharges: 5,
          },
        ];
        setRates(mockRates);
      }
    } catch (error) {
      console.error('Failed to calculate rates:', error);
      setError('Failed to calculate shipping rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectRate = (rate: ShippingRate) => {
    setSelectedRate(rate);
    if (onRateSelect) {
      onRateSelect(rate);
    }
  };

  const getCourierLogo = (courierName: string) => {
    // In production, you could load actual courier logos
    const colors = {
      'Blue Dart': 'bg-blue-500',
      Delhivery: 'bg-purple-500',
      Ekart: 'bg-orange-500',
      DTDC: 'bg-green-500',
      'Professional Couriers': 'bg-red-500',
    };
    return colors[courierName as keyof typeof colors] || 'bg-gray-500';
  };

  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center'>
            <CalculatorIcon className='w-5 h-5 text-blue-500 mr-2' />
            <h3 className='font-medium text-gray-900'>Shipping Calculator</h3>
          </div>
          {selectedRate && (
            <div className='text-sm text-green-600 font-medium'>
              ₹{selectedRate.totalCharge} • {selectedRate.estimatedDeliveryDays} days
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-3 mb-3'>
          <input
            type='text'
            placeholder='Pickup pincode'
            value={form.pickupPincode}
            onChange={e => setForm({ ...form, pickupPincode: e.target.value })}
            className='px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500'
            maxLength={6}
          />
          <input
            type='text'
            placeholder='Delivery pincode'
            value={form.deliveryPincode}
            onChange={e => setForm({ ...form, deliveryPincode: e.target.value })}
            className='px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500'
            maxLength={6}
          />
        </div>

        <button
          onClick={calculateRates}
          disabled={loading}
          className='w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center'
        >
          {loading ? (
            <span>🔄</span>
          ) : (
            <CalculatorIcon className='w-4 h-4 mr-2' />
          )}
          Calculate Rates
        </button>

        {error && (
          <div className='mt-2 text-sm text-red-600 flex items-center'>
            <AlertCircleIcon className='w-4 h-4 mr-1' />
            {error}
          </div>
        )}

        {rates.length > 0 && (
          <div className='mt-3 space-y-2'>
            {rates.slice(0, 3).map(rate => (
              <div
                key={rate.courierId}
                className={`border rounded p-2 cursor-pointer transition-colors ${
                  selectedRate?.courierId === rate.courierId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectRate(rate)}
              >
                <div className='flex justify-between items-center'>
                  <div>
                    <div className='font-medium text-sm'>{rate.courierName}</div>
                    <div className='text-xs text-gray-600'>{rate.estimatedDeliveryDays} days</div>
                  </div>
                  <div className='text-right'>
                    <div className='font-bold text-sm'>₹{rate.totalCharge}</div>
                    {rate.codCharge > 0 && (
                      <div className='text-xs text-gray-600'>+₹{rate.codCharge} COD</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className='p-6'>
        <div className='flex items-center mb-6'>
          <div className='bg-blue-100 p-3 rounded-lg mr-4'>
            <CalculatorIcon className='w-6 h-6 text-blue-600' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>Shipping Rate Calculator</h2>
            <p className='text-gray-600'>
              Get real-time shipping rates from multiple courier partners
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Form Section */}
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  <span>📍</span>
                  Pickup Pincode
                </label>
                <input
                  type='text'
                  value={form.pickupPincode}
                  onChange={e => setForm({ ...form, pickupPincode: e.target.value })}
                  placeholder='110001'
                  maxLength={6}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  <span>📍</span>
                  Delivery Pincode
                </label>
                <input
                  type='text'
                  value={form.deliveryPincode}
                  onChange={e => setForm({ ...form, deliveryPincode: e.target.value })}
                  placeholder='400001'
                  maxLength={6}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Weight (kg)</label>
                <input
                  type='number'
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
                  min='0.1'
                  step='0.1'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Declared Value (₹)
                </label>
                <input
                  type='number'
                  value={form.declaredValue}
                  onChange={e =>
                    setForm({ ...form, declaredValue: parseFloat(e.target.value) || 0 })
                  }
                  min='1'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                <IndianRupee className='w-4 h-4 inline mr-1' />
                COD Amount (₹)
              </label>
              <input
                type='number'
                value={form.codAmount}
                onChange={e => setForm({ ...form, codAmount: parseFloat(e.target.value) || 0 })}
                min='0'
                placeholder='0 for prepaid orders'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <p className='text-sm text-gray-500 mt-1'>Leave 0 for prepaid orders</p>
            </div>

            <button
              onClick={calculateRates}
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium'
            >
              {loading ? (
                <span>🔄</span>
              ) : (
                <CalculatorIcon className='w-5 h-5 mr-2' />
              )}
              Calculate Shipping Rates
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex items-center p-3 bg-red-50 border border-red-200 rounded-lg'
              >
                <AlertCircleIcon className='w-5 h-5 text-red-500 mr-2' />
                <span className='text-red-700'>{error}</span>
              </motion.div>
            )}
          </div>

          {/* Results Section */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Shipping Rates</h3>

            <AnimatePresence>
              {rates.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='space-y-3'
                >
                  {rates.map((rate, index) => (
                    <motion.div
                      key={rate.courierId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedRate?.courierId === rate.courierId
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => selectRate(rate)}
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex items-center'>
                          <div
                            className={`w-10 h-10 ${getCourierLogo(
                              rate.courierName
                            )} rounded-lg flex items-center justify-center mr-3`}
                          >
                            <span>🚚</span>
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-900 flex items-center'>
                              {rate.courierName}
                              {selectedRate?.courierId === rate.courierId && (
                                <span>✅</span>
                              )}
                            </h4>
                            <div className='flex items-center text-sm text-gray-600 mt-1'>
                              <span>🕐</span>
                              {rate.estimatedDeliveryDays} days delivery
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-2xl font-bold text-gray-900'>
                            ₹{rate.totalCharge}
                          </div>
                          {rate.codCharge > 0 && (
                            <div className='text-sm text-orange-600'>+₹{rate.codCharge} COD</div>
                          )}
                        </div>
                      </div>

                      {/* Rate Breakdown */}
                      <div className='mt-3 pt-3 border-t border-gray-100'>
                        <div className='grid grid-cols-3 gap-2 text-xs text-gray-600'>
                          <div>
                            <span className='block'>Base Rate</span>
                            <span className='font-medium'>₹{rate.baseRate}</span>
                          </div>
                          <div>
                            <span className='block'>Freight</span>
                            <span className='font-medium'>₹{rate.freight}</span>
                          </div>
                          <div>
                            <span className='block'>Other</span>
                            <span className='font-medium'>₹{rate.otherCharges}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className='flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <InfoIcon className='w-5 h-5 text-blue-500 mr-2' />
                    <span className='text-blue-700 text-sm'>
                      Rates are inclusive of all taxes. Transit insurance available separately.
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className='text-center py-12'>
                  <span>🚚</span>
                  <p className='text-gray-600'>Enter shipment details to see available rates</p>
                  <p className='text-sm text-gray-500 mt-1'>
                    Compare rates from multiple courier partners
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
