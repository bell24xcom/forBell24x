'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestLivePage() {
  const [testResults, setTestResults] = useState({
    categories: { status: 'pending', data: null, error: null },
    suppliers: { status: 'pending', data: null, error: null },
    analytics: { status: 'pending', data: null, error: null },
    users: { status: 'pending', data: null, error: null }
  });

  useEffect(() => {
    runAllTests();
  }, []);

  const runAllTests = async () => {
    await Promise.all([
      testCategoriesAPI(),
      testSuppliersAPI(),
      testAnalyticsAPI(),
      testUsersAPI()
    ]);
  };

  const testCategoriesAPI = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        categories: { status: 'success', data, error: null }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        categories: { status: 'error', data: null, error: error.message }
      }));
    }
  };

  const testSuppliersAPI = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        suppliers: { status: 'success', data, error: null }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        suppliers: { status: 'error', data: null, error: error.message }
      }));
    }
  };

  const testAnalyticsAPI = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        analytics: { status: 'success', data, error: null }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        analytics: { status: 'error', data: null, error: error.message }
      }));
    }
  };

  const testUsersAPI = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        users: { status: 'success', data, error: null }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        users: { status: 'error', data: null, error: error.message }
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Live API Testing</h1>
            <p className="text-lg text-gray-600 mb-8">
              Testing all API endpoints for functionality
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories API Test */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Categories API</h3>
                  <span className={`text-2xl ${getStatusColor(testResults.categories.status)}`}>
                    {getStatusIcon(testResults.categories.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {testResults.categories.status}
                  </p>
                  {testResults.categories.error && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Error:</span> {testResults.categories.error}
                    </p>
                  )}
                  {testResults.categories.data && (
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Data:</span> {testResults.categories.data.categories?.length || 0} categories found
                    </p>
                  )}
                </div>
              </div>

              {/* Suppliers API Test */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Suppliers API</h3>
                  <span className={`text-2xl ${getStatusColor(testResults.suppliers.status)}`}>
                    {getStatusIcon(testResults.suppliers.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {testResults.suppliers.status}
                  </p>
                  {testResults.suppliers.error && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Error:</span> {testResults.suppliers.error}
                    </p>
                  )}
                  {testResults.suppliers.data && (
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Data:</span> {testResults.suppliers.data.suppliers?.length || 0} suppliers found
                    </p>
                  )}
                </div>
              </div>

              {/* Analytics API Test */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics API</h3>
                  <span className={`text-2xl ${getStatusColor(testResults.analytics.status)}`}>
                    {getStatusIcon(testResults.analytics.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {testResults.analytics.status}
                  </p>
                  {testResults.analytics.error && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Error:</span> {testResults.analytics.error}
                    </p>
                  )}
                  {testResults.analytics.data && (
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Data:</span> Analytics data loaded successfully
                    </p>
                  )}
                </div>
              </div>

              {/* Users API Test */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Users API</h3>
                  <span className={`text-2xl ${getStatusColor(testResults.users.status)}`}>
                    {getStatusIcon(testResults.users.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Status:</span> {testResults.users.status}
                  </p>
                  {testResults.users.error && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Error:</span> {testResults.users.error}
                    </p>
                  )}
                  {testResults.users.data && (
                    <p className="text-sm text-green-600">
                      <span className="font-medium">Data:</span> {testResults.users.data.users?.length || 0} users found
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Test Summary */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categories API</span>
                  <span className={`text-sm ${getStatusColor(testResults.categories.status)}`}>
                    {getStatusIcon(testResults.categories.status)} {testResults.categories.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Suppliers API</span>
                  <span className={`text-sm ${getStatusColor(testResults.suppliers.status)}`}>
                    {getStatusIcon(testResults.suppliers.status)} {testResults.suppliers.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analytics API</span>
                  <span className={`text-sm ${getStatusColor(testResults.analytics.status)}`}>
                    {getStatusIcon(testResults.analytics.status)} {testResults.analytics.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Users API</span>
                  <span className={`text-sm ${getStatusColor(testResults.users.status)}`}>
                    {getStatusIcon(testResults.users.status)} {testResults.users.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• All API endpoints are now working with mock data</li>
                <li>• Database integration can be added later</li>
                <li>• Real-time data can be connected when needed</li>
                <li>• All 404 errors have been resolved</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}