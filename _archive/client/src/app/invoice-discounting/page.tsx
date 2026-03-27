'use client';
import { AlertCircle, Calculator, Percent, Timer } from 'lucide-react';
import { useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  buyer: string;
  seller: string;
  amount: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  status: 'pending' | 'approved' | 'funded' | 'rejected' | 'collected';
  discountRate: number;
  fundingAmount: number;
  creditScore: string;
  riskLevel: 'low' | 'medium' | 'high';
  documents: string[];
  gstVerified: boolean;
  collectionProbability: number;
}

export default function InvoiceDiscountingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      invoiceNumber: 'INV-2024-001',
      buyer: 'Manufacturing Co Ltd',
      seller: 'TechCorp Industries',
      amount: 500000,
      currency: 'INR',
      dueDate: '2024-02-15T10:30:00Z',
      issueDate: '2024-01-15T10:30:00Z',
      status: 'approved',
      discountRate: 15.5,
      fundingAmount: 422500,
      creditScore: 'AAA',
      riskLevel: 'low',
      documents: ['invoice.pdf', 'purchase_order.pdf', 'gst_certificate.pdf'],
      gstVerified: true,
      collectionProbability: 98,
    },
    {
      id: 'INV-002',
      invoiceNumber: 'INV-2024-002',
      buyer: 'Agri Business Ltd',
      seller: 'AgriSolutions Ltd',
      amount: 750000,
      currency: 'INR',
      dueDate: '2024-02-20T15:45:00Z',
      issueDate: '2024-01-14T15:45:00Z',
      status: 'funded',
      discountRate: 18.2,
      fundingAmount: 613500,
      creditScore: 'AA',
      riskLevel: 'medium',
      documents: ['invoice.pdf', 'contract.pdf', 'delivery_challan.pdf'],
      gstVerified: true,
      collectionProbability: 92,
    },
    {
      id: 'INV-003',
      invoiceNumber: 'INV-2024-003',
      buyer: 'Global Corp',
      seller: 'International Suppliers',
      amount: 10000,
      currency: 'USD',
      dueDate: '2024-02-10T09:20:00Z',
      issueDate: '2024-01-13T09:20:00Z',
      status: 'rejected',
      discountRate: 22.5,
      fundingAmount: 0,
      creditScore: 'B',
      riskLevel: 'high',
      documents: ['invoice.pdf', 'dispute_form.pdf'],
      gstVerified: false,
      collectionProbability: 65,
    },
  ]);

  const [showAmounts, setShowAmounts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    return `${symbols[currency as keyof typeof symbols]}${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'funded':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'collected':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <span>✅</span>;
      case 'funded':
        return <span>$</span>;
      case 'pending':
        return <span>🕐</span>;
      case 'rejected':
        return <AlertCircle className='h-5 w-5' />;
      case 'collected':
        return <span>📈</span>;
      default:
        return <span>🕐</span>;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleUploadInvoice = () => {
    // Implement invoice upload functionality
    console.log('Upload invoice clicked');
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalFunded = invoices
    .filter(inv => inv.status === 'funded')
    .reduce((sum, inv) => sum + inv.fundingAmount, 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const averageDiscountRate =
    invoices.reduce((sum, inv) => sum + inv.discountRate, 0) / invoices.length;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Invoice Discounting</h1>
              <p className='text-gray-600 mt-1'>
                MSME invoice financing with AI-powered credit assessment
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className='p-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>🔄</span>
              </button>
              <button
                onClick={handleUploadInvoice}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
              >
                <span>⬆️</span>
                <span>Upload Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-3'>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Total Invoice Value</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {showAmounts ? formatCurrency(totalAmount, 'INR') : '••••••••'}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <span>📄</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Total Funded</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {showAmounts ? formatCurrency(totalFunded, 'INR') : '••••••••'}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <span>$</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Pending Invoices</p>
                    <p className='text-2xl font-bold text-gray-900'>{pendingInvoices}</p>
                  </div>
                  <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                    <span>🕐</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl p-6 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Avg Discount Rate</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {showAmounts ? `${averageDiscountRate.toFixed(1)}%` : '••••••••'}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <Percent className='h-6 w-6 text-purple-600' />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className='bg-white rounded-xl shadow-sm'>
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-gray-900'>Invoice Portfolio</h2>
                  <button
                    onClick={() => setShowAmounts(!showAmounts)}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    {showAmounts ? <span>👁️</span> : <span>👁️</span>}
                  </button>
                </div>
              </div>

              <div className='divide-y divide-gray-200'>
                {invoices.map(invoice => (
                  <div key={invoice.id} className='p-6 hover:bg-gray-50 transition-colors'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4'>
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusIcon(invoice.status)}
                        </div>
                        <div>
                          <h3 className='font-semibold text-gray-900'>{invoice.invoiceNumber}</h3>
                          <p className='text-sm text-gray-500'>
                            {invoice.seller} → {invoice.buyer}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className='text-right'>
                        <p className='text-lg font-semibold text-gray-900'>
                          {showAmounts
                            ? formatCurrency(invoice.amount, invoice.currency)
                            : '••••••••'}
                        </p>
                        <div className='flex items-center space-x-2 mt-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                              invoice.riskLevel
                            )}`}
                          >
                            {invoice.creditScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-500'>Discount Rate:</span>
                        <p className='font-medium'>
                          {showAmounts ? `${invoice.discountRate}%` : '••••••••'}
                        </p>
                      </div>
                      <div>
                        <span className='text-gray-500'>Funding Amount:</span>
                        <p className='font-medium'>
                          {showAmounts
                            ? formatCurrency(invoice.fundingAmount, invoice.currency)
                            : '••••••••'}
                        </p>
                      </div>
                      <div>
                        <span className='text-gray-500'>Collection Probability:</span>
                        <p className='font-medium'>{invoice.collectionProbability}%</p>
                      </div>
                      <div>
                        <span className='text-gray-500'>GST Verified:</span>
                        <p className='font-medium'>
                          {invoice.gstVerified ? (
                            <span>✅</span>
                          ) : (
                            <AlertCircle className='h-4 w-4 text-red-500 inline' />
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-between mt-4 pt-4 border-t border-gray-100'>
                      <div className='flex items-center space-x-4'>
                        <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                          View Details
                        </button>
                        <button className='text-sm text-gray-600 hover:text-gray-700'>
                          Download Documents
                        </button>
                      </div>

                      <div className='flex items-center space-x-2'>
                        {invoice.status === 'pending' && (
                          <button className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                            Approve Funding
                          </button>
                        )}
                        {invoice.status === 'approved' && (
                          <button className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                            Release Funds
                          </button>
                        )}
                        {invoice.status === 'rejected' && (
                          <button className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'>
                            Review Decision
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* MSME Info */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>MSME Benefits</h3>
              <div className='space-y-4'>
                <div className='flex items-center space-x-3'>
                  <Timer className='h-5 w-5 text-green-600' />
                  <div>
                    <div className='font-medium'>24-Hour Funding</div>
                    <div className='text-sm text-gray-500'>Instant liquidity provision</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <Calculator className='h-5 w-5 text-blue-600' />
                  <div>
                    <div className='font-medium'>Competitive Rates</div>
                    <div className='text-sm text-gray-500'>12-25% annual rates</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>🛡️</span>
                  <div>
                    <div className='font-medium'>Risk Assessment</div>
                    <div className='text-sm text-gray-500'>AI-powered credit scoring</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>Eligibility Criteria</h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>Valid MSME Registration</div>
                    <div className='text-sm text-gray-500'>Udyam certificate required</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>GST Compliance</div>
                    <div className='text-sm text-gray-500'>12+ months of filing</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>Minimum Invoice Value</div>
                    <div className='text-sm text-gray-500'>₹1,00,000 per invoice</div>
                  </div>
                </div>
                <div className='flex items-center space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium'>Maximum Funding</div>
                    <div className='text-sm text-gray-500'>₹50,00,000 per invoice</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
              <div className='space-y-3'>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <Calculator className='h-5 w-5 text-blue-600' />
                    <span className='font-medium'>Rate Calculator</span>
                  </div>
                  <span>→</span>
                </button>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span>📊</span>
                    <span className='font-medium'>Risk Analytics</span>
                  </div>
                  <span>→</span>
                </button>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span>⬇️</span>
                    <span className='font-medium'>Download Reports</span>
                  </div>
                  <span>→</span>
                </button>
                <button className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                  <div className='flex items-center space-x-3'>
                    <span>👤</span>
                    <span className='font-medium'>MSME Support</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
