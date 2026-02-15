import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface DirectTransferProps {
  amount: number; // Must be < 500000
  buyerWallet: string;
  supplierWallet: string;
  gstAmount?: number;
  invoiceId?: string;
  onTransferComplete?: (result: TransferResult) => void;
}

interface TransferResult {
  transferId: string;
  amount: number;
  fees: TransferFees;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
}

interface TransferFees {
  transactionFee: number;
  gstAmount: number;
  totalFees: number;
  netAmount: number;
}

interface WalletBalance {
  available: number;
  pending: number;
  total: number;
}

const DirectTransferSystem: React.FC<DirectTransferProps> = ({
  amount,
  buyerWallet,
  supplierWallet,
  gstAmount = 0,
  invoiceId,
  onTransferComplete,
}) => {
  const [step, setStep] = useState<'validation' | 'confirmation' | 'processing' | 'complete'>(
    'validation'
  );
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    available: 0,
    pending: 0,
    total: 0,
  });
  const [transferFees, setTransferFees] = useState<TransferFees>({
    transactionFee: 0,
    gstAmount: 0,
    totalFees: 0,
    netAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);

  const MAX_DIRECT_TRANSFER = 500000; // ₹5 Lakh limit

  useEffect(() => {
    if (amount > 0) {
      validateTransaction();
      calculateFees();
    }
  }, [amount]);

  useEffect(() => {
    loadWalletBalance();
  }, [buyerWallet]);

  const loadWalletBalance = async () => {
    try {
      // Simulate wallet balance fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletBalance({
        available: 750000,
        pending: 25000,
        total: 775000,
      });
    } catch (err) {
      setError('Failed to load wallet balance');
    }
  };

  const validateTransaction = () => {
    setError(null);

    if (amount >= MAX_DIRECT_TRANSFER) {
      setError(
        `Amount ₹${amount.toLocaleString()} exceeds direct transfer limit. Use escrow for transactions ≥₹5 Lakh.`
      );
      return false;
    }

    if (amount <= 0) {
      setError('Invalid transaction amount');
      return false;
    }

    return true;
  };

  const calculateFees = () => {
    const transactionFeeRate = 0.025; // 2.5%
    const gstRate = 0.18; // 18%

    const transactionFee = amount * transactionFeeRate;
    const calculatedGstAmount = gstAmount || transactionFee * gstRate;
    const totalFees = transactionFee + calculatedGstAmount;
    const netAmount = amount - totalFees;

    setTransferFees({
      transactionFee,
      gstAmount: calculatedGstAmount,
      totalFees,
      netAmount,
    });
  };

  const handleValidationComplete = () => {
    if (!validateTransaction()) return;

    if (walletBalance.available < amount + transferFees.totalFees) {
      setError(
        `Insufficient wallet balance. Required: ₹${(
          amount + transferFees.totalFees
        ).toLocaleString()}, Available: ₹${walletBalance.available.toLocaleString()}`
      );
      return;
    }

    setStep('confirmation');
  };

  const processTransfer = async () => {
    setLoading(true);
    setStep('processing');

    try {
      // Simulate transfer processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result: TransferResult = {
        transferId: `TXN_${Date.now()}`,
        amount,
        fees: transferFees,
        status: 'success',
        timestamp: new Date(),
      };

      setTransferResult(result);
      setStep('complete');

      if (onTransferComplete) {
        onTransferComplete(result);
      }
    } catch (err) {
      setError('Transfer failed. Please try again.');
      setStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  const renderValidation = () => (
    <div className='space-y-6'>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <BanknotesIcon className='h-8 w-8 text-blue-600' />
          <div>
            <h3 className='text-lg font-semibold text-blue-900'>Direct Transfer Validation</h3>
            <p className='text-sm text-blue-700'>
              Instant wallet-to-wallet transfer for amounts below ₹5 Lakh
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded-lg'>
            <h4 className='font-medium text-gray-900 mb-3'>Transaction Details</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Amount:</span>
                <span className='font-medium'>₹{amount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Transfer Type:</span>
                <span className='font-medium text-blue-600'>Direct Transfer</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Processing Time:</span>
                <span className='font-medium text-green-600'>5-15 minutes</span>
              </div>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg'>
            <h4 className='font-medium text-gray-900 mb-3'>Wallet Balance</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Available:</span>
                <span className='font-medium text-green-600'>
                  ₹{walletBalance.available.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Pending:</span>
                <span className='font-medium text-yellow-600'>
                  ₹{walletBalance.pending.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Total:</span>
                <span className='font-medium'>₹{walletBalance.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Transaction Validation Checklist */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h4 className='font-semibold text-gray-900 mb-4'>Pre-Transaction Validation</h4>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>Buyer wallet balance verified</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>GST calculations confirmed</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>Supplier bank account validated</span>
          </div>
          <div className='flex items-center gap-3'>
            <CheckCircleIcon className='h-5 w-5 text-green-600' />
            <span className='text-sm text-gray-700'>Compliance status checked</span>
          </div>
        </div>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center gap-2 text-red-700'>
            <ExclamationTriangleIcon className='h-5 w-5' />
            <span className='font-medium'>{error}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleValidationComplete}
        disabled={!!error}
        className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        Proceed to Confirmation
      </button>
    </div>
  );

  const renderConfirmation = () => (
    <div className='space-y-6'>
      <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-green-900 mb-4'>Transfer Confirmation</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>From Wallet</label>
              <p className='text-gray-900 font-medium'>{buyerWallet}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>To Wallet</label>
              <p className='text-gray-900 font-medium'>{supplierWallet}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>Transfer Amount</label>
              <p className='text-xl font-bold text-green-600'>₹{amount.toLocaleString()}</p>
            </div>
          </div>

          <div className='bg-white p-4 rounded-lg'>
            <h4 className='font-medium text-gray-900 mb-3'>Fee Breakdown</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Transaction Fee (2.5%):</span>
                <span className='font-medium'>₹{transferFees.transactionFee.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>GST (18%):</span>
                <span className='font-medium'>₹{transferFees.gstAmount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between border-t pt-2 font-medium'>
                <span>Total Fees:</span>
                <span>₹{transferFees.totalFees.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-green-600 font-bold'>
                <span>Supplier Receives:</span>
                <span>₹{transferFees.netAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex gap-4'>
        <button
          onClick={() => setStep('validation')}
          className='flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300'
        >
          Back to Validation
        </button>
        <button
          onClick={processTransfer}
          disabled={loading}
          className='flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50'
        >
          {loading ? 'Processing...' : 'Confirm Transfer'}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className='text-center space-y-6'>
      <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
        <ClockIcon className='h-8 w-8 text-blue-600 animate-pulse' />
      </div>
      <div>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>Processing Transfer</h3>
        <p className='text-gray-600'>
          Your direct transfer is being processed. This usually takes 5-15 minutes.
        </p>
      </div>

      <div className='bg-blue-50 rounded-lg p-6'>
        <h4 className='font-medium text-blue-900 mb-3'>Processing Steps</h4>
        <div className='space-y-2 text-sm text-blue-800'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
            <span>Validating wallet balances</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
            <span>Processing instant transfer</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
            <span>Generating compliant invoice</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
            <span>Sending confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className='text-center space-y-6'>
      <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
        <CheckCircleIcon className='h-10 w-10 text-green-600' />
      </div>

      <div>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>Transfer Complete!</h3>
        <p className='text-gray-600'>Your direct transfer has been successfully processed</p>
      </div>

      {transferResult && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h4 className='font-semibold text-gray-900 mb-4'>Transfer Details</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Transfer ID:</span>
                <span className='font-medium'>{transferResult.transferId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Amount:</span>
                <span className='font-medium'>₹{transferResult.amount.toLocaleString()}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Status:</span>
                <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                  {transferResult.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Total Fees:</span>
                <span className='font-medium'>
                  ₹{transferResult.fees.totalFees.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Net Amount:</span>
                <span className='font-medium text-green-600'>
                  ₹{transferResult.fees.netAmount.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Timestamp:</span>
                <span className='font-medium'>{transferResult.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Transaction Features */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h4 className='font-semibold text-blue-900 mb-4'>What's Next?</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-blue-800'>
              <DocumentTextIcon className='h-4 w-4' />
              <span>GST reporting automated</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-blue-800'>
              <CreditCardIcon className='h-4 w-4' />
              <span>Invoice discounting available</span>
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm text-blue-800'>
              <ArrowRightIcon className='h-4 w-4' />
              <span>Repeat order suggestions</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-blue-800'>
              <CheckCircleIcon className='h-4 w-4' />
              <span>Feedback and rating prompts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Direct Transfer System</h2>
        <p className='text-gray-600'>
          Fast and secure wallet-to-wallet transfers for amounts below ₹5 Lakh
        </p>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'validation' && renderValidation()}
          {step === 'confirmation' && renderConfirmation()}
          {step === 'processing' && renderProcessing()}
          {step === 'complete' && renderComplete()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DirectTransferSystem;
