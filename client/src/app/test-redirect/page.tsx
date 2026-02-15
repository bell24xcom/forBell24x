'use client';

import { useEffect, useState } from 'react';

export default function TestRedirectPage() {
  const [status, setStatus] = useState('testing');

  useEffect(() => {
    // Test redirect functionality
    const testRedirect = () => {
      console.log('🧪 Testing redirect functionality...');
      
      // Test 1: Check if we can access localStorage
      try {
        const token = localStorage.getItem('auth-token');
        const userData = localStorage.getItem('user-data');
        console.log('✅ localStorage access:', { token: !!token, userData: !!userData });
      } catch (error) {
        console.error('❌ localStorage access failed:', error);
      }

      // Test 2: Test window.location.href
      setTimeout(() => {
        console.log('🔄 Testing window.location.href redirect...');
        try {
          // Test redirect to dashboard
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('❌ Redirect failed:', error);
          setStatus('redirect-failed');
        }
      }, 2000);
    };

    testRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Redirect Test</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          Testing redirect functionality... You should be redirected to dashboard in 2 seconds.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Check browser console for detailed logs.
        </p>
      </div>
    </div>
  );
} 
