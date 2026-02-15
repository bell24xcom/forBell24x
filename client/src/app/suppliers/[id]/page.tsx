'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function SupplierProfilePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Simplified supplier data for better performance - remove heavy data
  const supplier = useMemo(
    () => ({
      id: params.id,
      name: 'TechSupply Pro',
      category: 'Electronics',
      location: 'Mumbai, Maharashtra',
      rating: 4.8,
      reviews: 234,
      orders: 2340,
      responseTime: '<2hrs',
      aiMatchScore: 98.7,
      verified: true,
      ecgcApproved: true,
      description: 'Leading electronics component supplier with 15+ years experience',
      specialties: ['PCB Manufacturing', 'Component Sourcing', 'Assembly Services'],
      certifications: ['ISO 9001', 'ECGC Approved', 'BELL24H Verified'],
      employees: '500-1000',
      revenue: '₹50-100Cr',
      establishedYear: 2008,
      logo: '🏭',
      website: 'https://techsupplypro.com',
      email: 'sales@techsupplypro.com',
      phone: '+91-98765-43210',
      successRate: '98.5%',
    }),
    [params.id]
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* NAVIGATION */}
      <nav className='bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/marketplace'
                className='flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>←</span>
                <span className='text-sm font-medium'>Back to Marketplace</span>
              </Link>
              <div className='border-l border-gray-300 pl-4'>
                <Link
                  href='/'
                  className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                >
                  BELL24H
                </Link>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 bg-gray-100 rounded-lg p-1'>
                <Link
                  href='/marketplace?mode=buying'
                  className='px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
                >
                  <span>🛒</span>
                  Buying
                </Link>
                <Link
                  href='/marketplace?mode=selling'
                  className='px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
                >
                  <span>📦</span>
                  Selling
                </Link>
              </div>
              <Link
                href='/auth/register?type=business'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700'
              >
                Join as Business
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* SIMPLIFIED SUPPLIER HEADER */}
      <section className='bg-gradient-to-br from-blue-50 to-purple-50 py-12'>
        <div className='container mx-auto px-4'>
          <div className='flex items-start space-x-8'>
            <div className='text-6xl'>{supplier.logo}</div>

            <div className='flex-1'>
              <div className='flex items-center space-x-4 mb-4'>
                <h1 className='text-3xl font-bold text-gray-900'>{supplier.name}</h1>
                {supplier.verified && <span>✅</span>}
                {supplier.ecgcApproved && <span>🛡️</span>}
              </div>

              <p className='text-lg text-gray-700 mb-4'>{supplier.description}</p>

              <div className='flex items-center space-x-6'>
                <div className='flex items-center space-x-2'>
                  <span>⭐</span>
                  <span className='font-bold'>{supplier.rating}/5</span>
                  <span className='text-gray-600'>({supplier.reviews} reviews)</span>
                </div>
                <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold'>
                  {supplier.aiMatchScore}% Match
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <button className='w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors'>
                Connect & Trade
              </button>
              <button className='w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors'>
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INFO TABS */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Contact Information</h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <span>📞</span>
                  <span>{supplier.phone}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>📧</span>
                  <span>{supplier.email}</span>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>📍</span>
                  <span>{supplier.location}</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Specialties</h3>
              <div className='space-y-2'>
                {supplier.specialties.map((specialty, index) => (
                  <div
                    key={index}
                    className='bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium'
                  >
                    {specialty}
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-4'>Performance</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Success Rate</span>
                  <span className='font-bold text-green-600'>{supplier.successRate}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Response Time</span>
                  <span className='font-bold text-blue-600'>{supplier.responseTime}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Total Orders</span>
                  <span className='font-bold text-purple-600'>
                    {supplier.orders.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
