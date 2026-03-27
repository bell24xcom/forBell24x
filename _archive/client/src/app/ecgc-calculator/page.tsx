'use client';

import { Calculator } from 'lucide-react';
import { useState } from 'react';

export default function ECGCCalculator() {
  const [formData, setFormData] = useState({
    policyType: '',
    coverageAmount: '',
    country: '',
    creditPeriod: '',
    buyerType: '',
    industry: '',
  });

  const [result, setResult] = useState<any>(null);

  const policyTypes = [
    { value: 'shipment', label: 'Shipment Credit Insurance', baseRate: 1.2 },
    { value: 'packing', label: 'Packing Credit Guarantee', baseRate: 0.8 },
    { value: 'buyer', label: 'Buyer Credit Policy', baseRate: 1.5 },
    { value: 'bank', label: 'Bank Guarantee Policy', baseRate: 0.6 },
  ];

  const countries = [
    { value: 'usa', label: 'United States', riskFactor: 1.0 },
    { value: 'germany', label: 'Germany', riskFactor: 1.0 },
    { value: 'uk', label: 'United Kingdom', riskFactor: 1.0 },
    { value: 'uae', label: 'UAE', riskFactor: 1.2 },
    { value: 'singapore', label: 'Singapore', riskFactor: 1.0 },
    { value: 'other', label: 'Other Countries', riskFactor: 1.5 },
  ];

  const calculatePremium = () => {
    if (!formData.policyType || !formData.coverageAmount || !formData.country) {
      return;
    }

    const policyType = policyTypes.find(p => p.value === formData.policyType);
    const country = countries.find(c => c.value === formData.country);
    const amount = parseFloat(formData.coverageAmount);

    if (!policyType || !country || isNaN(amount)) {
      return;
    }

    let baseRate = policyType.baseRate;
    let riskFactor = country.riskFactor;
    let creditPeriodFactor = 1.0;

    // Adjust for credit period
    switch (formData.creditPeriod) {
      case '30':
        creditPeriodFactor = 0.8;
        break;
      case '60':
        creditPeriodFactor = 1.0;
        break;
      case '90':
        creditPeriodFactor = 1.2;
        break;
      case '180':
        creditPeriodFactor = 1.5;
        break;
      case '360':
        creditPeriodFactor = 2.0;
        break;
    }

    const finalRate = baseRate * riskFactor * creditPeriodFactor;
    const premium = (amount * finalRate) / 100;
    const coverage = amount * 0.9; // Assuming 90% coverage

    setResult({
      premiumRate: finalRate.toFixed(2),
      premiumAmount: premium.toFixed(2),
      coverageAmount: coverage.toFixed(2),
      totalCost: premium.toFixed(2),
      savings: (amount * 0.05).toFixed(2), // Estimated risk savings
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-lg'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center'>
              <Calculator className='h-7 w-7 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>ECGC Premium Calculator</h1>
              <p className='text-gray-600'>
                Calculate your export credit insurance premium instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Calculator Form */}
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>Policy Details</h2>

            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Policy Type</label>
                <select
                  value={formData.policyType}
                  onChange={e => setFormData({ ...formData, policyType: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Select Policy Type</option>
                  {policyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Coverage Amount (₹ Crores)
                </label>
                <input
                  type='number'
                  step='0.1'
                  value={formData.coverageAmount}
                  onChange={e => setFormData({ ...formData, coverageAmount: e.target.value })}
                  placeholder='Enter amount in crores'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Buyer Country
                </label>
                <select
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Select Country</option>
                  {countries.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Credit Period (Days)
                </label>
                <select
                  value={formData.creditPeriod}
                  onChange={e => setFormData({ ...formData, creditPeriod: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Select Credit Period</option>
                  <option value='30'>30 days</option>
                  <option value='60'>60 days</option>
                  <option value='90'>90 days</option>
                  <option value='180'>180 days</option>
                  <option value='360'>360 days</option>
                </select>
              </div>

              <button
                onClick={calculatePremium}
                className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2'
              >
                <Calculator className='h-5 w-5' />
                <span>Calculate Premium</span>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-6'>Premium Calculation</h2>

            {result ? (
              <div className='space-y-4'>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-blue-800 font-medium'>Premium Rate</span>
                    <span className='text-blue-900 font-bold'>{result.premiumRate}%</span>
                  </div>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-blue-800 font-medium'>Premium Amount</span>
                    <span className='text-blue-900 font-bold'>₹{result.premiumAmount} Lakhs</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-blue-800 font-medium'>Coverage Amount</span>
                    <span className='text-blue-900 font-bold'>₹{result.coverageAmount} Crores</span>
                  </div>
                </div>

                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <h3 className='font-semibold text-green-900 mb-2'>Benefits</h3>
                  <ul className='text-green-800 text-sm space-y-1'>
                    <li>• Government backing and guarantee</li>
                    <li>• Risk mitigation worth ₹{result.savings} Crores</li>
                    <li>• Enhanced creditworthiness</li>
                    <li>• Access to new markets</li>
                  </ul>
                </div>

                <div className='text-center'>
                  <a
                    href='/dashboard/ecgc'
                    className='inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors space-x-2'
                  >
                    <span>Apply for This Policy</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-500 py-12'>
                <Calculator className='h-16 w-16 mx-auto mb-4 text-gray-300' />
                <p>Fill in the details to calculate your premium</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className='mt-12 bg-white rounded-lg shadow-lg p-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>About ECGC Services</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <span>🛡️</span>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Risk Protection</h3>
              <p className='text-gray-600'>
                Comprehensive protection against commercial and political risks in international
                trade.
              </p>
            </div>
            <div>
              <span>🌍</span>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Global Coverage</h3>
              <p className='text-gray-600'>
                Coverage available for exports to over 190 countries worldwide with competitive
                premiums.
              </p>
            </div>
            <div>
              <span>$</span>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Government Backing</h3>
              <p className='text-gray-600'>
                Backed by Government of India with sovereign guarantee ensuring reliable claim
                settlements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
