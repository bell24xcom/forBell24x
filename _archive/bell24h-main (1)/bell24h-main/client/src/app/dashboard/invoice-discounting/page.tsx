'use client';

import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  Download,
  Upload,
  Eye,
  Star,
  Award,
  Zap,
  Shield,
  CreditCard,
  Banknote,
  History,
  Settings,
  Plus,
  Filter,
  Search,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// Mock KredX data
const mockKredXData = {
  user: {
    name: 'Rajesh Kumar',
    company: 'TechCorp Industries',
    kycStatus: 'verified',
    creditScore: 750,
  },
  summary: {
    totalInvoices: 24,
    eligibleInvoices: 18,
    totalDiscountEarned: 125000,
    averageDiscountRate: 2.8,
    totalSavings: 350000,
  },
  invoices: [
    {
      id: 'INV001',
      invoiceNumber: 'INV-2024-001',
      supplier: {
        name: 'SteelWorks Ltd',
        rating: 4.8,
        verified: true,
        gstNumber: '29ABCDE1234F1Z5',
      },
      amount: 100000,
      invoiceDate: '2024-09-15',
      dueDate: '2024-10-15',
      status: 'eligible',
      discountRate: 2.5,
      discountAmount: 2500,
      netAmount: 97500,
      processingTime: '24-48 hours',
      riskScore: 'Low',
      category: 'Steel & Metal',
    },
    {
      id: 'INV002',
      invoiceNumber: 'INV-2024-002',
      supplier: {
        name: 'AutoParts Inc',
        rating: 4.5,
        verified: true,
        gstNumber: '27FGHIJ5678K9L2',
      },
      amount: 75000,
      invoiceDate: '2024-09-20',
      dueDate: '2024-10-20',
      status: 'discounted',
      discountRate: 3.0,
      discountAmount: 2250,
      netAmount: 72750,
      processingTime: '24-48 hours',
      riskScore: 'Medium',
      category: 'Automotive',
    },
    {
      id: 'INV003',
      invoiceNumber: 'INV-2024-003',
      supplier: {
        name: 'MarketingPro Solutions',
        rating: 4.7,
        verified: true,
        gstNumber: '19MNOPQ9012R3S4',
      },
      amount: 150000,
      invoiceDate: '2024-09-25',
      dueDate: '2024-10-25',
      status: 'pending',
      discountRate: 2.8,
      discountAmount: 4200,
      netAmount: 145800,
      processingTime: '24-48 hours',
      riskScore: 'Low',
      category: 'Marketing',
    },
    {
      id: 'INV004',
      invoiceNumber: 'INV-2024-004',
      supplier: {
        name: 'LogisticsHub India',
        rating: 4.2,
        verified: false,
        gstNumber: '07TUVWX3456Y7Z8',
      },
      amount: 50000,
      invoiceDate: '2024-09-28',
      dueDate: '2024-10-28',
      status: 'rejected',
      discountRate: 0,
      discountAmount: 0,
      netAmount: 50000,
      processingTime: 'N/A',
      riskScore: 'High',
      category: 'Logistics',
      rejectionReason: 'Supplier not verified',
    },
  ],
  benefits: [
    {
      title: 'Immediate Cash Flow',
      description: 'Get up to 95% of invoice value within 24-48 hours',
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Competitive Rates',
      description: 'Starting from 2% per month with no hidden charges',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'No Collateral Required',
      description: 'Unsecured funding based on invoice value and supplier credibility',
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      title: 'Easy Integration',
      description: 'Seamless integration with your existing accounting systems',
      icon: Zap,
      color: 'text-orange-600',
    },
  ],
  eligibilityCriteria: [
    'Invoice value minimum ₹10,000',
    'Supplier must be GST registered',
    'Invoice should be less than 90 days old',
    'Buyer must have good credit history',
    'Invoice should be genuine and verified',
  ],
};

