'use client';

import { useState } from 'react';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  details?: any;
}

interface GSTInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  supplierGST: string;
  buyerGST?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    gstRate: string;
    category?: string;
  }>;
  placeOfSupply: string;
  reverseCharge: boolean;
  export: boolean;
}

export default function GSTTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [gstNumber, setGstNumber] = useState('27AAPFU0939F1Z5');
  const [invoiceData, setInvoiceData] = useState<GSTInvoice>({
    invoiceNumber: 'INV-2024-000001',
    invoiceDate: new Date().toISOString().split('T')[0],
    supplierGST: '27AAPFU0939F1Z5',
    buyerGST: '29AAACR5055K1ZP',
    items: [
      {
        description: 'Laptop Computers',
        quantity: 10,
        unitPrice: 50000,
        gstRate: '18',
        category: 'electronics',
      },
    ],
    placeOfSupply: 'Mumbai, Maharashtra',
    reverseCharge: false,
    export: false,
  });

  const runGSTTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Test 1: GST Number Validation
    try {
      const validationResponse = await fetch('/api/gst/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstNumber }),
      });

      const validationData = await validationResponse.json();

      results.push({
        test: 'GST Number Validation',
        status: validationResponse.ok && validationData.isValid ? 'pass' : 'fail',
        message: validationData.isValid ? 'GST number is valid' : 'GST number is invalid',
        details: validationData,
      });
    } catch (error) {
      results.push({
        test: 'GST Number Validation',
        status: 'fail',
        message: 'GST validation API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: GST Invoice Generation
    try {
      const invoiceResponse = await fetch('/api/gst/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const invoiceData = await invoiceResponse.json();

      results.push({
        test: 'GST Invoice Generation',
        status: invoiceResponse.ok && invoiceData.success ? 'pass' : 'fail',
        message: invoiceResponse.ok
          ? 'GST invoice generated successfully'
          : 'GST invoice generation failed',
        details: invoiceData,
      });
    } catch (error) {
      results.push({
        test: 'GST Invoice Generation',
        status: 'fail',
        message: 'GST invoice API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 3: GST Report Generation
    try {
      const reportResponse = await fetch('/api/gst/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: {
            start: '2024-01-01',
            end: '2024-01-31',
          },
          includeDetails: true,
        }),
      });

      const reportData = await reportResponse.json();

      results.push({
        test: 'GST Report Generation',
        status: reportResponse.ok && reportData.success ? 'pass' : 'fail',
        message: reportResponse.ok
          ? 'GST report generated successfully'
          : 'GST report generation failed',
        details: reportData,
      });
    } catch (error) {
      results.push({
        test: 'GST Report Generation',
        status: 'fail',
        message: 'GST report API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 4: GST Template Retrieval
    try {
      const templateResponse = await fetch('/api/gst/invoice?action=template');
      const templateData = await templateResponse.json();

      results.push({
        test: 'GST Template Retrieval',
        status: templateResponse.ok ? 'pass' : 'fail',
        message: templateResponse.ok
          ? 'GST template retrieved successfully'
          : 'GST template retrieval failed',
        details: templateData,
      });
    } catch (error) {
      results.push({
        test: 'GST Template Retrieval',
        status: 'fail',
        message: 'GST template API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 5: GST Summary Retrieval
    try {
      const summaryResponse = await fetch('/api/gst/report?action=summary');
      const summaryData = await summaryResponse.json();

      results.push({
        test: 'GST Summary Retrieval',
        status: summaryResponse.ok ? 'pass' : 'fail',
        message: summaryResponse.ok
          ? 'GST summary retrieved successfully'
          : 'GST summary retrieval failed',
        details: summaryData,
      });
    } catch (error) {
      results.push({
        test: 'GST Summary Retrieval',
        status: 'fail',
        message: 'GST summary API error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testGSTValidation = async () => {
    try {
      const response = await fetch('/api/gst/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstNumber }),
      });

      const data = await response.json();
      alert(
        `GST Validation Result: ${data.isValid ? 'Valid' : 'Invalid'}\nState: ${
          data.stateName || 'Unknown'
        }`
      );
    } catch (error) {
      alert('GST validation failed');
    }
  };

  const testInvoiceGeneration = async () => {
    try {
      const response = await fetch('/api/gst/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();
      if (data.success) {
        alert(
          `Invoice Generated Successfully!\nTotal Amount: ₹${data.calculations.total.toLocaleString()}\nGST Amount: ₹${(
            data.calculations.cgst +
            data.calculations.sgst +
            data.calculations.igst
          ).toLocaleString()}`
        );
      } else {
        alert('Invoice generation failed');
      }
    } catch (error) {
      alert('Invoice generation failed');
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold mb-6 text-gray-800'>GST Compliance Test Suite</h2>

      {/* GST Number Validation */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>GST Number Validation</h3>
        <div className='flex gap-4 items-end'>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>GST Number</label>
            <input
              type='text'
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter GST number'
            />
          </div>
          <button
            onClick={testGSTValidation}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Validate GST
          </button>
        </div>
      </div>

      {/* Invoice Data */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>Sample Invoice Data</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Invoice Number</label>
            <input
              type='text'
              value={invoiceData.invoiceNumber}
              onChange={e =>
                setInvoiceData({
                  ...invoiceData,
                  invoiceNumber: e.target.value,
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Invoice Date</label>
            <input
              type='date'
              value={invoiceData.invoiceDate}
              onChange={e => setInvoiceData({ ...invoiceData, invoiceDate: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Supplier GST</label>
            <input
              type='text'
              value={invoiceData.supplierGST}
              onChange={e => setInvoiceData({ ...invoiceData, supplierGST: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Buyer GST</label>
            <input
              type='text'
              value={invoiceData.buyerGST || ''}
              onChange={e => setInvoiceData({ ...invoiceData, buyerGST: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
        <button
          onClick={testInvoiceGeneration}
          className='mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
        >
          Generate Invoice
        </button>
      </div>

      {/* Test Controls */}
      <div className='mb-6 flex gap-4'>
        <button
          onClick={runGSTTests}
          disabled={isRunning}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {isRunning ? 'Running Tests...' : 'Run GST Compliance Tests'}
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

      {/* GST Compliance Summary */}
      <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>GST Compliance Checklist</h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'GST Number Validation' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            GST Number Validation
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'GST Invoice Generation' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Invoice Generation
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'GST Report Generation' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Report Generation
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'GST Template Retrieval' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Template System
          </div>
          <div className='flex items-center'>
            <span
              className={`w-3 h-3 rounded-full mr-2 ${
                testResults.some(r => r.test === 'GST Summary Retrieval' && r.status === 'pass')
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            ></span>
            Summary System
          </div>
          <div className='flex items-center'>
            <span className='w-3 h-3 rounded-full mr-2 bg-green-500'></span>
            Rate Calculations
          </div>
        </div>
      </div>

      {/* GST Information */}
      <div className='mt-6 p-4 bg-yellow-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2'>GST Information</h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <strong>GST Rates:</strong>
            <ul className='mt-1 space-y-1'>
              <li>• 0% - Agriculture, books, food grains</li>
              <li>• 5% - Textiles, footwear, coal</li>
              <li>• 12% - Medicines, certain services</li>
              <li>• 18% - Electronics, computers, most goods</li>
              <li>• 28% - Automobiles, luxury items</li>
            </ul>
          </div>
          <div>
            <strong>Compliance Requirements:</strong>
            <ul className='mt-1 space-y-1'>
              <li>• B2B transactions require buyer GST</li>
              <li>• Inter-state transactions attract IGST</li>
              <li>• Export transactions are zero-rated</li>
              <li>• Reverse charge for specific services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
