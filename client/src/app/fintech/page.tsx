'use client';

import React, { useState } from 'react';
import { CreditCard, Shield, TrendingUp, FileText, DollarSign, Clock, CheckCircle, AlertCircle, Calculator, Briefcase } from 'lucide-react';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  amount: number;
  dueDate: string;
  discountRate: number;
  eligibleAmount: number;
}

interface FinanceApplication {
  id: string;
  type: 'invoice_discounting' | 'supply_chain_finance' | 'working_capital';
  provider: 'm1_exchange' | 'kreed';
  amount: number;
  status: 'pending' | 'approved' | 'disbursed' | 'rejected';
  applicationDate: string;
  approvalDate?: string;
}

export default function FintechIntegrationSystem() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [financeAmount, setFinanceAmount] = useState(500000);

  // Sample data
  const invoices: InvoiceData[] = [
    {
      id: 'INV001',
      invoiceNumber: 'INV-2025-001',
      buyerName: 'Tata Steel Ltd',
      amount: 2500000,
      dueDate: '2025-08-15',
      discountRate: 12.5,
      eligibleAmount: 2250000
    },
    {
      id: 'INV002', 
      invoiceNumber: 'INV-2025-002',
      buyerName: 'Reliance Industries',
      amount: 1800000,
      dueDate: '2025-08-20',
      discountRate: 11.8,
      eligibleAmount: 1620000
    },
    {
      id: 'INV003',
      invoiceNumber: 'INV-2025-003', 
      buyerName: 'Mahindra & Mahindra',
      amount: 950000,
      dueDate: '2025-08-25',
      discountRate: 13.2,
      eligibleAmount: 855000
    }
  ];

  const applications: FinanceApplication[] = [
    {
      id: 'APP001',
      type: 'invoice_discounting',
      provider: 'm1_exchange',
      amount: 2250000,
      status: 'approved',
      applicationDate: '2025-07-20',
      approvalDate: '2025-07-22'
    },
    {
      id: 'APP002',
      type: 'working_capital',
      provider: 'kreed',
      amount: 5000000,
      status: 'pending',
      applicationDate: '2025-07-25'
    }
  ];

  const calculateTotalDiscount = () => {
    return selectedInvoices.reduce((total, invoiceId) => {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      return total + (invoice ? invoice.amount - invoice.eligibleAmount : 0);
    }, 0);
  };

  const calculateTotalEligible = () => {
    return selectedInvoices.reduce((total, invoiceId) => {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      return total + (invoice ? invoice.eligibleAmount : 0);
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'disbursed': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Services Hub</h1>
          <p className="text-gray-600">Access invoice discounting, supply chain finance, and working capital solutions</p>
        </div>

        {/* Provider Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* M1 Exchange */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">M1 Exchange</h3>
                <p className="text-blue-700">Invoice Discounting & Trade Finance</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-semibold text-blue-600">11% - 15% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-semibold">24-48 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Financing</span>
                <span className="font-semibold">₹10 Crores</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold">
                Apply Now
              </button>
              <button className="border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Kreed */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Kreed</h3>
                <p className="text-green-700">Supply Chain Finance & Working Capital</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-semibold text-green-600">10% - 14% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time</span>
                <span className="font-semibold">2-5 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Financing</span>
                <span className="font-semibold">₹25 Crores</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all font-semibold">
                Apply Now
              </button>
              <button className="border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'invoice_discounting', label: 'Invoice Discounting', icon: '📄' },
                { id: 'working_capital', label: 'Working Capital', icon: '💰' },
                { id: 'applications', label: 'Applications', icon: '📋' },
                { id: 'analytics', label: 'Analytics', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">₹45L</div>
                    <div className="text-sm text-gray-600">Available Credit</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">₹12L</div>
                    <div className="text-sm text-gray-600">Funds Utilized</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">12.5%</div>
                    <div className="text-sm text-gray-600">Avg Interest Rate</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">24hr</div>
                    <div className="text-sm text-gray-600">Avg Processing</div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Financial Transactions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Invoice Discounted</div>
                          <div className="text-sm text-gray-600">INV-2025-001 • M1 Exchange</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">₹22.5L</div>
                        <div className="text-sm text-gray-600">2 days ago</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">Working Capital Approved</div>
                          <div className="text-sm text-gray-600">Credit Line • Kreed</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">₹50L</div>
                        <div className="text-sm text-gray-600">5 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoice_discounting' && (
              <div className="space-y-6">
                {/* Invoice Selection */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Select Invoices for Discounting</h3>
                  
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div 
                        key={invoice.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedInvoices.includes(invoice.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (selectedInvoices.includes(invoice.id)) {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                          } else {
                            setSelectedInvoices([...selectedInvoices, invoice.id]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div>
                              <div className="font-semibold">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-gray-600">{invoice.buyerName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{(invoice.amount / 100000).toFixed(1)}L</div>
                            <div className="text-sm text-gray-600">Due: {invoice.dueDate}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">₹{(invoice.eligibleAmount / 100000).toFixed(1)}L</div>
                            <div className="text-sm text-gray-600">{invoice.discountRate}% rate</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedInvoices.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Discounting Summary</h4>
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold">
                          Apply for Discounting
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Invoice Value:</span>
                          <div className="font-semibold text-lg">₹{(selectedInvoices.reduce((total, id) => {
                            const inv = invoices.find(i => i.id === id);
                            return total + (inv ? inv.amount : 0);
                          }, 0) / 100000).toFixed(1)}L</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Eligible Amount:</span>
                          <div className="font-semibold text-lg text-green-600">₹{(calculateTotalEligible() / 100000).toFixed(1)}L</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Discount Charges:</span>
                          <div className="font-semibold text-lg text-red-600">₹{(calculateTotalDiscount() / 100000).toFixed(1)}L</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* M1 Exchange Application */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">M1 Exchange Application</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financing Amount
                      </label>
                      <input
                        type="number"
                        value={financeAmount}
                        onChange={(e) => setFinanceAmount(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repayment Period
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                        <option>180 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-3">Estimated Costs</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Interest (12.5% p.a.):</span>
                        <div className="font-semibold">₹{Math.round(financeAmount * 0.125 / 12).toLocaleString()}/month</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Processing Fee:</span>
                        <div className="font-semibold">₹{Math.round(financeAmount * 0.005).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Cost (30 days):</span>
                        <div className="font-semibold text-red-600">₹{Math.round(financeAmount * 0.125 / 12 + financeAmount * 0.005).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Finance Applications</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">
                    New Application
                  </button>
                </div>

                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            app.provider === 'm1_exchange' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {app.provider === 'm1_exchange' ? 
                              <FileText className="w-5 h-5 text-blue-600" /> : 
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            }
                          </div>
                          <div>
                            <div className="font-semibold">{app.id}</div>
                            <div className="text-sm text-gray-600 capitalize">
                              {app.type.replace('_', ' ')} • {app.provider.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-lg">₹{(app.amount / 100000).toFixed(1)}L</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Applied On:</span>
                          <div className="font-semibold">{app.applicationDate}</div>
                        </div>
                        {app.approvalDate && (
                          <div>
                            <span className="text-gray-600">Approved On:</span>
                            <div className="font-semibold">{app.approvalDate}</div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button className="flex-1 border border-gray-300 text-gray-700 py-1 px-3 rounded hover:bg-gray-50 transition-all">
                            View Details
                          </button>
                          {app.status === 'approved' && (
                            <button className="flex-1 bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition-all">
                              Disburse
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
