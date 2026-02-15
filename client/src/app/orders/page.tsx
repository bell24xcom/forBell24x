'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
            <div className='h-96 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  const orders = [
    {
      id: 'ORD-2024-001',
      customer: 'ABC Manufacturing Ltd.',
      product: 'Industrial Pumps - High Pressure',
      amount: '₹45,000',
      status: 'Processing',
      date: '2024-01-15',
      expectedDelivery: '2024-02-15',
      supplier: 'TechPump Solutions',
    },
    {
      id: 'ORD-2024-002',
      customer: 'XYZ Industries',
      product: 'Electronic Components - PCB Assembly',
      amount: '₹32,500',
      status: 'Shipped',
      date: '2024-01-14',
      expectedDelivery: '2024-02-10',
      supplier: 'ElectroTech Components',
    },
    {
      id: 'ORD-2024-003',
      customer: 'DEF Solutions',
      product: 'Safety Equipment - PPE Kits',
      amount: '₹28,750',
      status: 'Delivered',
      date: '2024-01-13',
      expectedDelivery: '2024-02-05',
      supplier: 'SafetyFirst Equipment',
    },
    {
      id: 'ORD-2024-004',
      customer: 'GHI Corporation',
      product: 'Raw Materials - Steel Sheets',
      amount: '₹67,200',
      status: 'Processing',
      date: '2024-01-12',
      expectedDelivery: '2024-02-20',
      supplier: 'MetalCorp Industries',
    },
    {
      id: 'ORD-2024-005',
      customer: 'JKL Enterprises',
      product: 'Packaging Materials',
      amount: '₹15,800',
      status: 'Shipped',
      date: '2024-01-11',
      expectedDelivery: '2024-02-08',
      supplier: 'PackPro Solutions',
    },
  ];

  const stats = [
    {
      title: 'Total Orders',
      value: '156',
      change: '+12%',
      icon: Package,
      color: 'text-blue-600',
    },
    {
      title: 'Processing',
      value: '23',
      change: '+5%',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Shipped',
      value: '89',
      change: '+8%',
      icon: Truck,
      color: 'text-purple-600',
    },
    {
      title: 'Delivered',
      value: '44',
      change: '+15%',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-orange-100 text-orange-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto p-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>BELL24H Order Management</h1>
            <p className='text-gray-600 mt-2'>Track and manage all your orders in one place</p>
          </div>
          <div className='flex items-center space-x-4'>
            <Button variant='outline'>
              <span>⬇️</span>
              Export
            </Button>
            <Button>
              <span>📦</span>
              New Order
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-xs text-green-600 mt-1'>{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <span>🔍</span>
                  <Input
                    placeholder='Search orders by ID, customer, or product...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-4'>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='all'>All Status</option>
                  <option value='Processing'>Processing</option>
                  <option value='Shipped'>Shipped</option>
                  <option value='Delivered'>Delivered</option>
                  <option value='Cancelled'>Cancelled</option>
                </select>
                <Button variant='outline'>
                  <span>🔽</span>
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              All your orders with detailed status and tracking information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium'>Order ID</th>
                    <th className='text-left py-3 px-4 font-medium'>Customer</th>
                    <th className='text-left py-3 px-4 font-medium'>Product</th>
                    <th className='text-left py-3 px-4 font-medium'>Amount</th>
                    <th className='text-left py-3 px-4 font-medium'>Status</th>
                    <th className='text-left py-3 px-4 font-medium'>Date</th>
                    <th className='text-left py-3 px-4 font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className='border-b hover:bg-gray-50'>
                      <td className='py-4 px-4 font-medium'>{order.id}</td>
                      <td className='py-4 px-4'>{order.customer}</td>
                      <td className='py-4 px-4'>{order.product}</td>
                      <td className='py-4 px-4 font-medium'>{order.amount}</td>
                      <td className='py-4 px-4'>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </td>
                      <td className='py-4 px-4 text-sm text-gray-600'>{order.date}</td>
                      <td className='py-4 px-4'>
                        <div className='flex space-x-2'>
                          <Button variant='outline' size='sm'>
                            <span>👁️</span>
                          </Button>
                          <Button variant='outline' size='sm'>
                            <span>🚚</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Order Analytics */}
        <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Order Trends</CardTitle>
              <CardDescription>Monthly order volume and revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
                <div className='text-center'>
                  <span>📈</span>
                  <p className='text-gray-600'>Order analytics chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
              <CardDescription>Most active suppliers by order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-medium'>TechPump Solutions</p>
                    <p className='text-sm text-gray-600'>Industrial Equipment</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>23 orders</p>
                    <p className='text-sm text-green-600'>+12%</p>
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-medium'>ElectroTech Components</p>
                    <p className='text-sm text-gray-600'>Electronics</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>18 orders</p>
                    <p className='text-sm text-green-600'>+8%</p>
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-medium'>SafetyFirst Equipment</p>
                    <p className='text-sm text-gray-600'>Safety Equipment</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>15 orders</p>
                    <p className='text-sm text-green-600'>+15%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
