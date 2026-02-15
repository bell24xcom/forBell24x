import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface BankAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  gstLinked: boolean;
  verified: boolean;
  isPrimary: boolean;
}

interface CompanyDetails {
  gstNumber: string;
  companyName: string;
  address: string;
  panNumber: string;
  directorName: string;
  gstStatus: 'active' | 'inactive' | 'cancelled';
}

interface WalletInfo {
  balance: number;
  walletId: string;
  linkedBankAccount: string;
  monthlyLimit: number;
  usedLimit: number;
}

interface IntegratedBankingSystemProps {
  userId: string;
  onComplete?: (data: any) => void;
}

const IntegratedBankingSystem: React.FC<IntegratedBankingSystemProps> = ({
  userId,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bank' | 'gst' | 'wallet' | 'compliance'>(
    'overview'
  );
  const [verificationProgress, setVerificationProgress] = useState(100);
  const [loading, setLoading] = useState(false);

  // Sample data - In real implementation, this would come from APIs
  const [bankAccount] = useState<BankAccount>({
    id: 'bank_001',
    accountNumber: '****7890',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    accountHolderName: 'Bell24H Enterprises Pvt Ltd',
    gstLinked: true,
    verified: true,
    isPrimary: true,
  });

  const [companyDetails] = useState<CompanyDetails>({
    gstNumber: '27AABCB1234C1Z5',
    companyName: 'Bell24H Enterprises Pvt Ltd',
    address: 'Mumbai, Maharashtra, India',
    panNumber: 'AABCB1234C',
    directorName: 'Vishal A Pendharkar',
    gstStatus: 'active',
  });

  const [walletInfo] = useState<WalletInfo>({
    balance: 150000,
    walletId: 'wallet_bell24h_001',
    linkedBankAccount: 'HDFC****7890',
    monthlyLimit: 1000000,
    usedLimit: 250000,
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GlobeAltIcon },
    { id: 'bank', label: 'Bank Account', icon: BuildingLibraryIcon },
    { id: 'gst', label: 'GST Details', icon: DocumentTextIcon },
    { id: 'wallet', label: 'Wallet', icon: CreditCardIcon },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
  ];

  const handleRefreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const renderOverview = () => (
    <div className='space-y-6'>
      {/* Status Banner */}
      <div className='bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold mb-2'>Banking Integration Complete</h3>
            <p className='text-green-100'>
              Your account is fully verified and ready for transactions
            </p>
          </div>
          <div className='text-right'>
            <div className='text-3xl font-bold'>{verificationProgress}%</div>
            <div className='text-sm text-green-100'>Verified</div>
          </div>
        </div>
        <div className='mt-4'>
          <div className='w-full bg-white/20 rounded-full h-2'>
            <motion.div
              className='h-2 bg-white rounded-full'
              initial={{ width: 0 }}
              animate={{ width: `${verificationProgress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Bank Account</p>
              <p className='text-lg font-semibold text-green-600'>Verified</p>
            </div>
            <BanknotesIcon className='h-8 w-8 text-blue-500' />
          </div>
          <div className='mt-2 text-xs text-gray-500'>
            {bankAccount.bankName} • {bankAccount.accountNumber}
          </div>
        </div>

        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>GST Registration</p>
              <p className='text-lg font-semibold text-green-600'>Active</p>
            </div>
            <ShieldCheckIcon className='h-8 w-8 text-green-500' />
          </div>
          <div className='mt-2 text-xs text-gray-500'>{companyDetails.gstNumber}</div>
        </div>

        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Wallet Balance</p>
              <p className='text-lg font-semibold text-blue-600'>
                ₹{walletInfo.balance.toLocaleString()}
              </p>
            </div>
            <CreditCardIcon className='h-8 w-8 text-purple-500' />
          </div>
          <div className='mt-2 text-xs text-gray-500'>Linked to {walletInfo.linkedBankAccount}</div>
        </div>

        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Compliance Score</p>
              <p className='text-lg font-semibold text-yellow-600'>95%</p>
            </div>
            <CheckCircleIcon className='h-8 w-8 text-yellow-500' />
          </div>
          <div className='mt-2 text-xs text-gray-500'>Excellent standing</div>
        </div>
      </div>

      {/* Transaction Limits */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h4 className='font-semibold text-blue-900 mb-4'>Transaction Capabilities</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <CreditCardIcon className='h-5 w-5 text-blue-600' />
              <span className='font-medium text-gray-900'>Direct Transfers</span>
            </div>
            <p className='text-sm text-gray-600 mb-2'>For transactions below ₹5 Lakh</p>
            <div className='text-lg font-bold text-blue-600'>₹4,99,999</div>
            <div className='text-xs text-gray-500'>Instant wallet-to-wallet</div>
          </div>

          <div className='bg-white p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <ShieldCheckIcon className='h-5 w-5 text-green-600' />
              <span className='font-medium text-gray-900'>Escrow Transactions</span>
            </div>
            <p className='text-sm text-gray-600 mb-2'>For transactions ₹5 Lakh and above</p>
            <div className='text-lg font-bold text-green-600'>Unlimited</div>
            <div className='text-xs text-gray-500'>Milestone-based security</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>Primary Bank Account</h3>
          <div className='flex items-center gap-2'>
            <CheckCircleIcon className='h-5 w-5 text-green-500' />
            <span className='text-sm text-green-600 font-medium'>Verified</span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Bank Name</label>
              <p className='text-gray-900 font-medium'>{bankAccount.bankName}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>Account Number</label>
              <p className='text-gray-900 font-medium'>{bankAccount.accountNumber}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>IFSC Code</label>
              <p className='text-gray-900 font-medium'>{bankAccount.ifscCode}</p>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Account Holder</label>
              <p className='text-gray-900 font-medium'>{bankAccount.accountHolderName}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>GST Linked</label>
              <div className='flex items-center gap-2'>
                <CheckCircleIcon className='h-4 w-4 text-green-500' />
                <span className='text-green-600 font-medium'>Yes</span>
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>Primary Account</label>
              <div className='flex items-center gap-2'>
                <CheckCircleIcon className='h-4 w-4 text-blue-500' />
                <span className='text-blue-600 font-medium'>Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Verification Features */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
        <h4 className='font-semibold text-green-900 mb-4'>Verification Features</h4>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>Real-time account validation via Razorpay</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>
              IFSC code verification and bank details fetch
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>Account holder name matching with GST</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>Penny drop verification completed</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGSTDetails = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900'>GST Registration Details</h3>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <span className='text-sm text-green-600 font-medium'>Active</span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>GST Number</label>
              <p className='text-gray-900 font-medium'>{companyDetails.gstNumber}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>Company Name</label>
              <p className='text-gray-900 font-medium'>{companyDetails.companyName}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>PAN Number</label>
              <p className='text-gray-900 font-medium'>{companyDetails.panNumber}</p>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Registered Address</label>
              <p className='text-gray-900 font-medium'>{companyDetails.address}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>Director Name</label>
              <p className='text-gray-900 font-medium'>{companyDetails.directorName}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>GST Status</label>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                {companyDetails.gstStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GST Compliance Features */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h4 className='font-semibold text-blue-900 mb-4'>GST-Banking Integration</h4>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-blue-600' />
            <span className='text-sm text-gray-700'>GST number real-time validation completed</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-blue-600' />
            <span className='text-sm text-gray-700'>
              Bank account holder name matches GST registration
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-blue-600' />
            <span className='text-sm text-gray-700'>Company address verified across documents</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-blue-600' />
            <span className='text-sm text-gray-700'>Director identity verification complete</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWalletDetails = () => (
    <div className='space-y-6'>
      <div className='bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold mb-2'>RazorpayX Wallet</h3>
            <p className='text-purple-100'>Integrated wallet for seamless transactions</p>
          </div>
          <CreditCardIcon className='h-12 w-12 text-white/80' />
        </div>
        <div className='mt-4'>
          <div className='text-3xl font-bold'>₹{walletInfo.balance.toLocaleString()}</div>
          <div className='text-sm text-purple-100'>Available Balance</div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h4 className='font-semibold text-gray-900 mb-4'>Wallet Information</h4>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Wallet ID</span>
              <span className='text-sm font-medium text-gray-900'>{walletInfo.walletId}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Linked Bank</span>
              <span className='text-sm font-medium text-gray-900'>
                {walletInfo.linkedBankAccount}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Monthly Limit</span>
              <span className='text-sm font-medium text-gray-900'>
                ₹{walletInfo.monthlyLimit.toLocaleString()}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Used This Month</span>
              <span className='text-sm font-medium text-gray-900'>
                ₹{walletInfo.usedLimit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h4 className='font-semibold text-gray-900 mb-4'>Transaction Capabilities</h4>
          <div className='space-y-4'>
            <div className='p-3 bg-blue-50 rounded-lg'>
              <div className='flex items-center gap-2 mb-1'>
                <BanknotesIcon className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-medium text-blue-900'>Direct Transfers</span>
              </div>
              <p className='text-xs text-blue-700'>Instant transfers below ₹5 Lakh</p>
            </div>
            <div className='p-3 bg-green-50 rounded-lg'>
              <div className='flex items-center gap-2 mb-1'>
                <ShieldCheckIcon className='h-4 w-4 text-green-600' />
                <span className='text-sm font-medium text-green-900'>Escrow Funding</span>
              </div>
              <p className='text-xs text-green-700'>Secure funding for high-value transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className='bg-gray-50 rounded-lg p-6'>
        <h4 className='font-semibold text-gray-900 mb-4'>Monthly Usage</h4>
        <div className='mb-2 flex justify-between text-sm'>
          <span className='text-gray-600'>Used: ₹{walletInfo.usedLimit.toLocaleString()}</span>
          <span className='text-gray-600'>Limit: ₹{walletInfo.monthlyLimit.toLocaleString()}</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-blue-600 h-2 rounded-full'
            style={{ width: `${(walletInfo.usedLimit / walletInfo.monthlyLimit) * 100}%` }}
          ></div>
        </div>
        <p className='text-xs text-gray-500 mt-2'>
          {Math.round((1 - walletInfo.usedLimit / walletInfo.monthlyLimit) * 100)}% remaining this
          month
        </p>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className='space-y-6'>
      <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-green-900'>Compliance Status</h3>
          <div className='text-2xl font-bold text-green-600'>95%</div>
        </div>
        <p className='text-sm text-green-700 mb-4'>
          Excellent compliance standing with all regulatory requirements met.
        </p>
        <div className='w-full bg-green-200 rounded-full h-3'>
          <div className='bg-green-600 h-3 rounded-full' style={{ width: '95%' }}></div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h4 className='font-semibold text-gray-900 mb-4'>Verification Checklist</h4>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <CheckCircleIcon className='h-5 w-5 text-green-600' />
              <span className='text-sm text-gray-700'>Bank Account Verified</span>
            </div>
            <div className='flex items-center gap-3'>
              <CheckCircleIcon className='h-5 w-5 text-green-600' />
              <span className='text-sm text-gray-700'>GST Registration Active</span>
            </div>
            <div className='flex items-center gap-3'>
              <CheckCircleIcon className='h-5 w-5 text-green-600' />
              <span className='text-sm text-gray-700'>PAN Verification Complete</span>
            </div>
            <div className='flex items-center gap-3'>
              <CheckCircleIcon className='h-5 w-5 text-green-600' />
              <span className='text-sm text-gray-700'>Director KYC Verified</span>
            </div>
            <div className='flex items-center gap-3'>
              <ClockIcon className='h-5 w-5 text-yellow-600' />
              <span className='text-sm text-gray-700'>Annual Compliance Review Due</span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h4 className='font-semibold text-gray-900 mb-4'>Risk Assessment</h4>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Financial Risk</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Low
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Compliance Risk</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Low
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Transaction Risk</span>
              <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                Medium
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-600'>Overall Rating</span>
              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                Excellent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
        <h4 className='font-semibold text-yellow-900 mb-4'>Action Items</h4>
        <div className='space-y-2'>
          <div className='flex items-center gap-3'>
            <ClockIcon className='h-4 w-4 text-yellow-600' />
            <span className='text-sm text-yellow-800'>
              Schedule annual compliance review by March 2025
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <DocumentTextIcon className='h-4 w-4 text-yellow-600' />
            <span className='text-sm text-yellow-800'>Update company address if changed</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Integrated Banking System</h2>
            <p className='text-gray-600'>
              Complete banking integration with GST verification and escrow capabilities
            </p>
          </div>
          <button
            onClick={handleRefreshData}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
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
                    ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'bank' && renderBankDetails()}
          {activeTab === 'gst' && renderGSTDetails()}
          {activeTab === 'wallet' && renderWalletDetails()}
          {activeTab === 'compliance' && renderCompliance()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IntegratedBankingSystem;
