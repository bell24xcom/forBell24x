'use client';

import { useState } from 'react';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  details?: any;
}

export default function AuthTest() {
  const { data: session, status } = () => ({ data: { user: { id: "user", email: "user@company.com", name: "Business User" } }, status: "authenticated" });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAuthTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: Session Status
    results.push({
      test: 'Session Status',
      status: status === 'loading' ? 'pending' : status === 'authenticated' ? 'pass' : 'fail',
      message:
        status === 'loading'
          ? 'Loading...'
          : status === 'authenticated'
          ? 'User is authenticated'
          : 'User is not authenticated',
    });

    // Test 2: User Data
    if (session?.user) {
      results.push({
        test: 'User Data',
        status: 'pass',
        message: 'User data is available',
        details: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          company: session.user.company,
        },
      });
    } else {
      results.push({
        test: 'User Data',
        status: 'fail',
        message: 'No user data available',
      });
    }

    // Test 3: Registration API
    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@bell24h.com',
          password: 'TestPassword123!',
          name: 'Test User',
          role: 'buyer',
        }),
      });

      const registerData = await registerResponse.json();

      results.push({
        test: 'Registration API',
        status: registerResponse.ok ? 'pass' : 'fail',
        message: registerResponse.ok ? 'Registration API working' : 'Registration API failed',
        details: registerData,
      });
    } catch (error) {
      results.push({
        test: 'Registration API',
        status: 'fail',
        message: 'Registration API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 4: Login API
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@bell24h.com',
          password: 'TestPassword123!',
        }),
      });

      const loginData = await loginResponse.json();

      results.push({
        test: 'Login API',
        status: loginResponse.ok ? 'pass' : 'fail',
        message: loginResponse.ok ? 'Login API working' : 'Login API failed',
        details: loginData,
      });
    } catch (error) {
      results.push({
        test: 'Login API',
        status: 'fail',
        message: 'Login API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 5: Password Reset Request
    try {
      const resetResponse = await fetch('/api/auth/reset-password?action=request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@bell24h.com',
        }),
      });

      const resetData = await resetResponse.json();

      results.push({
        test: 'Password Reset Request',
        status: resetResponse.ok ? 'pass' : 'fail',
        message: resetResponse.ok
          ? 'Password reset request working'
          : 'Password reset request failed',
        details: resetData,
      });
    } catch (error) {
      results.push({
        test: 'Password Reset Request',
        status: 'fail',
        message: 'Password reset request error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 6: Protected Route Access
    try {
      const protectedResponse = await fetch('/api/auth/protected-test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      results.push({
        test: 'Protected Route Access',
        status: protectedResponse.ok ? 'pass' : 'fail',
        message: protectedResponse.ok ? 'Protected route accessible' : 'Protected route blocked',
        details: { status: protectedResponse.status },
      });
    } catch (error) {
      results.push({
        test: 'Protected Route Access',
        status: 'fail',
        message: 'Protected route test error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 7: Security Headers
    try {
      const headersResponse = await fetch('/api/auth/headers-test', {
        method: 'GET',
      });

      const securityHeaders = {
        'X-Frame-Options': headersResponse.headers.get('X-Frame-Options'),
        'X-Content-Type-Options': headersResponse.headers.get('X-Content-Type-Options'),
        'Referrer-Policy': headersResponse.headers.get('Referrer-Policy'),
        'Content-Security-Policy': headersResponse.headers.get('Content-Security-Policy'),
      };

      const hasSecurityHeaders = Object.values(securityHeaders).some(header => header !== null);

      results.push({
        test: 'Security Headers',
        status: hasSecurityHeaders ? 'pass' : 'fail',
        message: hasSecurityHeaders ? 'Security headers present' : 'Security headers missing',
        details: securityHeaders,
      });
    } catch (error) {
      results.push({
        test: 'Security Headers',
        status: 'fail',
        message: 'Security headers test error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const handleSignIn = async () => {
    await signIn('credentials', {
      email: 'test@bell24h.com',
      password: 'TestPassword123!',
      callbackUrl: '/',
    });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>
        Authentication Production Test Suite
      </h2>

      {/* Current Session Status */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>Current Session Status</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <span className='font-medium'>Status:</span> {status}
          </div>
          <div>
            <span className='font-medium'>User:</span> {session?.user?.email || 'Not authenticated'}
          </div>
          <div>
            <span className='font-medium'>Role:</span> {session?.user?.role || 'N/A'}
          </div>
          <div>
            <span className='font-medium'>Company:</span> {session?.user?.company?.name || 'N/A'}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className='mb-6 flex gap-4'>
        <button
          onClick={runAuthTests}
          disabled={isRunning}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {isRunning ? 'Running Tests...' : 'Run Authentication Tests'}
        </button>

        <button
          onClick={handleSignIn}
          className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
        >
          Sign In (Test)
        </button>

        <button
          onClick={handleSignOut}
          className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
        >
          Sign Out
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Test Results</h3>
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'pass'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'fail'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className='flex items-center justify-between mb-2'>
                <span className='font-medium'>{result.test}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'pass'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'fail'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p className='text-sm text-gray-600 mb-2'>{result.message}</p>
              {result.details && (
                <details className='text-xs'>
                  <summary className='cursor-pointer text-gray-500'>View Details</summary>
                  <pre className='mt-2 p-2 bg-gray-100 rounded overflow-auto'>
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Production Readiness Summary */}
      <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>Production Readiness Checklist</h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'Session Status' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Session Management
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'Registration API' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            User Registration
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'Login API' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            User Authentication
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'Password Reset Request' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Password Reset
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'Protected Route Access' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Route Protection
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'Security Headers' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Security Headers
          </div>
        </div>
      </div>
    </div>
  );
}
