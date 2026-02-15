import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ScaleIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface InvoiceDiscountingPlatform {
  id: string;
  name: string;
  logo: string;
  baseRate: number;
  escrowBonusRate: number;
  maxAmount: number;
  processingTime: string;
  features: string[];
  trustScore: number;
}

interface DiscountingApplication {
  invoiceAmount: number;
  escrowAccountId?: string;
  gstCompliance: boolean;
  bankVerification: boolean;
  selectedPlatform?: string;
  estimatedRate: number;
  estimatedAmount: number;
}

interface EscrowBackedDiscountingProps {
  userId: string;
  invoiceAmount?: number;
  escrowAccountId?: string;
  gstCompliance?: boolean;
  bankVerification?: boolean;
  onApplicationSubmit?: (application: DiscountingApplication) => void;
}

const EnhancedInvoiceDiscounting: React.FC<EscrowBackedDiscountingProps> = ({
  userId,
  invoiceAmount = 0,
  escrowAccountId,
  gstCompliance = true,
  bankVerification = true,
  onApplicationSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'platforms' | 'application' | 'status'>(
    'overview'
  );
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [application, setApplication] = useState<DiscountingApplication>({
    invoiceAmount,
    escrowAccountId,
    gstCompliance,
    bankVerification,
    estimatedRate: 0,
    estimatedAmount: 0,
  });
  const [loading, setLoading] = useState(false);

  // Enhanced platform data with escrow backing
  const platforms: InvoiceDiscountingPlatform[] = [
    {
      id: 'm1_exchange',
      name: 'M1 Exchange',
      logo: '🏦',
      baseRate: 12.5,
      escrowBonusRate: 2.5, // 2.5% better rate for escrow-backed
      maxAmount: 10000000, // ₹1 Crore
      processingTime: '24-48 hours',
      features: [
        'Premium rates for escrow-backed invoices',
        'Instant approval for verified GST',
        'Zero collateral requirement',
        'Flexible repayment terms',
      ],
      trustScore: 95,
    },
    {
      id: 'kredx',
      name: 'KredX',
      logo: '💳',
      baseRate: 14.0,
      escrowBonusRate: 1.5, // 1.5% better rate for bank guarantee
      maxAmount: 5000000, // ₹50 Lakh
      processingTime: '2-3 days',
      features: [
        'Bank guarantee acceptance',
        'GST-compliant invoice processing',
        'Digital documentation',
        'Quick disbursement',
      ],
      trustScore: 88,
    },
    {
      id: 'invoicemart',
      name: 'InvoiceMart',
      logo: '📄',
      baseRate: 15.5,
      escrowBonusRate: 1.0, // 1% better rate for verified suppliers
      maxAmount: 2500000, // ₹25 Lakh
      processingTime: '3-5 days',
      features: [
        'MSME-focused platform',
        'Competitive rates for small invoices',
        'Simple application process',
        'Local language support',
      ],
      trustScore: 82,
    },
  ];

  // Calculate best rates based on escrow backing
  useEffect(() => {
    if (application.invoiceAmount > 0) {
      const bestPlatform = getBestPlatform();
      const rate = calculateRate(bestPlatform);
      const amount = calculateDiscountedAmount(application.invoiceAmount, rate);

      setApplication(prev => ({
        ...prev,
        selectedPlatform: bestPlatform.id,
        estimatedRate: rate,
        estimatedAmount: amount,
      }));
      setSelectedPlatform(bestPlatform.id);
    }
  }, [
    application.invoiceAmount,
    application.escrowAccountId,
    application.gstCompliance,
    application.bankVerification,
  ]);

  const getBestPlatform = (): InvoiceDiscountingPlatform => {
    return (
      platforms
        .filter(p => application.invoiceAmount <= p.maxAmount)
        .sort((a, b) => {
          const rateA = calculateRate(a);
          const rateB = calculateRate(b);
          return rateA - rateB; // Lower rate is better
        })[0] || platforms[0]
    );
  };

  const calculateRate = (platform: InvoiceDiscountingPlatform): number => {
    let rate = platform.baseRate;

    // Escrow backing bonus
    if (application.escrowAccountId) {
      rate -= platform.escrowBonusRate;
    }

    // GST compliance bonus
    if (application.gstCompliance) {
      rate -= 0.5;
    }

    // Bank verification bonus
    if (application.bankVerification) {
      rate -= 0.5;
    }

    return Math.max(rate, 8.0); // Minimum rate floor
  };

  const calculateDiscountedAmount = (invoiceAmount: number, rate: number): number => {
    const discountAmount = (invoiceAmount * rate) / 100;
    return invoiceAmount - discountAmount;
  };

  const handleApplicationSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onApplicationSubmit) {
        onApplicationSubmit(application);
      }

      setActiveTab('status');
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className='space-y-6'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-2xl font-bold mb-2'>Enhanced Invoice Discounting</h3>
            <p className='text-purple-100 mb-4'>
              Get instant funding with escrow-backed security and premium rates
            </p>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <ShieldCheckIcon className='h-5 w-5' />
                <span className='text-sm'>Escrow Secured</span>
              </div>
              <div className='flex items-center gap-2'>
                <TrendingUpIcon className='h-5 w-5' />
                <span className='text-sm'>Better Rates</span>
              </div>
              <div className='flex items-center gap-2'>
                <ClockIcon className='h-5 w-5' />
                <span className='text-sm'>Quick Approval</span>
              </div>
            </div>
          </div>
          <DocumentTextIcon className='h-16 w-16 text-white/80' />
        </div>
      </div>

      {/* Key Benefits */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-green-100 rounded-lg'>
              <ShieldCheckIcon className='h-6 w-6 text-green-600' />
            </div>
            <h4 className='font-semibold text-gray-900'>Escrow Advantage</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Escrow-backed invoices get 2-3% better rates due to reduced risk
          </p>
          <div className='text-lg font-bold text-green-600'>Up to 3% Lower</div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <BanknotesIcon className='h-6 w-6 text-blue-600' />
            </div>
            <h4 className='font-semibold text-gray-900'>Higher Limits</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Access higher funding limits with escrow guarantee
          </p>
          <div className='text-lg font-bold text-blue-600'>₹1 Crore+</div>
        </div>

        <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <ClockIcon className='h-6 w-6 text-purple-600' />
            </div>
            <h4 className='font-semibold text-gray-900'>Faster Processing</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Pre-verified escrow accounts get priority processing
          </p>
          <div className='text-lg font-bold text-purple-600'>24-48 Hours</div>
        </div>
      </div>

      {/* Rate Comparison */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h4 className='font-semibold text-blue-900 mb-4'>Rate Advantage Calculator</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-white p-4 rounded-lg'>
            <h5 className='font-medium text-gray-900 mb-3'>Standard Invoice Discounting</h5>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Base Rate:</span>
                <span className='font-medium'>14-18% per annum</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Processing Time:</span>
                <span className='font-medium'>5-7 days</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Approval Rate:</span>
                <span className='font-medium'>60-70%</span>
              </div>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg border-2 border-green-200'>
            <h5 className='font-medium text-green-900 mb-3'>Escrow-Backed Discounting</h5>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Enhanced Rate:</span>
                <span className='font-medium text-green-600'>9-12% per annum</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Processing Time:</span>
                <span className='text-sm font-medium text-green-600'>24-48 hours</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Approval Rate:</span>
                <span className='font-medium text-green-600'>95-98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Application */}
      {application.invoiceAmount > 0 && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-green-900 mb-2'>Ready to Apply</h4>
              <p className='text-sm text-green-700'>
                Invoice Amount: ₹{application.invoiceAmount.toLocaleString()} • Estimated Rate:{' '}
                {application.estimatedRate.toFixed(1)}% • You'll Receive: ₹
                {application.estimatedAmount.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('application')}
              className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
            >
              Apply Now
              <ArrowRightIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlatforms = () => (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>Platform Comparison</h3>
        <p className='text-gray-600'>
          Choose the best platform based on your requirements and escrow backing
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {platforms.map(platform => {
          const rate = calculateRate(platform);
          const amount = calculateDiscountedAmount(application.invoiceAmount || 1000000, rate);
          const isRecommended = platform.id === getBestPlatform().id;

          return (
            <motion.div
              key={platform.id}
              className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all ${
                selectedPlatform === platform.id
                  ? 'border-blue-500 shadow-lg'
                  : isRecommended
                  ? 'border-green-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPlatform(platform.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isRecommended && (
                <div className='mb-4'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    Recommended
                  </span>
                </div>
              )}

              <div className='flex items-center gap-3 mb-4'>
                <div className='text-3xl'>{platform.logo}</div>
                <div>
                  <h4 className='font-semibold text-gray-900'>{platform.name}</h4>
                  <div className='flex items-center gap-1'>
                    <span className='text-sm text-gray-600'>Trust Score:</span>
                    <span className='text-sm font-medium text-green-600'>
                      {platform.trustScore}%
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-3 mb-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-600'>Your Rate:</span>
                  <div className='text-right'>
                    <div className='text-lg font-bold text-blue-600'>{rate.toFixed(1)}%</div>
                    {application.escrowAccountId && (
                      <div className='text-xs text-green-600'>
                        -{platform.escrowBonusRate}% escrow bonus
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Max Amount:</span>
                  <span className='text-sm font-medium'>
                    ₹{(platform.maxAmount / 100000).toFixed(0)}L
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Processing:</span>
                  <span className='text-sm font-medium'>{platform.processingTime}</span>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h5 className='font-medium text-gray-900 mb-2'>Key Features:</h5>
                <ul className='space-y-1'>
                  {platform.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className='flex items-center gap-2 text-xs text-gray-600'>
                      <CheckCircleIcon className='h-3 w-3 text-green-500' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {application.invoiceAmount > 0 && (
                <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                  <div className='text-center'>
                    <div className='text-sm text-gray-600'>You'll Receive</div>
                    <div className='text-lg font-bold text-blue-600'>
                      ₹{amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Escrow Advantage Explanation */}
      <div className='bg-purple-50 border border-purple-200 rounded-lg p-6'>
        <h4 className='font-semibold text-purple-900 mb-4'>Why Escrow Backing Gets Better Rates</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <ShieldCheckIcon className='h-5 w-5 text-purple-600' />
              <span className='text-sm text-purple-800'>Reduced risk for lenders</span>
            </div>
            <div className='flex items-center gap-3'>
              <BanknotesIcon className='h-5 w-5 text-purple-600' />
              <span className='text-sm text-purple-800'>Guaranteed collateral backing</span>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <CheckCircleIcon className='h-5 w-5 text-purple-600' />
              <span className='text-sm text-purple-800'>Higher approval rates</span>
            </div>
            <div className='flex items-center gap-3'>
              <ClockIcon className='h-5 w-5 text-purple-600' />
              <span className='text-sm text-purple-800'>Faster processing times</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApplication = () => (
    <div className='space-y-6'>
      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>Invoice Discounting Application</h3>
        <p className='text-gray-600'>
          Complete your application with escrow backing for better rates
        </p>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h4 className='font-semibold text-gray-900 mb-4'>Application Details</h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Invoice Amount</label>
              <div className='relative'>
                <CurrencyRupeeIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                <input
                  type='number'
                  value={application.invoiceAmount}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      invoiceAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter invoice amount'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Escrow Account (Optional)
              </label>
              <input
                type='text'
                value={application.escrowAccountId || ''}
                onChange={e =>
                  setApplication(prev => ({
                    ...prev,
                    escrowAccountId: e.target.value || undefined,
                  }))
                }
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Enter escrow account ID for better rates'
              />
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='gst-compliance'
                  checked={application.gstCompliance}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      gstCompliance: e.target.checked,
                    }))
                  }
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label htmlFor='gst-compliance' className='text-sm text-gray-700'>
                  GST Compliant Invoice
                </label>
              </div>

              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='bank-verification'
                  checked={application.bankVerification}
                  onChange={e =>
                    setApplication(prev => ({
                      ...prev,
                      bankVerification: e.target.checked,
                    }))
                  }
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label htmlFor='bank-verification' className='text-sm text-gray-700'>
                  Bank Account Verified
                </label>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='bg-blue-50 rounded-lg p-4'>
              <h5 className='font-medium text-blue-900 mb-3'>Rate Calculation</h5>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Base Rate:</span>
                  <span className='font-medium'>
                    {selectedPlatform
                      ? platforms.find(p => p.id === selectedPlatform)?.baseRate
                      : 0}
                    %
                  </span>
                </div>
                {application.escrowAccountId && (
                  <div className='flex justify-between text-green-600'>
                    <span>Escrow Bonus:</span>
                    <span className='font-medium'>
                      -{platforms.find(p => p.id === selectedPlatform)?.escrowBonusRate || 0}%
                    </span>
                  </div>
                )}
                {application.gstCompliance && (
                  <div className='flex justify-between text-green-600'>
                    <span>GST Compliance:</span>
                    <span className='font-medium'>-0.5%</span>
                  </div>
                )}
                {application.bankVerification && (
                  <div className='flex justify-between text-green-600'>
                    <span>Bank Verified:</span>
                    <span className='font-medium'>-0.5%</span>
                  </div>
                )}
                <div className='border-t pt-2 flex justify-between font-bold'>
                  <span>Final Rate:</span>
                  <span className='text-blue-600'>{application.estimatedRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className='bg-green-50 rounded-lg p-4'>
              <h5 className='font-medium text-green-900 mb-3'>Funding Details</h5>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Invoice Amount:</span>
                  <span className='font-medium'>₹{application.invoiceAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Discount Amount:</span>
                  <span className='font-medium'>
                    ₹{(application.invoiceAmount - application.estimatedAmount).toLocaleString()}
                  </span>
                </div>
                <div className='border-t pt-2 flex justify-between font-bold'>
                  <span>You'll Receive:</span>
                  <span className='text-green-600'>
                    ₹{application.estimatedAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6 flex gap-4'>
          <button
            onClick={() => setActiveTab('platforms')}
            className='flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300'
          >
            Back to Platforms
          </button>
          <button
            onClick={handleApplicationSubmit}
            disabled={loading || application.invoiceAmount <= 0}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircleIcon className='h-10 w-10 text-green-600' />
        </div>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>Application Submitted!</h3>
        <p className='text-gray-600'>
          Your invoice discounting application has been successfully submitted
        </p>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h4 className='font-semibold text-gray-900 mb-4'>Application Summary</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Invoice Amount:</span>
              <span className='font-medium'>₹{application.invoiceAmount.toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Platform:</span>
              <span className='font-medium'>
                {platforms.find(p => p.id === selectedPlatform)?.name}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Rate:</span>
              <span className='font-medium'>{application.estimatedRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Funding Amount:</span>
              <span className='font-medium text-green-600'>
                ₹{application.estimatedAmount.toLocaleString()}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Processing Time:</span>
              <span className='font-medium'>
                {platforms.find(p => p.id === selectedPlatform)?.processingTime}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Application ID:</span>
              <span className='font-medium'>ID{Date.now()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h4 className='font-semibold text-blue-900 mb-4'>Next Steps</h4>
        <ol className='space-y-2 text-sm text-blue-800'>
          <li className='flex items-center gap-2'>
            <span className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs'>
              1
            </span>
            Document verification (2-4 hours)
          </li>
          <li className='flex items-center gap-2'>
            <span className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs'>
              2
            </span>
            Credit assessment and approval (24-48 hours)
          </li>
          <li className='flex items-center gap-2'>
            <span className='w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs'>
              3
            </span>
            Fund disbursement to your account
          </li>
        </ol>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
    { id: 'platforms', label: 'Platforms', icon: ScaleIcon },
    { id: 'application', label: 'Apply', icon: BanknotesIcon },
    { id: 'status', label: 'Status', icon: CheckCircleIcon },
  ];

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Enhanced Invoice Discounting</h2>
        <p className='text-gray-600'>
          Get instant funding with escrow-backed security and premium rates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='-mb-px flex space-x-8'>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='h-4 w-4' />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'platforms' && renderPlatforms()}
          {activeTab === 'application' && renderApplication()}
          {activeTab === 'status' && renderStatus()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EnhancedInvoiceDiscounting;
