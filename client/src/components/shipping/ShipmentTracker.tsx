'use client';

import { useState } from 'react';

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface ShipmentData {
  awb: string;
  courier_name: string;
  status: string;
  estimated_delivery: string;
  current_location: string;
  events: TrackingEvent[];
}

export default function ShipmentTracker() {
  const [awb, setAwb] = useState('');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const trackShipment = async () => {
    if (!awb.trim()) {
      setError('Please enter AWB number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        action: 'track',
        awb: awb.trim()
      });

      const response = await fetch(`/api/shipping/shiprocket?${params}`);
      const data = await response.json();

      if (data.success) {
        setShipmentData(data.data);
      } else {
        setError(data.error || 'Failed to track shipment');
      }
    } catch (err) {
      setError('Failed to track shipment');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Shipment</h2>
        
        {/* AWB Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AWB Number
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter AWB number"
            />
            <button
              onClick={trackShipment}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Tracking...
                </div>
              ) : (
                'Track'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Shipment Details */}
        {shipmentData && (
          <div className="space-y-6">
            {/* Shipment Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">AWB Number:</span>
                  <p className="font-semibold text-gray-900">{shipmentData.awb}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Courier:</span>
                  <p className="font-semibold text-gray-900">{shipmentData.courier_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipmentData.status)}`}>
                    {shipmentData.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Estimated Delivery:</span>
                  <p className="font-semibold text-gray-900">{shipmentData.estimated_delivery}</p>
                </div>
              </div>
            </div>

            {/* Current Location */}
            {shipmentData.current_location && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Current Location</h3>
                <p className="text-green-800">{shipmentData.current_location}</p>
              </div>
            )}

            {/* Tracking Timeline */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Tracking Timeline</h3>
              <div className="space-y-4">
                {shipmentData.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      {index < shipmentData.events.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 ml-1.5"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{event.status}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          {event.location && (
                            <p className="text-sm text-gray-500">📍 {event.location}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Download Invoice
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  Share Tracking
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  Get Updates
                </button>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            If you're having trouble tracking your shipment or need assistance, our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              Contact Support
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
              FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
