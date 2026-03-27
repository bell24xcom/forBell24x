'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  supplierName: string;
  supplierLogo: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  paymentStatus: 'pending' | 'paid' | 'partial';
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      supplierName: 'TechSupply Pro',
      supplierLogo: '🏭',
      productName: 'PCB Manufacturing Kit',
      quantity: 500,
      unit: 'pieces',
      totalAmount: 45000,
      status: 'delivered',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-02-15',
      actualDelivery: '2024-02-12',
      paymentStatus: 'paid',
      paymentMethod: 'Bank Transfer',
      trackingNumber: 'TRK123456789',
      notes: 'Delivered ahead of schedule, excellent quality'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      supplierName: 'TextileCraft Industries',
      supplierLogo: '🧵',
      productName: 'Premium Cotton Fabric',
      quantity: 1000,
      unit: 'meters',
      totalAmount: 25000,
      status: 'shipped',
      orderDate: '2024-01-20',
      expectedDelivery: '2024-02-25',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      trackingNumber: 'TRK987654321'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      supplierName: 'AutoParts Solutions',
      supplierLogo: '🚗',
      productName: 'Brake System Components',
      quantity: 200,
      unit: 'sets',
      totalAmount: 75000,
      status: 'in_production',
      orderDate: '2024-01-25',
      expectedDelivery: '2024-03-10',
      paymentStatus: 'partial',
      paymentMethod: 'Bank Transfer',
      notes: '50% advance payment made'
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      supplierName: 'ChemCorp Industries',
      supplierLogo: '🧪',
      productName: 'Industrial Chemicals',
      quantity: 500,
      unit: 'liters',
      totalAmount: 35000,
      status: 'confirmed',
      orderDate: '2024-01-28',
      expectedDelivery: '2024-02-28',
      paymentStatus: 'pending',
      paymentMethod: 'Pending',
      notes: 'Awaiting payment confirmation'
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      supplierName: 'MachineryMax Pro',
      supplierLogo: '⚙️',
      productName: 'CNC Machine Parts',
      quantity: 50,
      unit: 'pieces',
      totalAmount: 120000,
      status: 'pending',
      orderDate: '2024-01-30',
      expectedDelivery: '2024-03-15',
      paymentStatus: 'pending',
      paymentMethod: 'Pending'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter orders based on search and filters
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus, selectedPaymentStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'in_production': return '🏭';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/supplier/dashboard" 
            className="text-amber-600 hover:text-amber-700 mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track your orders, view order history, and manage your purchases
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => ['pending', 'confirmed', 'in_production', 'shipped'].includes(o.status)).length}
                </p>
              </div>
              <span className="text-2xl">🔄</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number, supplier, or product..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_production">In Production</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-amber-600">{filteredOrders.length}</span> orders
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-2xl">{order.supplierLogo}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.supplierName}</p>
                    <p className="font-medium text-gray-900">{order.productName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Qty: {order.quantity} {order.unit}</span>
                      <span>Ordered: {formatDate(order.orderDate)}</span>
                      <span>Expected: {formatDate(order.expectedDelivery)}</span>
                      {order.actualDelivery && (
                        <span>Delivered: {formatDate(order.actualDelivery)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/buyer/orders/${order.id}`}
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                      View Details
                    </Link>
                    {order.trackingNumber && (
                      <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                        Track
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(order.notes || order.trackingNumber) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Tracking:</span>
                        <span className="font-medium text-blue-600">{order.trackingNumber}</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500">Notes:</span>
                        <span className="text-gray-700">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' || selectedPaymentStatus !== 'all'
                ? 'Try adjusting your search criteria or filters to find more orders.'
                : 'You haven\'t placed any orders yet. Start by creating an RFQ to find suppliers.'
              }
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedPaymentStatus === 'all' && (
              <Link
                href="/buyer/rfq/create"
                className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Create Your First RFQ
              </Link>
            )}
            {(searchTerm || selectedStatus !== 'all' || selectedPaymentStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedPaymentStatus('all');
                }}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
