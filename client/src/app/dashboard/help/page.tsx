'use client';

import { HelpCircle, BookOpen, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center mb-4'>
          <HelpCircle className='w-8 h-8 mr-3 text-indigo-600' />
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Help & Support</h2>
            <p className='text-gray-600'>Get help, find documentation, and contact support</p>
          </div>
        </div>
        <div className='bg-indigo-50 rounded-lg p-4 inline-block'>
          <div className='text-2xl font-bold text-indigo-600'>Coming Soon</div>
          <div className='text-sm text-indigo-700'>Knowledge base and live support</div>
        </div>
      </div>
      {/* Feature Benefits */}
      <div className='bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>Help & Support Benefits</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex items-start space-x-3'>
            <BookOpen className='w-6 h-6 text-indigo-600 mt-1' />
            <div>
              <h4 className='font-medium text-gray-900'>Documentation</h4>
              <p className='text-sm text-gray-600'>Access guides, FAQs, and tutorials</p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <MessageCircle className='w-6 h-6 text-indigo-600 mt-1' />
            <div>
              <h4 className='font-medium text-gray-900'>Live Chat</h4>
              <p className='text-sm text-gray-600'>Chat with support for instant help</p>
            </div>
          </div>
          <div className='flex items-start space-x-3'>
            <span>📧</span>
            <div>
              <h4 className='font-medium text-gray-900'>Contact Support</h4>
              <p className='text-sm text-gray-600'>Email or raise a support ticket</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
