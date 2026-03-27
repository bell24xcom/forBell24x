'use client';

import { useState, useEffect } from 'react';

interface ShippingRate {
  courier_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: number;
  cod_available: boolean;
}

interface ShippingFormData {
  pickupPincode: string;
  deliveryPincode: string;
  weight: number;
  cod: boolean;
  length: number;
  breadth: number;
  height: number;
}

export default function ShippingCalculator() {
  const [formData, setFormData] = useState<ShippingFormData>({
    pickupPincode: '',
    deliveryPincode: '',
    weight: 0,
    cod: false,
    length: 0,
    breadth: 0,
    height: 0
  });

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<ShippingRate | null>(null);

  const calculateRates = async () => {
    if (!formData.pickupPincode || !formData.deliveryPincode || !formData.weight) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        action: 'rates',
        pickup_pincode: formData.pickupPincode,
        delivery_pincode: formData.deliveryPincode,
        weight: formData.weight.toString(),
        cod: formData.cod.toString()
      });

      const response = await fetch(`/api/shipping/shiprocket?${params}`);
      const data = await response.json();

      if (data.success) {
        setRates(data.data);
        setSelectedCourier(null);
      } else {
        setError(data.error || 'Failed to calculate rates');
      }
    } catch (err) {
      setError('Failed to calculate shipping rates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourierSelect = (courier: ShippingRate) => {
    setSelectedCourier(courier);
  };

  const handleInputChange = (field: keyof ShippingFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Calculator</h2>
        
        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Pincode *
            </label>
            <input
              type="text"
              value={formData.pickupPincode}
              onChange={(e) => handleInputChange('pickupPincode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter pickup pincode"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Pincode *
            </label>
            <input
              type="text"
              value={formData.deliveryPincode}
              onChange={(e) => handleInputChange('deliveryPincode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter delivery pincode"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length (cm)
            </label>
            <input
              type="number"
              value={formData.length}
              onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breadth (cm)
            </label>
            <input
              type="number"
              value={formData.breadth}
              onChange={(e) => handleInputChange('breadth', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="cod"
            checked={formData.cod}
            onChange={(e) => handleInputChange('cod', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="cod" className="ml-2 block text-sm text-gray-900">
            Cash on Delivery (COD)
          </label>
        </div>

        <button
          onClick={calculateRates}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Calculating Rates...
            </div>
          ) : (
            'Calculate Shipping Rates'
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Results */}
        {rates.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Shipping Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rates.map((rate, index) => (
                <div
                  key={rate.courier_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCourier?.courier_id === rate.courier_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCourierSelect(rate)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{rate.courier_name}</h4>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{rate.rate.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Estimated Delivery: {rate.estimated_delivery_days} days</p>
                    <p>COD Available: {rate.cod_available ? 'Yes' : 'No'}</p>
                  </div>
                  {selectedCourier?.courier_id === rate.courier_id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-green-700 transition-colors">
                        Select This Option
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Option Details */}
        {selectedCourier && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Selected Shipping Option</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Courier:</span>
                <span className="ml-2 font-medium">{selectedCourier.courier_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Rate:</span>
                <span className="ml-2 font-medium text-blue-600">₹{selectedCourier.rate.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Delivery Time:</span>
                <span className="ml-2 font-medium">{selectedCourier.estimated_delivery_days} days</span>
              </div>
              <div>
                <span className="text-gray-600">COD:</span>
                <span className="ml-2 font-medium">{selectedCourier.cod_available ? 'Available' : 'Not Available'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