// Invoice Card Component
const InvoiceCard = ({ invoice, onViewDetails, onApplyDiscount }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'eligible':
        return 'text-green-600 bg-green-100';
      case 'discounted':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">#{invoice.invoiceNumber}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ml-2 ${getRiskColor(invoice.riskScore)}`}>
              {invoice.riskScore} Risk
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="font-medium">{invoice.supplier.name}</span>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span>{invoice.supplier.rating}</span>
            </div>
            {invoice.supplier.verified && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Invoice Amount</div>
          <div className="text-lg font-semibold text-gray-900">
            ₹{invoice.amount.toLocaleString()}
          </div>
        </div>
        
        {invoice.status === 'eligible' || invoice.status === 'discounted' ? (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600">Discount Rate</div>
            <div className="text-lg font-semibold text-green-700">
              {invoice.discountRate}%
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Category</div>
            <div className="text-lg font-semibold text-gray-900">
              {invoice.category}
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600">Processing Time</div>
          <div className="text-lg font-semibold text-blue-700">
            {invoice.processingTime}
          </div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-sm text-purple-600">Net Amount</div>
          <div className="text-lg font-semibold text-purple-700">
            ₹{invoice.netAmount.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>Invoice Date: {invoice.invoiceDate}</span>
        <span>Due Date: {invoice.dueDate}</span>
      </div>

      {invoice.status === 'rejected' && invoice.rejectionReason && (
        <div className="bg-red-50 p-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{invoice.rejectionReason}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => onViewDetails(invoice.id)}
          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
        
        {invoice.status === 'eligible' && (
          <button
            onClick={() => onApplyDiscount(invoice.id)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Apply for Discount
          </button>
        )}
      </div>
    </div>
  );
};

// Benefits Section
const BenefitsSection = ({ benefits }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
        <Award className="w-6 h-6 mr-2 text-blue-600" />
        Why Choose KredX Invoice Discounting?
      </h3>
      <div className="flex items-center text-sm text-gray-600">
        <Zap className="w-4 h-4 mr-1" />
        Powered by KredX
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {benefits.map((benefit, index) => {
        const Icon = benefit.icon;
        return (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-sm`}>
              <Icon className={`w-6 h-6 ${benefit.color}`} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
            <p className="text-sm text-gray-600">{benefit.description}</p>
          </div>
        );
      })}
    </div>
  </div>
);

// Eligibility Criteria
const EligibilityCriteria = ({ criteria }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
      Eligibility Criteria
    </h3>
    <div className="space-y-3">
      {criteria.map((criterion, index) => (
        <div key={index} className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-sm text-gray-700">{criterion}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function InvoiceDiscountingPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const filteredInvoices = mockKredXData.invoices.filter((invoice) => {
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (invoiceId) => {
    const invoice = mockKredXData.invoices.find(inv => inv.id === invoiceId);
    setSelectedInvoice(invoice);
    // You can implement a detailed view modal here
    console.log('View details for invoice:', invoiceId);
  };

  const handleApplyDiscount = (invoiceId) => {
    const invoice = mockKredXData.invoices.find(inv => inv.id === invoiceId);
    // You can implement the discount application flow here
    console.log('Apply discount for invoice:', invoiceId);
    alert(`Applying discount for invoice ${invoice.invoiceNumber}. This will redirect to KredX portal.`);
  };

  const user = mockKredXData.user;

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Discounting</h1>
            <p className="text-gray-600 mt-1">Get immediate cash flow with KredX invoice discounting</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Upload Invoice
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{mockKredXData.summary.totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">{mockKredXData.summary.eligibleInvoices} eligible</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Discount Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{mockKredXData.summary.totalDiscountEarned.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">
                {mockKredXData.summary.averageDiscountRate}% avg rate
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{mockKredXData.summary.totalSavings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">This year</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Credit Score</p>
                <p className="text-2xl font-bold text-gray-900">{user.creditScore}</p>
              </div>
              <Award className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">Excellent</span>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <BenefitsSection benefits={mockKredXData.benefits} />

        {/* Eligibility Criteria */}
        <EligibilityCriteria criteria={mockKredXData.eligibilityCriteria} />

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'eligible', 'discounted', 'pending', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onViewDetails={handleViewDetails}
              onApplyDiscount={handleApplyDiscount}
            />
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
