'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { TransactionRequest, TransactionResponse, TransactionFlow } from '../types/financial';

interface SmartTransactionRouterProps {
  fromUserId: string;
  toUserId: string;
  orderId?: string;
  rfqId?: string;
  onTransactionComplete?: (result: TransactionResponse) => void;
}

interface TransactionPreview {
  amount: number;
  currency: string;
  flowType: 'direct_transfer' | 'escrow_creation';
  routingReason: string;
  fees: {
    transactionFee: number;
    escrowFee?: number;
    gstAmount: number;
    totalFees: number;
  };
  timeline: {
    processing: string;
    completion: string;
  };
}

export const SmartTransactionRouter: React.FC<SmartTransactionRouterProps> = ({
  fromUserId = 'user123',
  toUserId = 'supplier456',
  orderId,
  rfqId,
  onTransactionComplete,
}) => {
  const [step, setStep] = useState<'amount' | 'preview' | 'milestones' | 'processing' | 'complete'>(
    'amount'
  );
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [useEscrowOverride, setUseEscrowOverride] = useState<boolean>(false);
  const [preview, setPreview] = useState<TransactionPreview | null>(null);
  const [milestones, setMilestones] = useState<
    Array<{
      title: string;
      description: string;
      percentage: number;
      expectedDate: string;
      deliverables: string[];
    }>
  >([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<TransactionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ESCROW_THRESHOLD = 500000; // ₹5 Lakh

  // Calculate transaction preview
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      calculatePreview();
    }
  }, [amount, useEscrowOverride]);

  const calculatePreview = () => {
    const transactionAmount = parseFloat(amount);
    const shouldUseEscrow = transactionAmount >= ESCROW_THRESHOLD || useEscrowOverride;

    // Calculate fees
    const transactionFeeRate = 0.025; // 2.5%
    const escrowFeeRate = 0.015; // 1.5%
    const gstRate = 0.18; // 18%

    const transactionFee = transactionAmount * transactionFeeRate;
    const escrowFee = shouldUseEscrow ? transactionAmount * escrowFeeRate : 0;
    const subtotalFees = transactionFee + escrowFee;
    const gstAmount = subtotalFees * gstRate;
    const totalFees = subtotalFees + gstAmount;

    // Determine routing reason
    let routingReason = '';
    if (transactionAmount >= ESCROW_THRESHOLD && !useEscrowOverride) {
      routingReason = 'Amount exceeds ₹5 lakh threshold - Escrow mandatory for security';
    } else if (useEscrowOverride) {
      routingReason = 'User selected escrow for additional security';
    } else {
      routingReason = 'Amount below ₹5 lakh threshold - Direct transfer for speed';
    }

    // Timeline estimation
    const timeline = shouldUseEscrow
      ? { processing: '2-4 hours', completion: '1-7 days (milestone-based)' }
      : { processing: '5-15 minutes', completion: 'Instant' };

    setPreview({
      amount: transactionAmount,
      currency: 'INR',
      flowType: shouldUseEscrow ? 'escrow_creation' : 'direct_transfer',
      routingReason,
      fees: {
        transactionFee,
        escrowFee: shouldUseEscrow ? escrowFee : undefined,
        gstAmount,
        totalFees,
      },
      timeline,
    });
  };

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 1000) {
      setError('Minimum transaction amount is ₹1,000');
      return;
    }

    setError(null);

    if (preview?.flowType === 'escrow_creation') {
      // For escrow transactions, go to milestones setup
      setStep('milestones');
      initializeMilestones();
    } else {
      // For direct transfers, go straight to preview
      setStep('preview');
    }
  };

  const initializeMilestones = () => {
    // Default milestone structure for escrow
    setMilestones([
      {
        title: 'Order Confirmation',
        description: 'Supplier confirms order and provides delivery timeline',
        percentage: 20,
        expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliverables: ['Order confirmation document', 'Delivery schedule'],
      },
      {
        title: 'Production/Preparation',
        description: 'Goods are manufactured or prepared for shipment',
        percentage: 30,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliverables: ['Production updates', 'Quality certificates'],
      },
      {
        title: 'Shipment & Delivery',
        description: 'Goods are shipped and delivered to buyer',
        percentage: 40,
        expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliverables: ['Shipping documents', 'Delivery confirmation'],
      },
      {
        title: 'Final Acceptance',
        description: 'Buyer inspects and accepts the delivered goods',
        percentage: 10,
        expectedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliverables: ['Acceptance certificate', 'Final inspection report'],
      },
    ]);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        percentage: 0,
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliverables: [''],
      },
    ]);
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    if (field === 'deliverables') {
      updated[index][field] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const validateMilestones = () => {
    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercentage !== 100) {
      setError(`Milestone percentages must total 100% (currently ${totalPercentage}%)`);
      return false;
    }

    for (const milestone of milestones) {
      if (!milestone.title || !milestone.description || milestone.percentage <= 0) {
        setError('All milestones must have title, description, and percentage');
        return false;
      }
    }

    return true;
  };

  const handleMilestonesSubmit = () => {
    if (!validateMilestones()) return;
    setError(null);
    setStep('preview');
  };

  const processTransaction = async () => {
    if (!preview) return;

    setProcessing(true);
    setError(null);
    setStep('processing');

    try {
      const transactionRequest: TransactionRequest = {
        amount: preview.amount,
        currency: preview.currency,
        fromUserId,
        toUserId,
        description,
        orderId,
        useEscrow: preview.flowType === 'escrow_creation',
        milestones:
          preview.flowType === 'escrow_creation'
            ? milestones.map(m => ({
                sequence: milestones.indexOf(m) + 1,
                title: m.title,
                description: m.description,
                amount: (preview.amount * m.percentage) / 100,
                percentage: m.percentage,
                expectedDate: new Date(m.expectedDate),
                deliverables: m.deliverables,
                status: 'pending' as const,
              }))
            : undefined,
      };

      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionRequest),
      });

      const result: TransactionResponse = await response.json();

      if (result.success) {
        setResult(result);
        setStep('complete');
        if (onTransactionComplete) {
          onTransactionComplete(result);
        }
      } else {
        setError(result.message || 'Transaction failed');
        setStep('preview');
      }
    } catch (err) {
      setError('Transaction processing failed. Please try again.');
      setStep('preview');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const resetTransaction = () => {
    setStep('amount');
    setAmount('');
    setDescription('');
    setUseEscrowOverride(false);
    setPreview(null);
    setMilestones([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Header with Smart Routing Explanation */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Smart Transaction Router</h2>
        <p className='text-gray-600 mb-4'>
          Automatically routes transactions based on amount: Direct transfer (&lt;₹5L) or Escrow
          (≥₹5L)
        </p>

        {/* Routing Logic Display */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <BanknotesIcon className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <h4 className='font-medium text-blue-900'>Direct Transfer</h4>
                <p className='text-sm text-blue-700'>Below ₹5,00,000 - Instant wallet transfer</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <ShieldCheckIcon className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <h4 className='font-medium text-green-900'>Escrow Transaction</h4>
                <p className='text-sm text-green-700'>₹5,00,000+ - Milestone-based security</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className='mb-8'>
        <div className='flex items-center justify-center space-x-4'>
          {[
            { id: 'amount', name: 'Amount', icon: BanknotesIcon },
            { id: 'milestones', name: 'Milestones', icon: DocumentTextIcon },
            { id: 'preview', name: 'Preview', icon: ScaleIcon },
            { id: 'processing', name: 'Processing', icon: ClockIcon },
            { id: 'complete', name: 'Complete', icon: CheckCircleIcon },
          ].map((stepItem, index) => {
            const isActive = step === stepItem.id;
            const isCompleted =
              ['amount', 'milestones', 'preview', 'processing'].indexOf(stepItem.id) <
              ['amount', 'milestones', 'preview', 'processing', 'complete'].indexOf(step);
            const isVisible =
              stepItem.id !== 'milestones' || preview?.flowType === 'escrow_creation';

            if (!isVisible) return null;

            return (
              <div key={stepItem.id} className='flex items-center'>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  <stepItem.icon className='h-5 w-5' />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                  }`}
                >
                  {stepItem.name}
                </span>
                {index < 4 && <ArrowRightIcon className='h-4 w-4 text-slate-300 mx-4' />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3'
          >
            <ExclamationTriangleIcon className='h-5 w-5 text-red-500 flex-shrink-0' />
            <p className='text-red-700'>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Amount Input Step */}
          {step === 'amount' && (
            <div className='bg-white rounded-xl shadow-sm p-8 border'>
              <h2 className='text-xl font-semibold text-slate-900 mb-6'>Transaction Amount</h2>

              {error && (
                <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className='flex items-center gap-2 text-red-700'>
                    <ExclamationTriangleIcon className='h-5 w-5' />
                    <span className='text-sm font-medium'>{error}</span>
                  </div>
                </div>
              )}

              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Enter Transaction Amount (₹)
                  </label>
                  <input
                    type='number'
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
                    placeholder='Enter amount in rupees'
                    min='1000'
                  />
                  <p className='mt-2 text-sm text-slate-500'>Minimum transaction amount: ₹1,000</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Transaction Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    rows={3}
                    placeholder='Brief description of the transaction...'
                  />
                </div>

                {preview && (
                  <div className='bg-slate-50 rounded-lg p-6'>
                    <h3 className='font-medium text-slate-900 mb-4'>Smart Routing Decision</h3>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        {preview.flowType === 'escrow_creation' ? (
                          <ShieldCheckIcon className='h-5 w-5 text-green-600' />
                        ) : (
                          <BanknotesIcon className='h-5 w-5 text-blue-600' />
                        )}
                        <span className='font-medium'>
                          {preview.flowType === 'escrow_creation'
                            ? 'Escrow Transaction'
                            : 'Direct Transfer'}
                        </span>
                      </div>
                      <p className='text-sm text-slate-600'>{preview.routingReason}</p>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-slate-600'>Processing Time:</span>
                          <span className='ml-2 font-medium'>{preview.timeline.processing}</span>
                        </div>
                        <div>
                          <span className='text-slate-600'>Total Fees:</span>
                          <span className='ml-2 font-medium'>
                            ₹{preview.fees.totalFees.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='escrow-override'
                    checked={useEscrowOverride}
                    onChange={e => setUseEscrowOverride(e.target.checked)}
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded'
                  />
                  <label htmlFor='escrow-override' className='text-sm text-slate-700'>
                    Use escrow even for amounts below ₹5 lakh (additional security)
                  </label>
                </div>

                <button
                  onClick={handleAmountSubmit}
                  className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium'
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Milestones Setup Step */}
          {step === 'milestones' && (
            <div className='bg-white rounded-xl shadow-sm p-8 border'>
              <h2 className='text-xl font-semibold text-slate-900 mb-6'>Setup Escrow Milestones</h2>

              <div className='space-y-6'>
                {milestones.map((milestone, index) => (
                  <div key={index} className='border border-slate-200 rounded-lg p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='font-medium text-slate-900'>Milestone {index + 1}</h3>
                      {milestones.length > 1 && (
                        <button
                          onClick={() => removeMilestone(index)}
                          className='text-red-500 hover:text-red-700 text-sm'
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                          Title *
                        </label>
                        <input
                          type='text'
                          value={milestone.title}
                          onChange={e => updateMilestone(index, 'title', e.target.value)}
                          className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Milestone title'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                          Percentage *
                        </label>
                        <input
                          type='number'
                          value={milestone.percentage}
                          onChange={e =>
                            updateMilestone(index, 'percentage', parseInt(e.target.value) || 0)
                          }
                          className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='0'
                          min='1'
                          max='100'
                        />
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                          Description *
                        </label>
                        <textarea
                          value={milestone.description}
                          onChange={e => updateMilestone(index, 'description', e.target.value)}
                          className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          rows={2}
                          placeholder='Describe what needs to be completed'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                          Expected Date *
                        </label>
                        <input
                          type='date'
                          value={milestone.expectedDate}
                          onChange={e => updateMilestone(index, 'expectedDate', e.target.value)}
                          className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                          Amount
                        </label>
                        <div className='px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600'>
                          ₹
                          {preview
                            ? ((preview.amount * milestone.percentage) / 100).toLocaleString()
                            : '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className='flex justify-between items-center'>
                  <button
                    onClick={addMilestone}
                    className='text-blue-600 hover:text-blue-700 font-medium'
                  >
                    + Add Milestone
                  </button>

                  <div className='text-sm text-slate-600'>
                    Total: {milestones.reduce((sum, m) => sum + m.percentage, 0)}%
                  </div>
                </div>

                <div className='flex gap-4'>
                  <button
                    onClick={() => setStep('amount')}
                    className='flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-300 font-medium'
                  >
                    Back
                  </button>
                  <button
                    onClick={handleMilestonesSubmit}
                    className='flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium'
                  >
                    Continue to Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && preview && (
            <div className='bg-white rounded-xl shadow-sm p-8 border'>
              <h2 className='text-xl font-semibold text-slate-900 mb-6'>Transaction Preview</h2>

              <div className='space-y-6'>
                {/* Transaction Summary */}
                <div className='bg-slate-50 rounded-lg p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h3 className='font-medium text-slate-900 mb-4'>Transaction Details</h3>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Amount:</span>
                          <span className='font-medium'>₹{preview.amount.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Type:</span>
                          <span className='font-medium'>
                            {preview.flowType === 'escrow_creation'
                              ? 'Escrow Transaction'
                              : 'Direct Transfer'}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Processing:</span>
                          <span className='font-medium'>{preview.timeline.processing}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span>Completion:</span>
                          <span className='font-medium'>{preview.timeline.completion}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='font-medium text-slate-900 mb-4'>Fee Breakdown</h3>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span>Transaction Fee:</span>
                          <span>₹{preview.fees.transactionFee.toLocaleString()}</span>
                        </div>
                        {preview.fees.escrowFee && (
                          <div className='flex justify-between'>
                            <span>Escrow Fee:</span>
                            <span>₹{preview.fees.escrowFee.toLocaleString()}</span>
                          </div>
                        )}
                        <div className='flex justify-between'>
                          <span>GST:</span>
                          <span>₹{preview.fees.gstAmount.toLocaleString()}</span>
                        </div>
                        <div className='flex justify-between font-medium border-t pt-2'>
                          <span>Total Fees:</span>
                          <span>₹{preview.fees.totalFees.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones Preview (for escrow) */}
                {preview.flowType === 'escrow_creation' && milestones.length > 0 && (
                  <div className='bg-blue-50 rounded-lg p-6'>
                    <h3 className='font-medium text-slate-900 mb-4'>Escrow Milestones</h3>
                    <div className='space-y-3'>
                      {milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-3 bg-white rounded-lg'
                        >
                          <div>
                            <h4 className='font-medium text-slate-900'>{milestone.title}</h4>
                            <p className='text-sm text-slate-600'>{milestone.description}</p>
                          </div>
                          <div className='text-right'>
                            <div className='font-medium'>
                              ₹{((preview.amount * milestone.percentage) / 100).toLocaleString()}
                            </div>
                            <div className='text-sm text-slate-500'>{milestone.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Amount */}
                <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold'>Total Amount</h3>
                      <p className='text-blue-100'>Amount + Fees</p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold'>
                        ₹{(preview.amount + preview.fees.totalFees).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex gap-4'>
                  <button
                    onClick={() =>
                      setStep(preview.flowType === 'escrow_creation' ? 'milestones' : 'amount')
                    }
                    className='flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-300 font-medium'
                  >
                    Back
                  </button>
                  <button
                    onClick={processTransaction}
                    className='flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium'
                  >
                    Process Transaction
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className='bg-white rounded-xl shadow-sm p-8 border text-center'>
              <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6'></div>
              <h2 className='text-xl font-semibold text-slate-900 mb-4'>Processing Transaction</h2>
              <p className='text-slate-600 mb-6'>
                Please wait while we process your{' '}
                {preview?.flowType === 'escrow_creation' ? 'escrow' : 'direct transfer'}{' '}
                transaction...
              </p>
              <div className='bg-slate-50 rounded-lg p-4'>
                <p className='text-sm text-slate-600'>
                  This may take a few moments. Do not refresh or close this page.
                </p>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && result && (
            <div className='bg-white rounded-xl shadow-sm p-8 border text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <CheckCircleIcon className='h-10 w-10 text-green-600' />
              </div>

              <h2 className='text-xl font-semibold text-slate-900 mb-4'>Transaction Successful!</h2>

              <div className='bg-green-50 border border-green-200 rounded-lg p-6 mb-6'>
                <div className='text-left space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Transaction ID:</span>
                    <span className='font-medium text-slate-900'>{result.transactionId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Type:</span>
                    <span className='font-medium text-slate-900'>
                      {result.flowType === 'escrow_creation' ? 'Escrow Created' : 'Direct Transfer'}
                    </span>
                  </div>
                  {result.escrowId && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Escrow ID:</span>
                      <span className='font-medium text-slate-900'>{result.escrowId}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className='text-slate-600 mb-6'>{result.message}</p>

              {result.nextSteps && result.nextSteps.length > 0 && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                  <h3 className='font-medium text-slate-900 mb-2'>Next Steps:</h3>
                  <ul className='text-sm text-slate-600 text-left space-y-1'>
                    {result.nextSteps.map((step, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='text-blue-600 mt-1'>•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={resetTransaction}
                className='bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium'
              >
                Start New Transaction
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
