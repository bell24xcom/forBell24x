'use client';

import { Building, BarChart3, Shield, Globe, FileText, AlertTriangle, Target } from 'lucide-react';
import { useState } from 'react';

interface ECGCPolicy {
  id: string;
  type: string;
  coverageAmount: number;
  premium: number;
  country: string;
  buyer: string;
  status: 'active' | 'pending' | 'expired';
  expiryDate: string;
  claimsPaid: number;
}

export default function ECGCDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const [ecgcStats, setEcgcStats] = useState({
    totalCoverage: 245.8, // in Crores
    activePolicies: 847,
    claimsPaid: 12.4,
    successRate: 98.7,
    countries: 34,
    premiumSaved: 8.9,
  });

  const policyTypes = [
    {
      id: 'shipment',
      name: 'Shipment Credit Insurance',
      description: 'Covers post-shipment credit risks',
      coverage: 'Up to 95% of invoice value',
      premium: '0.25% - 2.5%',
      minAmount: '₹10 Lakh',
      maxAmount: '₹500 Crore',
      icon: <span>🛡️</span>,
      popular: true,
    },
    {
      id: 'packing',
      name: 'Packing Credit Guarantee',
      description: 'Pre-shipment finance guarantee',
      coverage: 'Up to 100% of credit limit',
      premium: '0.15% - 1.8%',
      minAmount: '₹5 Lakh',
      maxAmount: '₹200 Crore',
      icon: <span>💳</span>,
      popular: false,
    },
    {
      id: 'buyer',
      name: 'Buyer Credit Policy',
      description: 'Covers buyer default risks',
      coverage: 'Up to 85% of credit amount',
      premium: '0.20% - 3.0%',
      minAmount: '₹25 Lakh',
      maxAmount: '₹1000 Crore',
      icon: <span>👤</span>,
      popular: true,
    },
    {
      id: 'bank',
      name: 'Bank Guarantee Policy',
      description: 'Covers bank guarantee risks',
      coverage: 'Up to 90% of guarantee',
      premium: '0.10% - 1.5%',
      minAmount: '₹15 Lakh',
      maxAmount: '₹300 Crore',
      icon: <Building className='h-8 w-8' />,
      popular: false,
    },
  ];

  const activePolicies: ECGCPolicy[] = [
    {
      id: 'ECGC-2024-001',
      type: 'Shipment Credit Insurance',
      coverageAmount: 45.2,
      premium: 1.25,
      country: 'United States',
      buyer: 'TechCorp USA Inc.',
      status: 'active',
      expiryDate: '2025-03-15',
      claimsPaid: 0,
    },
    {
      id: 'ECGC-2024-002',
      type: 'Buyer Credit Policy',
      coverageAmount: 78.5,
      premium: 2.1,
      country: 'Germany',
      buyer: 'MechaniX GmbH',
      status: 'active',
      expiryDate: '2025-06-20',
      claimsPaid: 2.3,
    },
    {
      id: 'ECGC-2024-003',
      type: 'Packing Credit Guarantee',
      coverageAmount: 32.8,
      premium: 0.85,
      country: 'UAE',
      buyer: 'Gulf Suppliers LLC',
      status: 'pending',
      expiryDate: '2025-04-10',
      claimsPaid: 0,
    },
  ];

  const countryCoverage = [
    { country: 'United States', policies: 156, coverage: 67.8, risk: 'low' },
    { country: 'Germany', policies: 89, coverage: 43.2, risk: 'low' },
    { country: 'UAE', policies: 134, coverage: 52.1, risk: 'medium' },
    { country: 'United Kingdom', policies: 67, coverage: 34.5, risk: 'low' },
    { country: 'Singapore', policies: 78, coverage: 28.9, risk: 'low' },
    { country: 'Japan', policies: 45, coverage: 19.6, risk: 'medium' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center'>
                <span>🛡️</span>
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>ECGC Financial Services</h1>
                <p className='text-gray-600'>
                  Export Credit Guarantee Corporation • Risk Mitigation Solutions
                </p>
              </div>
            </div>
            <div className='flex space-x-4'>
              <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2'>
                <span>📄</span>
                <span>New Policy</span>
              </button>
              <button className='border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2'>
                <span>⬇️</span>
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        {/* Navigation Tabs */}
        <div className='bg-white rounded-lg shadow-lg mb-8'>
          <div className='border-b border-gray-200'>
            <nav className='flex space-x-8 px-6'>
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'policies', name: 'Active Policies', icon: Shield },
                { id: 'coverage', name: 'Country Coverage', icon: Globe },
                { id: 'apply', name: 'Apply for Coverage', icon: FileText },
                {
                  id: 'claims',
                  name: 'Claims Management',
                  icon: AlertTriangle,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className='h-4 w-4' />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6'>
              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Total Coverage</p>
                    <p className='text-2xl font-bold text-blue-600'>₹{ecgcStats.totalCoverage}Cr</p>
                  </div>
                  <span>🛡️</span>
                </div>
                <p className='text-xs text-green-600 mt-2'>+23% this quarter</p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Active Policies</p>
                    <p className='text-2xl font-bold text-green-600'>{ecgcStats.activePolicies}</p>
                  </div>
                  <span>📄</span>
                </div>
                <p className='text-xs text-green-600 mt-2'>+156 this month</p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Claims Paid</p>
                    <p className='text-2xl font-bold text-purple-600'>₹{ecgcStats.claimsPaid}Cr</p>
                  </div>
                  <span>✅</span>
                </div>
                <p className='text-xs text-blue-600 mt-2'>98.7% success rate</p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Success Rate</p>
                    <p className='text-2xl font-bold text-orange-600'>{ecgcStats.successRate}%</p>
                  </div>
                  <Target className='h-8 w-8 text-orange-600' />
                </div>
                <p className='text-xs text-green-600 mt-2'>Industry leading</p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Countries</p>
                    <p className='text-2xl font-bold text-indigo-600'>{ecgcStats.countries}</p>
                  </div>
                  <span>🌍</span>
                </div>
                <p className='text-xs text-purple-600 mt-2'>Global coverage</p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Premium Saved</p>
                    <p className='text-2xl font-bold text-red-600'>₹{ecgcStats.premiumSaved}Cr</p>
                  </div>
                  <span>$</span>
                </div>
                <p className='text-xs text-green-600 mt-2'>Cost optimized</p>
              </div>
            </div>

            {/* ECGC Policy Types */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>Available ECGC Policies</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {policyTypes.map(policy => (
                  <div
                    key={policy.id}
                    className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative'
                  >
                    {policy.popular && (
                      <div className='absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold'>
                        Popular
                      </div>
                    )}
                    <div className='flex items-center space-x-4 mb-4'>
                      <div className='w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600'>
                        {policy.icon}
                      </div>
                      <div>
                        <h4 className='font-semibold text-gray-900'>{policy.name}</h4>
                        <p className='text-gray-600 text-sm'>{policy.description}</p>
                      </div>
                    </div>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Coverage:</span>
                        <span className='font-medium'>{policy.coverage}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Premium:</span>
                        <span className='font-medium'>{policy.premium}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Range:</span>
                        <span className='font-medium'>
                          {policy.minAmount} - {policy.maxAmount}
                        </span>
                      </div>
                    </div>
                    <button className='w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ECGC Benefits */}
            <div className='bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-8 text-white'>
              <h3 className='text-2xl font-bold mb-6'>Why Choose ECGC with BELL24H?</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='flex items-center space-x-4'>
                  <span>✅</span>
                  <div>
                    <h4 className='font-semibold'>Government Backing</h4>
                    <p className='text-blue-100 text-sm'>
                      Backed by Government of India with sovereign guarantee
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <span>🛡️</span>
                  <div>
                    <h4 className='font-semibold'>Risk Mitigation</h4>
                    <p className='text-blue-100 text-sm'>
                      Comprehensive coverage against political and commercial risks
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <span>📈</span>
                  <div>
                    <h4 className='font-semibold'>Business Growth</h4>
                    <p className='text-blue-100 text-sm'>
                      Enables confident expansion into new international markets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Policies Tab */}
        {activeTab === 'policies' && (
          <div className='bg-white rounded-lg shadow-lg'>
            <div className='p-6 border-b border-gray-200'>
              <h3 className='text-xl font-bold text-gray-900'>Active ECGC Policies</h3>
              <p className='text-gray-600'>Manage your current export credit insurance policies</p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Policy ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Coverage
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Buyer/Country
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Expiry
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {activePolicies.map(policy => (
                    <tr key={policy.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {policy.id}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {policy.type}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        ₹{policy.coverageAmount}Cr
                        <div className='text-xs text-gray-500'>Premium: {policy.premium}%</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {policy.buyer}
                        <div className='text-xs text-gray-500'>{policy.country}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            policy.status
                          )}`}
                        >
                          {policy.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {policy.expiryDate}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button className='text-blue-600 hover:text-blue-900 mr-3'>View</button>
                        <button className='text-green-600 hover:text-green-900 mr-3'>Renew</button>
                        <button className='text-gray-600 hover:text-gray-900'>Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Country Coverage Tab */}
        {activeTab === 'coverage' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Country-wise Coverage Analysis
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {countryCoverage.map((country, index) => (
                  <div key={index} className='border border-gray-200 rounded-lg p-4'>
                    <div className='flex justify-between items-center mb-3'>
                      <h4 className='font-semibold text-gray-900'>{country.country}</h4>
                      <span className={`text-sm font-medium ${getRiskColor(country.risk)}`}>
                        {country.risk} risk
                      </span>
                    </div>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Active Policies:</span>
                        <span className='font-medium'>{country.policies}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Total Coverage:</span>
                        <span className='font-medium'>₹{country.coverage}Cr</span>
                      </div>
                    </div>
                    <div className='mt-3'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{
                            width: `${(country.coverage / 100) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Apply for Coverage Tab */}
        {activeTab === 'apply' && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>Apply for ECGC Coverage</h3>
            <div className='max-w-2xl'>
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Policy Type
                    </label>
                    <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'>
                      <option>Select Policy Type</option>
                      <option>Shipment Credit Insurance</option>
                      <option>Packing Credit Guarantee</option>
                      <option>Buyer Credit Policy</option>
                      <option>Bank Guarantee Policy</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Coverage Amount
                    </label>
                    <input
                      type='text'
                      placeholder='₹ Enter amount in Crores'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Buyer Country
                    </label>
                    <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'>
                      <option>Select Country</option>
                      <option>United States</option>
                      <option>Germany</option>
                      <option>United Kingdom</option>
                      <option>UAE</option>
                      <option>Singapore</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Credit Period
                    </label>
                    <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'>
                      <option>Select Period</option>
                      <option>30 days</option>
                      <option>60 days</option>
                      <option>90 days</option>
                      <option>180 days</option>
                      <option>360 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Buyer Company Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder='Enter buyer company name, address, and business details'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Info className='h-5 w-5 text-blue-600' />
                    <span className='font-medium text-blue-900'>Estimated Premium</span>
                  </div>
                  <p className='text-blue-800 text-sm'>
                    Based on your selection, the estimated premium will be calculated and displayed
                    here. Final premium may vary based on risk assessment.
                  </p>
                </div>

                <div className='flex space-x-4'>
                  <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2'>
                    <span>📄</span>
                    <span>Submit Application</span>
                  </button>
                  <button className='border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2'>
                    <span>⬇️</span>
                    <span>Download Form</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claims Management Tab */}
        {activeTab === 'claims' && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>Claims Management</h3>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <h4 className='font-semibold text-green-900 mb-2'>Claims Approved</h4>
                  <p className='text-2xl font-bold text-green-600'>₹12.4Cr</p>
                  <p className='text-green-700 text-sm'>34 claims processed</p>
                </div>
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <h4 className='font-semibold text-yellow-900 mb-2'>Under Review</h4>
                  <p className='text-2xl font-bold text-yellow-600'>₹3.8Cr</p>
                  <p className='text-yellow-700 text-sm'>8 claims pending</p>
                </div>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h4 className='font-semibold text-blue-900 mb-2'>Success Rate</h4>
                  <p className='text-2xl font-bold text-blue-600'>98.7%</p>
                  <p className='text-blue-700 text-sm'>Industry leading</p>
                </div>
              </div>

              <div className='border border-gray-200 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-900 mb-4'>File New Claim</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Policy Number
                    </label>
                    <input
                      type='text'
                      placeholder='Enter ECGC policy number'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Claim Amount
                    </label>
                    <input
                      type='text'
                      placeholder='₹ Enter claim amount'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Claim Reason
                  </label>
                  <select className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'>
                    <option>Select reason for claim</option>
                    <option>Buyer Default</option>
                    <option>Political Risk</option>
                    <option>Commercial Risk</option>
                    <option>Currency Transfer Risk</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Supporting Documents
                  </label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                    <span>📄</span>
                    <p className='text-gray-600'>
                      Upload invoices, shipping documents, correspondence
                    </p>
                    <button className='mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'>
                      Choose Files
                    </button>
                  </div>
                </div>

                <div className='mt-6'>
                  <button className='bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2'>
                    <AlertTriangle className='h-4 w-4' />
                    <span>Submit Claim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
