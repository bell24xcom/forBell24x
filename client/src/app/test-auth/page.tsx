'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const runTests = async () => {
    const tests = [
      {
        name: 'Send Phone OTP',
        endpoint: '/api/auth/send-phone-otp',
        method: 'POST',
        body: { phone: '9876543210' }
      },
      {
        name: 'Send Email OTP',
        endpoint: '/api/auth/send-email-otp',
        method: 'POST',
        body: { email: 'test@example.com', phone: '9876543210' }
      }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const response = await fetch(test.endpoint, {
          method: test.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.body)
        });
        
        const data = await response.json();
        
        results.push({
          name: test.name,
          status: response.ok ? 'PASS' : 'FAIL',
          response: data,
          error: response.ok ? null : data.error
        });
      } catch (error) {
        results.push({
          name: test.name,
          status: 'ERROR',
          response: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Phone + Email Authentication Test
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={runTests}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Run Tests
            </button>
            
            <Link
              href="/auth/phone-email"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Test Authentication Flow
            </Link>
          </div>
          
          {testResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      result.status === 'PASS' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{result.name}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.status === 'PASS' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    {result.error && (
                      <p className="text-red-600 text-sm mt-2">{result.error}</p>
                    )}
                    {result.response && (
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
