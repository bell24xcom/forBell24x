import React from 'react';

interface SimpleFinancialDashboardProps {
  userId: string;
}

export function SimpleFinancialDashboard({ userId }: SimpleFinancialDashboardProps) {
  return (
    <section className='py-16 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Financial Overview</h2>
          <p className='text-lg text-gray-600'>Track your procurement performance and savings</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Savings</p>
                <p className='text-2xl font-bold text-green-600'>₹12.5L</p>
                <p className='text-sm text-green-600 mt-1'>+15% this month</p>
              </div>
              <div className='p-3 bg-green-100 rounded-lg'>
                <span>📈</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Spend</p>
                <p className='text-2xl font-bold text-blue-600'>₹85.2L</p>
                <p className='text-sm text-blue-600 mt-1'>This quarter</p>
              </div>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <span>$</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Active RFQs</p>
                <p className='text-2xl font-bold text-purple-600'>24</p>
                <p className='text-sm text-purple-600 mt-1'>In progress</p>
              </div>
              <div className='p-3 bg-purple-100 rounded-lg'>
                <span>📄</span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-md border border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Suppliers</p>
                <p className='text-2xl font-bold text-amber-600'>156</p>
                <p className='text-sm text-amber-600 mt-1'>Verified partners</p>
              </div>
              <div className='p-3 bg-amber-100 rounded-lg'>
                <span>👤</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
