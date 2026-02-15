'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Activity,
  Target,
  BarChart3,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// Mock Shiprocket API data
const mockLogisticsData = {
  user: { name: 'Rajesh Kumar', company: 'TechCorp Industries' },
  summary: {
    activeShipments: 12,
    delivered: 45,
    processing: 3,
    delayed: 1,
    totalValue: 2500000,
    avgDeliveryTime: 3.2,
  },
  shipments: [
    {
      id: 'SH001',
      trackingNumber: 'SR123456789',
      description: 'Industrial Equipment',
      status: 'in_transit',
      origin: 'Mumbai',
      destination: 'Delhi',
      currentLocation: 'Pune',
      estimatedDelivery: '2024-10-02',
      actualDelivery: null,
      value: 150000,
      weight: '250 kg',
      dimensions: '120x80x60 cm',
      carrier: 'Shiprocket Express',
      carrierPhone: '+91-98765-43210',
      carrierEmail: 'support@shiprocket.com',
      milestones: [
        { status: 'picked_up', location: 'Mumbai Warehouse', timestamp: '2024-09-29 10:00', completed: true },
        { status: 'in_transit', location: 'Pune Hub', timestamp: '2024-09-29 14:30', completed: true },
        { status: 'in_transit', location: 'Nagpur Hub', timestamp: '2024-09-30 08:00', completed: false },
        { status: 'out_for_delivery', location: 'Delhi Hub', timestamp: '2024-10-01 12:00', completed: false },
        { status: 'delivered', location: 'Delhi', timestamp: '2024-10-02 16:00', completed: false },
      ],
      updates: [
        { timestamp: '2024-09-29 14:30', message: 'Package picked up from Mumbai Warehouse', status: 'info' },
        { timestamp: '2024-09-29 16:45', message: 'Package arrived at Pune Hub', status: 'info' },
        { timestamp: '2024-09-30 08:00', message: 'Package departed from Pune Hub', status: 'info' },
        { timestamp: '2024-09-30 12:30', message: 'Package arrived at Nagpur Hub', status: 'info' },
      ],
    },
    {
      id: 'SH002',
      trackingNumber: 'SR123456790',
      description: 'Steel Beams',
      status: 'delivered',
      origin: 'Chennai',
      destination: 'Bangalore',
      currentLocation: 'Bangalore',
      estimatedDelivery: '2024-09-28',
      actualDelivery: '2024-09-28 14:30',
      value: 75000,
      weight: '180 kg',
      dimensions: '200x20x15 cm',
      carrier: 'Shiprocket Express',
      carrierPhone: '+91-98765-43211',
      carrierEmail: 'support@shiprocket.com',
      milestones: [
        { status: 'picked_up', location: 'Chennai Warehouse', timestamp: '2024-09-26 09:00', completed: true },
        { status: 'in_transit', location: 'Chennai Hub', timestamp: '2024-09-26 11:30', completed: true },
        { status: 'in_transit', location: 'Bangalore Hub', timestamp: '2024-09-27 15:00', completed: true },
        { status: 'out_for_delivery', location: 'Bangalore', timestamp: '2024-09-28 10:00', completed: true },
        { status: 'delivered', location: 'Bangalore', timestamp: '2024-09-28 14:30', completed: true },
      ],
      updates: [
        { timestamp: '2024-09-28 14:30', message: 'Package delivered successfully', status: 'success' },
        { timestamp: '2024-09-28 10:00', message: 'Package out for delivery', status: 'info' },
        { timestamp: '2024-09-27 15:00', message: 'Package arrived at Bangalore Hub', status: 'info' },
      ],
    },
    {
      id: 'SH003',
      trackingNumber: 'SR123456791',
      description: 'Electronics Components',
      status: 'delayed',
      origin: 'Bangalore',
      destination: 'Mumbai',
      currentLocation: 'Pune',
      estimatedDelivery: '2024-09-30',
      actualDelivery: null,
      value: 45000,
      weight: '15 kg',
      dimensions: '40x30x20 cm',
      carrier: 'Shiprocket Express',
      carrierPhone: '+91-98765-43212',
      carrierEmail: 'support@shiprocket.com',
      milestones: [
        { status: 'picked_up', location: 'Bangalore Warehouse', timestamp: '2024-09-28 14:00', completed: true },
        { status: 'in_transit', location: 'Pune Hub', timestamp: '2024-09-29 08:00', completed: true },
        { status: 'in_transit', location: 'Pune Hub', timestamp: '2024-09-30 12:00', completed: false },
        { status: 'out_for_delivery', location: 'Mumbai', timestamp: '2024-10-01 09:00', completed: false },
        { status: 'delivered', location: 'Mumbai', timestamp: '2024-10-01 17:00', completed: false },
      ],
      updates: [
        { timestamp: '2024-09-30 12:00', message: 'Delivery delayed due to weather conditions', status: 'warning' },
        { timestamp: '2024-09-29 08:00', message: 'Package arrived at Pune Hub', status: 'info' },
        { timestamp: '2024-09-28 14:00', message: 'Package picked up from Bangalore Warehouse', status: 'info' },
      ],
    },
  ],
  performance: {
    onTimeDelivery: 94.2,
    avgTransitTime: 2.8,
    customerSatisfaction: 4.6,
    costSavings: 125000,
  },
};

