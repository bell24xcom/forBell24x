'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Shipment {
  id: string;
  awbCode: string;
  orderId: string;
  customerName: string;
  destination: string;
  status:
    | 'NEW'
    | 'PICKED'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'EXCEPTION'
    | 'CANCELLED';
  courierPartner: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  value: number;
  weight: number;
  dimensions: string;
  trackingUrl: string;
  currentLocation?: string;
  lastUpdate: string;
  checkpoints: Array<{
    location: string;
    time: string;
    status: string;
    remarks?: string;
  }>;
}

interface LogisticsAnalytics {
  totalShipments: number;
  deliveredShipments: number;
  inTransitShipments: number;
  pendingShipments: number;
  totalValue: number;
  averageDeliveryTime: number;
  costOptimization: {
    recommendations: string[];
    courierPerformance: Array<{
      courier: string;
      totalOrders: number;
      totalCost: number;
      avgCost: number;
      successRate: number;
    }>;
  };
}

interface ShippingRate {
  courierId: number;
  courierName: string;
  totalCharge: number;
  estimatedDeliveryDays: string;
  codCharge: number;
}

export default function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'analytics' | 'calculator'>(
    'overview'
  );
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [analytics, setAnalytics] = useState<LogisticsAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);

  // Shipping Calculator State
  const [calculatorForm, setCalculatorForm] = useState({
    pickupPincode: '',
    deliveryPincode: '',
    weight: 1,
    declaredValue: 1000,
    codAmount: 0,
  });
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Sample data for development - in production, this would come from the API
  const generateSampleShipments = (): Shipment[] => {
    const statuses: Shipment['status'][] = [
      'NEW',
      'PICKED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'EXCEPTION',
    ];
    const couriers = ['Blue Dart', 'Delhivery', 'Ekart', 'FedEx', 'Professional Couriers', 'DTDC'];
    const cities = [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Chennai',
      'Hyderabad',
      'Pune',
      'Kolkata',
      'Ahmedabad',
    ];

    return Array.from({ length: 25 }, (_, i) => ({
      id: `SH${1000 + i}`,
      awbCode: `AWB${Math.random().toString().substr(2, 8)}`,
      orderId: `ORD${2000 + i}`,
      customerName: `Customer ${i + 1}`,
      destination: cities[Math.floor(Math.random() * cities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      courierPartner: couriers[Math.floor(Math.random() * couriers.length)],
      estimatedDelivery: new Date(
        Date.now() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      value: Math.floor(Math.random() * 50000) + 5000,
      weight: Math.floor(Math.random() * 20) + 1,
      dimensions: `${Math.floor(Math.random() * 30) + 10}x${Math.floor(Math.random() * 20) + 10}x${
        Math.floor(Math.random() * 15) + 5
      }`,
      trackingUrl: `https://track.courier.com/${Math.random().toString().substr(2, 8)}`,
      currentLocation:
        Math.random() > 0.5
          ? cities[Math.floor(Math.random() * cities.length)] + ' Hub'
          : undefined,
      lastUpdate: new Date(
        Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000
      ).toISOString(),
      checkpoints: [
        {
          location: 'Origin Hub',
          time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Picked Up',
          remarks: 'Package collected from sender',
        },
        {
          location: 'Transit Hub',
          time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'In Transit',
          remarks: 'Package in transit',
        },
      ],
    }));
  };

  const generateSampleAnalytics = (): LogisticsAnalytics => {
    const totalShipments = shipments.length;
    return {
      totalShipments,
      deliveredShipments: shipments.filter(s => s.status === 'DELIVERED').length,
      inTransitShipments: shipments.filter(s => s.status === 'IN_TRANSIT').length,
      pendingShipments: shipments.filter(s => s.status === 'NEW').length,
      totalValue: shipments.reduce((sum, s) => sum + s.value, 0),
      averageDeliveryTime: 3.2,
      costOptimization: {
        recommendations: [
          'Consider using Blue Dart for express deliveries (₹45 avg shipping)',
          'Delhivery has the best delivery success rate (94.2%)',
          'Consolidate shipments to metros for 15% cost savings',
        ],
        courierPerformance: [
          {
            courier: 'Blue Dart',
            totalOrders: 156,
            totalCost: 7020,
            avgCost: 45,
            successRate: 0.94,
          },
          {
            courier: 'Delhivery',
            totalOrders: 234,
            totalCost: 9360,
            avgCost: 40,
            successRate: 0.942,
          },
          {
            courier: 'Ekart',
            totalOrders: 189,
            totalCost: 6615,
            avgCost: 35,
            successRate: 0.89,
          },
          {
            courier: 'FedEx',
            totalOrders: 98,
            totalCost: 5390,
            avgCost: 55,
            successRate: 0.96,
          },
        ],
      },
    };
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    // Initialize with sample data
    setShipments(generateSampleShipments());
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    if (shipments.length > 0) {
      setAnalytics(generateSampleAnalytics());
    }
  }, [hasMounted, shipments]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // In production, call actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setShipments(generateSampleShipments());
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh logistics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingRates = async () => {
    setRatesLoading(true);
    try {
      // In production, call Shiprocket API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      const mockRates: ShippingRate[] = [
        {
          courierId: 1,
          courierName: 'Blue Dart',
          totalCharge: 65,
          estimatedDeliveryDays: '1-2',
          codCharge: 25,
        },
        {
          courierId: 2,
          courierName: 'Delhivery',
          totalCharge: 45,
          estimatedDeliveryDays: '2-3',
          codCharge: 20,
        },
        {
          courierId: 3,
          courierName: 'Ekart',
          totalCharge: 35,
          estimatedDeliveryDays: '3-4',
          codCharge: 15,
        },
        {
          courierId: 4,
          courierName: 'DTDC',
          totalCharge: 40,
          estimatedDeliveryDays: '2-4',
          codCharge: 18,
        },
        {
          courierId: 5,
          courierName: 'Professional Couriers',
          totalCharge: 38,
          estimatedDeliveryDays: '3-5',
          codCharge: 15,
        },
      ];

      setShippingRates(mockRates);
    } catch (error) {
      console.error('Failed to calculate shipping rates:', error);
    } finally {
      setRatesLoading(false);
    }
  };

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'IN_TRANSIT':
        return 'text-blue-600 bg-blue-100';
      case 'OUT_FOR_DELIVERY':
        return 'text-purple-600 bg-purple-100';
      case 'PICKED':
        return 'text-yellow-600 bg-yellow-100';
      case 'NEW':
        return 'text-gray-600 bg-gray-100';
      case 'EXCEPTION':
        return 'text-red-600 bg-red-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Shipment['status']) => {
    switch (status) {
      case 'DELIVERED':
        return <span>✅</span>;
      case 'IN_TRANSIT':
        return <span>🚚</span>;
      case 'OUT_FOR_DELIVERY':
        return <ShipIcon className='w-4 h-4' />;
      case 'PICKED':
        return <span>📦</span>;
      case 'NEW':
        return <span>🕐</span>;
      case 'EXCEPTION':
        return <AlertTriangleIcon className='w-4 h-4' />;
      case 'CANCELLED':
        return <span>❌</span>;
      default:
        return <span>📦</span>;
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch =
      shipment.awbCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const dashboardStats = analytics
    ? [
        {
          title: 'Total Shipments',
          value: analytics.totalShipments.toLocaleString(),
          icon: PackageIcon,
          color: 'bg-blue-500',
          change: '+12.5%',
        },
        {
          title: 'Delivered',
          value: analytics.deliveredShipments.toLocaleString(),
          icon: CheckCircleIcon,
          color: 'bg-green-500',
          change: '+8.2%',
        },
        {
          title: 'In Transit',
          value: analytics.inTransitShipments.toLocaleString(),
          icon: TruckIcon,
          color: 'bg-yellow-500',
          change: '+15.3%',
        },
        {
          title: 'Total Value',
          value: `₹${(analytics.totalValue / 100000).toFixed(1)}L`,
          icon: IndianRupee,
          color: 'bg-purple-500',
          change: '+22.1%',
        },
      ]
    : [];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Logistics Dashboard</h1>
              <p className='text-gray-600'>
                Shiprocket Integration - Real-time shipment management
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-500'>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className='inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
              >
                <span>🔄</span>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3Icon },
              { id: 'shipments', name: 'Shipments', icon: PackageIcon },
              { id: 'analytics', name: 'Analytics', icon: TrendingUpIcon },
              {
                id: 'calculator',
                name: 'Rate Calculator',
                icon: CalculatorIcon,
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className='w-4 h-4' />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='mt-6'>
          <AnimatePresence mode='wait'>
            {activeTab === 'overview' && (
              <motion.div
                key='overview'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-6'
              >
                {/* Stats Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {dashboardStats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium text-gray-600'>{stat.title}</p>
                          <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                          <div className='flex items-center text-sm text-green-600 mt-1'>
                            <span>📈</span>
                            {stat.change}
                          </div>
                        </div>
                        <div className={`${stat.color} p-3 rounded-lg text-white`}>
                          <stat.icon className='w-6 h-6' />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quick Actions</h3>
                    <div className='space-y-3'>
                      {[
                        {
                          icon: PackageIcon,
                          text: 'Create New Shipment',
                          action: () => {},
                        },
                        {
                          icon: SearchIcon,
                          text: 'Track Shipment',
                          action: () => setActiveTab('shipments'),
                        },
                        {
                          icon: CalculatorIcon,
                          text: 'Calculate Shipping Rates',
                          action: () => setActiveTab('calculator'),
                        },
                        {
                          icon: DownloadIcon,
                          text: 'Download Reports',
                          action: () => {},
                        },
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className='w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <action.icon className='w-5 h-5 text-gray-400 mr-3' />
                          <span className='text-gray-700'>{action.text}</span>
                          <span>→</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cost Optimization */}
                  {analytics?.costOptimization && (
                    <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                        Cost Optimization
                      </h3>
                      <div className='space-y-3'>
                        {analytics.costOptimization.recommendations.map((recommendation, index) => (
                          <div key={index} className='flex items-start p-3 bg-blue-50 rounded-lg'>
                            <span>📉</span>
                            <p className='text-sm text-blue-700'>{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'shipments' && (
              <motion.div
                key='shipments'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-6'
              >
                {/* Filters */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex-1'>
                      <div className='relative'>
                        <span>🔍</span>
                        <input
                          type='text'
                          placeholder='Search by AWB, Order ID, or Customer...'
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>
                    </div>
                    <div className='sm:w-48'>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value='all'>All Status</option>
                        <option value='NEW'>New</option>
                        <option value='PICKED'>Picked</option>
                        <option value='IN_TRANSIT'>In Transit</option>
                        <option value='OUT_FOR_DELIVERY'>Out for Delivery</option>
                        <option value='DELIVERED'>Delivered</option>
                        <option value='EXCEPTION'>Exception</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Shipments Table */}
                <div className='bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden'>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Shipment
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Customer
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Status
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Courier
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Destination
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Value
                          </th>
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {filteredShipments.slice(0, 10).map(shipment => (
                          <tr key={shipment.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div>
                                <div className='text-sm font-medium text-gray-900'>
                                  {shipment.awbCode}
                                </div>
                                <div className='text-sm text-gray-500'>{shipment.orderId}</div>
                              </div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-900'>{shipment.customerName}</div>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  shipment.status
                                )}`}
                              >
                                {getStatusIcon(shipment.status)}
                                <span className='ml-1'>{shipment.status.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {shipment.courierPartner}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {shipment.destination}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              ₹{shipment.value.toLocaleString()}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <button
                                onClick={() => setSelectedShipment(shipment)}
                                className='text-blue-600 hover:text-blue-900 mr-4'
                              >
                                <span>👁️</span>
                              </button>
                              <button
                                onClick={() => window.open(shipment.trackingUrl, '_blank')}
                                className='text-green-600 hover:text-green-900'
                              >
                                <span>📍</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'calculator' && (
              <motion.div
                key='calculator'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Calculator Form */}
                  <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Shipping Rate Calculator
                    </h3>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Pickup Pincode
                          </label>
                          <input
                            type='text'
                            value={calculatorForm.pickupPincode}
                            onChange={e =>
                              setCalculatorForm({
                                ...calculatorForm,
                                pickupPincode: e.target.value,
                              })
                            }
                            placeholder='110001'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Delivery Pincode
                          </label>
                          <input
                            type='text'
                            value={calculatorForm.deliveryPincode}
                            onChange={e =>
                              setCalculatorForm({
                                ...calculatorForm,
                                deliveryPincode: e.target.value,
                              })
                            }
                            placeholder='400001'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Weight (kg)
                          </label>
                          <input
                            type='number'
                            value={calculatorForm.weight}
                            onChange={e =>
                              setCalculatorForm({
                                ...calculatorForm,
                                weight: parseFloat(e.target.value),
                              })
                            }
                            min='0.1'
                            step='0.1'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Declared Value (₹)
                          </label>
                          <input
                            type='number'
                            value={calculatorForm.declaredValue}
                            onChange={e =>
                              setCalculatorForm({
                                ...calculatorForm,
                                declaredValue: parseFloat(e.target.value),
                              })
                            }
                            min='1'
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          COD Amount (₹)
                        </label>
                        <input
                          type='number'
                          value={calculatorForm.codAmount}
                          onChange={e =>
                            setCalculatorForm({
                              ...calculatorForm,
                              codAmount: parseFloat(e.target.value),
                            })
                          }
                          min='0'
                          placeholder='0 for prepaid'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                        />
                      </div>

                      <button
                        onClick={calculateShippingRates}
                        disabled={
                          ratesLoading ||
                          !calculatorForm.pickupPincode ||
                          !calculatorForm.deliveryPincode
                        }
                        className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                      >
                        {ratesLoading ? (
                          <span>🔄</span>
                        ) : (
                          <CalculatorIcon className='w-4 h-4 mr-2' />
                        )}
                        Calculate Rates
                      </button>
                    </div>
                  </div>

                  {/* Shipping Rates Results */}
                  <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Shipping Rates</h3>
                    {shippingRates.length > 0 ? (
                      <div className='space-y-3'>
                        {shippingRates.map(rate => (
                          <div
                            key={rate.courierId}
                            className='border border-gray-200 rounded-lg p-4'
                          >
                            <div className='flex justify-between items-start'>
                              <div>
                                <h4 className='font-medium text-gray-900'>{rate.courierName}</h4>
                                <p className='text-sm text-gray-600'>
                                  Delivery: {rate.estimatedDeliveryDays} days
                                </p>
                                {rate.codCharge > 0 && (
                                  <p className='text-sm text-gray-600'>
                                    COD Charge: ₹{rate.codCharge}
                                  </p>
                                )}
                              </div>
                              <div className='text-right'>
                                <p className='text-lg font-bold text-gray-900'>
                                  ₹{rate.totalCharge}
                                </p>
                                <button className='text-blue-600 text-sm hover:text-blue-800'>
                                  Select
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <CalculatorIcon className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-600'>Enter shipment details to calculate rates</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && analytics && (
              <motion.div
                key='analytics'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-6'
              >
                {/* Performance Metrics */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Courier Performance
                    </h3>
                    <div className='space-y-4'>
                      {analytics.costOptimization.courierPerformance.map(courier => (
                        <div
                          key={courier.courier}
                          className='border border-gray-200 rounded-lg p-4'
                        >
                          <div className='flex justify-between items-center mb-2'>
                            <h4 className='font-medium text-gray-900'>{courier.courier}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                courier.successRate > 0.9
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {(courier.successRate * 100).toFixed(1)}% Success
                            </span>
                          </div>
                          <div className='grid grid-cols-3 gap-4 text-sm'>
                            <div>
                              <p className='text-gray-600'>Orders</p>
                              <p className='font-medium'>{courier.totalOrders}</p>
                            </div>
                            <div>
                              <p className='text-gray-600'>Avg Cost</p>
                              <p className='font-medium'>₹{courier.avgCost.toFixed(0)}</p>
                            </div>
                            <div>
                              <p className='text-gray-600'>Total Spent</p>
                              <p className='font-medium'>₹{courier.totalCost.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>Key Insights</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center p-4 bg-green-50 rounded-lg'>
                        <span>✅</span>
                        <div>
                          <p className='font-medium text-green-900'>Average Delivery Time</p>
                          <p className='text-green-700'>{analytics.averageDeliveryTime} days</p>
                        </div>
                      </div>

                      <div className='flex items-center p-4 bg-blue-50 rounded-lg'>
                        <span>🚚</span>
                        <div>
                          <p className='font-medium text-blue-900'>On-time Delivery Rate</p>
                          <p className='text-blue-700'>92.3%</p>
                        </div>
                      </div>

                      <div className='flex items-center p-4 bg-purple-50 rounded-lg'>
                        <IndianRupee className='w-8 h-8 text-purple-500 mr-3' />
                        <div>
                          <p className='font-medium text-purple-900'>Cost per Shipment</p>
                          <p className='text-purple-700'>₹42 average</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Shipment Detail Modal */}
      <AnimatePresence>
        {selectedShipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            onClick={() => setSelectedShipment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}
            >
              <div className='p-6'>
                <div className='flex justify-between items-start mb-6'>
                  <div>
                    <h2 className='text-xl font-bold text-gray-900'>Shipment Details</h2>
                    <p className='text-gray-600'>{selectedShipment.awbCode}</p>
                  </div>
                  <button
                    onClick={() => setSelectedShipment(null)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    <span>❌</span>
                  </button>
                </div>

                <div className='grid grid-cols-2 gap-6 mb-6'>
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Shipment Info</h3>
                    <div className='space-y-2 text-sm'>
                      <div>
                        <span className='text-gray-600'>Order ID:</span> {selectedShipment.orderId}
                      </div>
                      <div>
                        <span className='text-gray-600'>Customer:</span>{' '}
                        {selectedShipment.customerName}
                      </div>
                      <div>
                        <span className='text-gray-600'>Destination:</span>{' '}
                        {selectedShipment.destination}
                      </div>
                      <div>
                        <span className='text-gray-600'>Weight:</span> {selectedShipment.weight} kg
                      </div>
                      <div>
                        <span className='text-gray-600'>Dimensions:</span>{' '}
                        {selectedShipment.dimensions} cm
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900 mb-2'>Delivery Info</h3>
                    <div className='space-y-2 text-sm'>
                      <div>
                        <span className='text-gray-600'>Courier:</span>{' '}
                        {selectedShipment.courierPartner}
                      </div>
                      <div>
                        <span className='text-gray-600'>Status:</span>
                        <span
                          className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                            selectedShipment.status
                          )}`}
                        >
                          {selectedShipment.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-600'>Est. Delivery:</span>{' '}
                        {selectedShipment.estimatedDelivery}
                      </div>
                      <div>
                        <span className='text-gray-600'>Value:</span> ₹
                        {selectedShipment.value.toLocaleString()}
                      </div>
                      {selectedShipment.currentLocation && (
                        <div>
                          <span className='text-gray-600'>Current Location:</span>{' '}
                          {selectedShipment.currentLocation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='font-medium text-gray-900 mb-3'>Tracking History</h3>
                  <div className='space-y-3'>
                    {selectedShipment.checkpoints.map((checkpoint, index) => (
                      <div key={index} className='flex items-start space-x-3'>
                        <div className='flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                        <div className='flex-1'>
                          <div className='flex justify-between items-start'>
                            <div>
                              <p className='font-medium text-gray-900'>{checkpoint.status}</p>
                              <p className='text-sm text-gray-600'>{checkpoint.location}</p>
                              {checkpoint.remarks && (
                                <p className='text-sm text-gray-500'>{checkpoint.remarks}</p>
                              )}
                            </div>
                            <p className='text-sm text-gray-500'>
                              {new Date(checkpoint.time).toLocaleDateString()}{' '}
                              {new Date(checkpoint.time).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
