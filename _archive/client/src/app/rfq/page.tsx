'use client';

<<<<<<< HEAD
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { useEffect, useState } from 'react';

export default function RFQPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [rfqData, setRfqData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    deadline: '',
    attachments: [],
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/3 mb-6'></div>
            <div className='h-96 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    'Industrial Machinery',
    'Electronics & Components',
    'Raw Materials',
    'Packaging & Supplies',
    'Tools & Equipment',
    'Safety Equipment',
    'Automotive Parts',
    'Textiles & Fabrics',
  ];

  const recentRFQs = [
    {
      id: 'RFQ-2024-001',
      title: 'Industrial Pumps - High Pressure',
      category: 'Industrial Machinery',
      status: 'Active',
      responses: 12,
      deadline: '2024-02-15',
      budget: '₹2,50,000',
    },
    {
      id: 'RFQ-2024-002',
      title: 'Electronic Components - PCB Assembly',
      category: 'Electronics & Components',
      status: 'Closed',
      responses: 8,
      deadline: '2024-01-30',
      budget: '₹1,80,000',
    },
    {
      id: 'RFQ-2024-003',
      title: 'Safety Equipment - PPE Kits',
      category: 'Safety Equipment',
      status: 'Active',
      responses: 15,
      deadline: '2024-02-20',
      budget: '₹95,000',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle RFQ submission
    console.log('RFQ submitted:', rfqData);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <PageHeader
        title="BELL24H Request for Quotation"
        subtitle="Create and manage your RFQs to get competitive quotes from verified suppliers"
        showBackButton={true}
        showHomeButton={true}
        showDashboardButton={true}
      />

      <div className='max-w-7xl mx-auto p-6'>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Create RFQ Form */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <span>📄</span>
                  Create New RFQ
                </CardTitle>
                <CardDescription>
                  Fill in the details below to create a new request for quotation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='title'>RFQ Title *</Label>
                      <Input
                        id='title'
                        placeholder='Enter RFQ title'
                        value={rfqData.title}
                        onChange={e => setRfqData({ ...rfqData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor='category'>Category *</Label>
                      <select
                        id='category'
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={rfqData.category}
                        onChange={e => setRfqData({ ...rfqData, category: e.target.value })}
                        required
                      >
                        <option value=''>Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='description'>Detailed Description *</Label>
                    <Textarea
                      id='description'
                      placeholder='Provide detailed specifications, requirements, and any special considerations...'
                      rows={6}
                      value={rfqData.description}
                      onChange={e => setRfqData({ ...rfqData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <Label htmlFor='quantity'>Quantity Required</Label>
                      <Input
                        id='quantity'
                        placeholder='e.g., 100 units'
                        value={rfqData.quantity}
                        onChange={e => setRfqData({ ...rfqData, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor='budget'>Budget Range</Label>
                      <Input
                        id='budget'
                        placeholder='e.g., ₹50,000 - ₹1,00,000'
                        value={rfqData.budget}
                        onChange={e => setRfqData({ ...rfqData, budget: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor='deadline'>Submission Deadline</Label>
                      <Input
                        id='deadline'
                        type='date'
                        value={rfqData.deadline}
                        onChange={e => setRfqData({ ...rfqData, deadline: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Attachments</Label>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                      <span>⬆️</span>
                      <p className='text-sm text-gray-600 mb-2'>
                        Drag and drop files here, or click to browse
                      </p>
                      <Button type='button' variant='outline' size='sm'>
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div className='flex justify-end space-x-4'>
                    <Button type='button' variant='outline'>
                      Save Draft
                    </Button>
                    <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                      <Send className='h-4 w-4 mr-2' />
                      Submit RFQ
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent RFQs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent RFQs</CardTitle>
                <CardDescription>Your recent requests for quotation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentRFQs.map(rfq => (
                    <div key={rfq.id} className='p-4 border rounded-lg'>
                      <div className='flex justify-between items-start mb-2'>
                        <h4 className='font-medium text-sm'>{rfq.title}</h4>
                        <Badge variant={rfq.status === 'Active' ? 'default' : 'secondary'}>
                          {rfq.status}
                        </Badge>
                      </div>
                      <p className='text-xs text-gray-600 mb-2'>{rfq.category}</p>
                      <div className='flex justify-between text-xs text-gray-500'>
                        <span>{rfq.responses} responses</span>
                        <span>₹{rfq.budget}</span>
                      </div>
                      <div className='flex items-center text-xs text-gray-500 mt-2'>
                        <span>🕐</span>
                        Deadline: {rfq.deadline}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className='mt-6'>
              <CardHeader>
                <CardTitle>RFQ Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Active RFQs</span>
                    <span className='font-medium'>8</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Total Responses</span>
                    <span className='font-medium'>156</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Avg. Response Time</span>
                    <span className='font-medium'>2.3 days</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm'>Success Rate</span>
                    <span className='font-medium text-green-600'>94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI-Powered Features */}
        <div className='mt-8'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <span>🔍</span>
                AI-Powered RFQ Optimization
              </CardTitle>
              <CardDescription>
                Intelligent suggestions to improve your RFQ and get better responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>Smart Category Matching</h4>
                  <p className='text-sm text-blue-700'>
                    Our AI suggests the most relevant categories and suppliers based on your
                    requirements.
                  </p>
                </div>
                <div className='p-4 bg-green-50 rounded-lg'>
                  <h4 className='font-medium text-green-900 mb-2'>Pricing Insights</h4>
                  <p className='text-sm text-green-700'>
                    Get market price estimates and budget recommendations for your specific
                    requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
=======
import React from 'react';
import Link from 'next/link';
import { FileText, Plus, Search } from 'lucide-react';

export default function RFQListPage() {
  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">All RFQs</h1>
            <p className="text-gray-400">
              Browse active requests for quotation across all buyers
            </p>
          </div>
          <Link
            href="/rfq/create"
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create RFQ
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFQs by product, category, or location..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500"
              />
            </div>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Filters
            </button>
          </div>
        </div>

        {/* RFQ List Placeholder */}
        <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold mb-2 text-gray-300">No RFQs Found</h2>
          <p className="text-gray-500 mb-6">
            This page will display all active RFQs once data is connected.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/rfq/create"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
            >
              Create Your First RFQ
            </Link>
            <Link
              href="/rfq/demo/all"
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
            >
              View Demo RFQs
            </Link>
          </div>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