// Status Card Component
const StatusCard = ({ title, count, icon: Icon, color, trend, change }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="flex items-center text-sm">
          {getTrendIcon()}
          <span className="ml-1 text-gray-600">{change}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  );
};

// Shipment Card Component
const ShipmentCard = ({ shipment, onTrack }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const completedMilestones = shipment.milestones.filter(m => m.completed).length;
  const totalMilestones = shipment.milestones.length;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="text-lg font-semibold text-gray-900 mr-3">{shipment.description}</h4>
            <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusColor(shipment.status)}`}>
              {getStatusIcon(shipment.status)}
              <span className="ml-1">{shipment.status.replace('_', ' ')}</span>
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Package className="w-4 h-4 mr-1" />
            <span>#{shipment.trackingNumber}</span>
            <span className="mx-2">•</span>
            <MapPin className="w-4 h-4 mr-1" />
            <span>{shipment.origin} → {shipment.destination}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">₹{shipment.value.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Value</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: {completedMilestones}/{totalMilestones} milestones</span>
          <span>{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Current Location</div>
          <div className="text-sm font-semibold text-gray-900">{shipment.currentLocation}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Estimated Delivery</div>
          <div className="text-sm font-semibold text-gray-900">
            {shipment.actualDelivery || shipment.estimatedDelivery}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Weight</div>
          <div className="text-sm font-semibold text-gray-900">{shipment.weight}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Carrier</div>
          <div className="text-sm font-semibold text-gray-900">{shipment.carrier}</div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Recent Updates:</div>
        <div className="space-y-2">
          {shipment.updates.slice(0, 2).map((update, index) => (
            <div key={index} className="flex items-start text-xs text-gray-600">
              <Clock className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div>{update.message}</div>
                <div className="text-gray-500">{update.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onTrack(shipment.id)}
          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <Eye className="w-4 h-4 mr-1" />
          Track Details
        </button>
        
        <div className="text-xs text-gray-500">
          {shipment.carrierPhone}
        </div>
      </div>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics = ({ performance }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
      Performance Metrics
    </h3>
    
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">On-time Delivery</span>
          <span className="text-lg font-semibold text-green-600">{performance.onTimeDelivery}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Avg Transit Time</span>
          <span className="text-lg font-semibold text-blue-600">{performance.avgTransitTime} days</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Customer Satisfaction</span>
          <span className="text-lg font-semibold text-yellow-600">{performance.customerSatisfaction}/5</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Cost Savings</span>
          <span className="text-lg font-semibold text-green-600">₹{performance.costSavings.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function LogisticsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(mockLogisticsData);

  // Simulate API refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData(mockLogisticsData);
    setIsLoading(false);
  };

  const filteredShipments = data.shipments.filter(shipment => {
    const matchesFilter = filter === 'all' || shipment.status === filter;
    const matchesSearch = 
      shipment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTrack = (shipmentId) => {
    console.log('Track shipment:', shipmentId);
    // Implement detailed tracking view
  };

  const user = data.user;

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Truck className="w-6 h-6 mr-2 text-blue-600" />
              Logistics Tracking
            </h1>
            <p className="text-gray-600 mt-1">Real-time shipment tracking and logistics management via Shiprocket API</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard
            title="In Transit"
            count={data.summary.activeShipments}
            icon={Truck}
            color="blue"
            trend="up"
            change="+2 this week"
          />
          <StatusCard
            title="Delivered"
            count={data.summary.delivered}
            icon={CheckCircle}
            color="green"
            trend="up"
            change="+8 this month"
          />
          <StatusCard
            title="Processing"
            count={data.summary.processing}
            icon={Package}
            color="yellow"
            trend="down"
            change="-1 this week"
          />
          <StatusCard
            title="Delayed"
            count={data.summary.delayed}
            icon={AlertTriangle}
            color="red"
            trend="down"
            change="-2 this week"
          />
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics performance={data.performance} />

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'in_transit', 'delivered', 'processing', 'delayed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredShipments.map((shipment) => (
              <ShipmentCard
                key={shipment.id}
                shipment={shipment}
                onTrack={handleTrack}
              />
            ))}
          </div>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Live Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-800 font-medium">Live Tracking Active</span>
            <span className="text-green-600 text-sm ml-2">• Real-time updates via Shiprocket API</span>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}