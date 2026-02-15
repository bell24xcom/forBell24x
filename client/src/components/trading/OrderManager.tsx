'use client';

import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

interface TradingOrder {
  id: string;
  commodity: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop-loss';
  quantity: number;
  unit: string;
  price: number;
  totalValue: number;
  status: 'pending' | 'executed' | 'cancelled' | 'partial';
  executedQuantity: number;
  remainingQuantity: number;
  orderDate: string;
  executionDate?: string;
  exchange: string;
  category: string;
}

const OrderManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Demo trading orders data
  const orders: TradingOrder[] = [
    {
      id: 'ORD-001',
      commodity: 'Wheat',
      symbol: 'WHEAT-2024',
      type: 'buy',
      orderType: 'limit',
      quantity: 100,
      unit: 'MT',
      price: 24500,
      totalValue: 24500000,
      status: 'executed',
      executedQuantity: 100,
      remainingQuantity: 0,
      orderDate: '2024-01-15',
      executionDate: '2024-01-15',
      exchange: 'NCDEX',
      category: 'Food Grains',
    },
    {
      id: 'ORD-002',
      commodity: 'Steel Rods',
      symbol: 'STEEL-TMT',
      type: 'sell',
      orderType: 'market',
      quantity: 50,
      unit: 'MT',
      price: 45000,
      totalValue: 22500000,
      status: 'partial',
      executedQuantity: 30,
      remainingQuantity: 20,
      orderDate: '2024-01-14',
      exchange: 'MCX',
      category: 'Metals',
    },
    {
      id: 'ORD-003',
      commodity: 'Cotton',
      symbol: 'COTTON-2024',
      type: 'buy',
      orderType: 'limit',
      quantity: 200,
      unit: 'Bales',
      price: 62000,
      totalValue: 124000000,
      status: 'pending',
      executedQuantity: 0,
      remainingQuantity: 200,
      orderDate: '2024-01-16',
      exchange: 'NCDEX',
      category: 'Cash Crops',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executed':
        return <span>✅</span>;
      case 'pending':
        return <span>🕐</span>;
      case 'partial':
        return <AlertCircle size={12} />;
      case 'cancelled':
        return <span>❌</span>;
      default:
        return <span>🕐</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const orderStats = {
    total: orders.length,
    executed: orders.filter(o => o.status === 'executed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    partial: orders.filter(o => o.status === 'partial').length,
    totalValue: orders.reduce((sum, o) => sum + o.totalValue, 0),
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Order Management</h1>
          <p className='text-slate-600'>Track and manage your commodity trading orders</p>
        </div>

        {/* Order Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Total Orders</p>
                <p className='text-2xl font-bold text-slate-900'>{orderStats.total}</p>
              </div>
              <span>📦</span>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Executed</p>
                <p className='text-2xl font-bold text-green-600'>{orderStats.executed}</p>
              </div>
              <span>✅</span>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Pending</p>
                <p className='text-2xl font-bold text-yellow-600'>{orderStats.pending}</p>
              </div>
              <span>🕐</span>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Partial</p>
                <p className='text-2xl font-bold text-blue-600'>{orderStats.partial}</p>
              </div>
              <AlertCircle className='text-blue-600' size={24} />
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-slate-600'>Total Value</p>
                <p className='text-2xl font-bold text-slate-900'>
                  ₹{(orderStats.totalValue / 10000000).toFixed(1)}Cr
                </p>
              </div>
              <span>$</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white rounded-xl shadow-sm border p-6 mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
            <div className='flex items-center space-x-4'>
              <h2 className='text-2xl font-bold text-slate-900'>Trading Orders</h2>

              <div className='relative'>
                <span>🔍</span>
                <input
                  type='text'
                  placeholder='Search orders...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64'
                />
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>All Status</option>
                <option value='executed'>Executed</option>
                <option value='pending'>Pending</option>
                <option value='partial'>Partial</option>
                <option value='cancelled'>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className='bg-white rounded-xl shadow-sm border overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-slate-50 border-b'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Order Details
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Type & Status
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Quantity
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Total Value
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-slate-200'>
                {filteredOrders.map(order => (
                  <tr key={order.id} className='hover:bg-slate-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='text-sm font-medium text-slate-900'>{order.commodity}</div>
                        <div className='text-xs text-slate-500'>
                          {order.id} • {order.symbol} • {order.exchange}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center space-x-2'>
                        <div className='flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {order.type === 'buy' ? (
                            <span>📈</span>
                          ) : (
                            <span>📉</span>
                          )}
                          <span className='ml-1 capitalize'>{order.type}</span>
                        </div>
                        <div
                          className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className='ml-1 capitalize'>{order.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-slate-900'>
                        {order.executedQuantity > 0 && order.status !== 'executed' ? (
                          <div>
                            <div className='font-medium'>
                              {order.executedQuantity}/{order.quantity} {order.unit}
                            </div>
                            <div className='text-xs text-slate-500'>
                              {order.remainingQuantity} remaining
                            </div>
                          </div>
                        ) : (
                          <div className='font-medium'>
                            {order.quantity} {order.unit}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-slate-900'>
                        ₹{order.price.toLocaleString()}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-semibold text-slate-900'>
                        ₹{(order.totalValue / 100000).toFixed(1)}L
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex space-x-2'>
                        {order.status === 'pending' || order.status === 'partial' ? (
                          <>
                            <button className='px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors font-medium'>
                              Modify
                            </button>
                            <button className='px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors font-medium'>
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button className='px-3 py-1 bg-slate-600 text-white rounded-md text-xs hover:bg-slate-700 transition-colors font-medium'>
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demo Notice */}
        <div className='mt-8 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6'>
          <div className='flex items-start'>
            <span>📅</span>
            <div>
              <h3 className='text-lg font-semibold text-green-900 mb-2'>
                🎯 Order Management System - Demo Environment
              </h3>
              <p className='text-green-800 leading-relaxed'>
                This order management interface demonstrates Bell24H's comprehensive trading
                platform capabilities including order tracking, execution monitoring, and portfolio
                management for ₹8+ crore annual trading volume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;
