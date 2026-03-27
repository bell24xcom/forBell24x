'use client';

import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Clock, AlertTriangle, CheckCircle, Eye, Download, Filter, Search, Navigation } from 'lucide-react';

interface Shipment {
  id: string;
  rfqId: string;
  supplierName: string;
  buyerName: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  currentLocation: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  trackingNumber: string;
  carrier: string;
  packageDetails: {
    weight: number;
    dimensions: string;
    quantity: number;
    description: string;
  };
  milestones: Array<{
    timestamp: string;
    location: string;
    status: string;
    description: string;
  }>;
  alerts: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
}

interface DeliveryAlert {
  id: string;
  shipmentId: string;
  type: 'delay' | 'damage' | 'customs' | 'weather' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function LogisticsTracking() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [deliveryAlerts, setDeliveryAlerts] = useState<DeliveryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, selectedStatus, selectedCarrier]);

  useEffect(() => {
    filterAlerts();
  }, [deliveryAlerts, selectedSeverity]);

  const fetchLogisticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch shipments
      const shipmentsResponse = await fetch('/api/logistics/shipments');
      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json();
        setShipments(shipmentsData);
      }

      // Fetch delivery alerts
      const alertsResponse = await fetch('/api/logistics/delivery-alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setDeliveryAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error fetching logistics data:', error);
      // Fallback to mock data
      setShipments(generateMockShipments());
      setDeliveryAlerts(generateMockDeliveryAlerts());
    } finally {
      setLoading(false);
    }
  };

  const generateMockShipments = (): Shipment[] => [
    {
      id: 'SH001',
      rfqId: 'RFQ001',
      supplierName: 'TechCorp Industries',
      buyerName: 'Global Electronics Ltd',
      origin: 'Mumbai, Maharashtra',
      destination: 'Bangalore, Karnataka',
      status: 'in_transit',
      currentLocation: 'Pune, Maharashtra',
      estimatedDelivery: '2024-01-20',
      trackingNumber: 'TN123456789',
      carrier: 'BlueDart Express',
      packageDetails: {
        weight: 150,
        dimensions: '60x40x30 cm',
        quantity: 25,
        description: 'Electronic Components - Circuit Boards'
      },
      milestones: [
        {
          timestamp: '2024-01-15T10:00:00Z',
          location: 'Mumbai, Maharashtra',
          status: 'Picked up',
          description: 'Package picked up from supplier warehouse'
        },
        {
          timestamp: '2024-01-15T16:30:00Z',
          location: 'Mumbai, Maharashtra',
          status: 'In Transit',
          description: 'Package departed from Mumbai hub'
        },
        {
          timestamp: '2024-01-16T09:15:00Z',
          location: 'Pune, Maharashtra',
          status: 'In Transit',
          description: 'Package arrived at Pune sorting center'
        }
      ],
      alerts: [
        {
          type: 'info',
          message: 'Package is on schedule for delivery',
          timestamp: '2024-01-16T09:15:00Z'
        }
      ]
    },
    {
      id: 'SH002',
      rfqId: 'RFQ002',
      supplierName: 'Precision Parts Co',
      buyerName: 'Automotive Solutions',
      origin: 'Chennai, Tamil Nadu',
      destination: 'Delhi, NCR',
      status: 'delayed',
      currentLocation: 'Nagpur, Maharashtra',
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'TN987654321',
      carrier: 'DTDC Express',
      packageDetails: {
        weight: 85,
        dimensions: '45x35x25 cm',
        quantity: 12,
        description: 'Automotive Parts - Engine Components'
      },
      milestones: [
        {
          timestamp: '2024-01-14T08:00:00Z',
          location: 'Chennai, Tamil Nadu',
          status: 'Picked up',
          description: 'Package picked up from supplier warehouse'
        },
        {
          timestamp: '2024-01-14T14:00:00Z',
          location: 'Chennai, Tamil Nadu',
          status: 'In Transit',
          description: 'Package departed from Chennai hub'
        },
        {
          timestamp: '2024-01-15T11:00:00Z',
          location: 'Nagpur, Maharashtra',
          status: 'Delayed',
          description: 'Package delayed due to weather conditions'
        }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'Package delayed due to adverse weather conditions',
          timestamp: '2024-01-15T11:00:00Z'
        }
      ]
    },
    {
      id: 'SH003',
      rfqId: 'RFQ003',
      supplierName: 'Quality First Manufacturing',
      buyerName: 'Textile Industries',
      origin: 'Ahmedabad, Gujarat',
      destination: 'Kolkata, West Bengal',
      status: 'delivered',
      currentLocation: 'Kolkata, West Bengal',
      estimatedDelivery: '2024-01-17',
      actualDelivery: '2024-01-16',
      trackingNumber: 'TN456789123',
      carrier: 'FedEx Express',
      packageDetails: {
        weight: 200,
        dimensions: '80x60x40 cm',
        quantity: 8,
        description: 'Textile Machinery Parts'
      },
      milestones: [
        {
          timestamp: '2024-01-13T09:00:00Z',
          location: 'Ahmedabad, Gujarat',
          status: 'Picked up',
          description: 'Package picked up from supplier warehouse'
        },
        {
          timestamp: '2024-01-13T15:00:00Z',
          location: 'Ahmedabad, Gujarat',
          status: 'In Transit',
          description: 'Package departed from Ahmedabad hub'
        },
        {
          timestamp: '2024-01-14T12:00:00Z',
          location: 'Kolkata, West Bengal',
          status: 'Out for Delivery',
          description: 'Package out for final delivery'
        },
        {
          timestamp: '2024-01-16T14:30:00Z',
          location: 'Kolkata, West Bengal',
          status: 'Delivered',
          description: 'Package successfully delivered to recipient'
        }
      ],
      alerts: [
        {
          type: 'info',
          message: 'Package delivered successfully',
          timestamp: '2024-01-16T14:30:00Z'
        }
      ]
    }
  ];

  const generateMockDeliveryAlerts = (): DeliveryAlert[] => [
    {
      id: 'ALT001',
      shipmentId: 'SH002',
      type: 'weather',
      severity: 'medium',
      message: 'Heavy rainfall causing delays in Maharashtra region',
      timestamp: '2024-01-15T11:00:00Z',
      resolved: false
    },
    {
      id: 'ALT002',
      shipmentId: 'SH001',
      type: 'traffic',
      severity: 'low',
      message: 'Traffic congestion on Mumbai-Pune highway',
      timestamp: '2024-01-16T08:00:00Z',
      resolved: true
    },
    {
      id: 'ALT003',
      shipmentId: 'SH003',
      type: 'customs',
      severity: 'high',
      message: 'Customs clearance required for international components',
      timestamp: '2024-01-14T10:00:00Z',
      resolved: true
    }
  ];

  const filterShipments = () => {
    let filtered = shipments.filter(shipment => {
      const matchesSearch = 
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || shipment.status === selectedStatus;
      const matchesCarrier = selectedCarrier === 'all' || shipment.carrier === selectedCarrier;
      
      return matchesSearch && matchesStatus && matchesCarrier;
    });

    setFilteredShipments(filtered);
  };

  const filterAlerts = () => {
    // This would be implemented if we want to filter alerts separately
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_transit':
        return 'text-blue-600 bg-blue-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'delayed':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Tracking</h1>
          <p className="text-gray-600">Monitor shipments and manage delivery operations</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{shipments.length}</div>
          <div className="text-sm text-gray-600">Total Shipments</div>
        </div>
        <div className="bg-blue-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {shipments.filter(s => s.status === 'in_transit').length}
          </div>
          <div className="text-sm text-blue-600">In Transit</div>
        </div>
        <div className="bg-green-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {shipments.filter(s => s.status === 'delivered').length}
          </div>
          <div className="text-sm text-green-600">Delivered</div>
        </div>
        <div className="bg-orange-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {shipments.filter(s => s.status === 'delayed').length}
          </div>
          <div className="text-sm text-orange-600">Delayed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Carriers</option>
              <option value="BlueDart Express">BlueDart Express</option>
              <option value="DTDC Express">DTDC Express</option>
              <option value="FedEx Express">FedEx Express</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alert Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shipment.trackingNumber}</div>
                    <div className="text-sm text-gray-500">ID: {shipment.id}</div>
                    <div className="text-xs text-gray-400">{shipment.carrier}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div><strong>RFQ:</strong> {shipment.rfqId}</div>
                      <div><strong>From:</strong> {shipment.supplierName}</div>
                      <div><strong>To:</strong> {shipment.buyerName}</div>
                      <div className="text-xs text-gray-500">
                        {shipment.packageDetails.quantity} x {shipment.packageDetails.description}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(shipment.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{shipment.currentLocation}</div>
                    <div className="text-xs text-gray-500">
                      {shipment.milestones.length > 0 && 
                        new Date(shipment.milestones[shipment.milestones.length - 1].timestamp).toLocaleDateString()
                      }
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Est: {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                    </div>
                    {shipment.actualDelivery && (
                      <div className="text-sm text-green-600">
                        Delivered: {new Date(shipment.actualDelivery).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Alerts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Alerts</h3>
        <div className="space-y-4">
          {deliveryAlerts.map((alert) => (
            <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm text-gray-600">{alert.type}</span>
                    {!alert.resolved && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Shipment: {alert.shipmentId} • {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                  {!alert.resolved && (
                    <button className="text-green-600 hover:text-green-900 text-sm">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipment Map Placeholder */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipment Map</h3>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Interactive shipment map will be displayed here</p>
            <p className="text-sm text-gray-400">Showing real-time location tracking for active shipments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
