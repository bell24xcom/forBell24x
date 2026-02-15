'use client';
import React, { useState } from 'react';
import { EscrowMilestone } from '@/types/escrow';

interface EscrowCreationStep {
  id: number;
  title: string;
  description: string;
}

interface MilestoneForm {
  description: string;
  amount: number;
  requiredConfirmations: number;
}

const EscrowCreationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [orderDetails, setOrderDetails] = useState({
    orderId: '',
    buyerAddress: '',
    sellerAddress: '',
    totalAmount: 0,
    currency: 'INR',
    expiryDays: 30,
    description: '',
  });

  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { description: '', amount: 0, requiredConfirmations: 2 },
  ]);

  const steps: EscrowCreationStep[] = [
    { id: 1, title: 'Order Details', description: 'Basic transaction information' },
    { id: 2, title: 'Milestones', description: 'Payment milestones and conditions' },
    { id: 3, title: 'Review', description: 'Confirm escrow details' },
    { id: 4, title: 'Deploy', description: 'Create smart contract' },
  ];

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', amount: 0, requiredConfirmations: 2 }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: keyof MilestoneForm, value: string | number) => {
    const updated = milestones.map((milestone, i) =>
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setMilestones(updated);
  };

  const handleCreateEscrow = async () => {
    setLoading(true);
    // Simulate escrow creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setLoading(false);
    alert('Escrow created successfully!');
  };

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const platformFee = orderDetails.totalAmount * 0.015;

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Smart Contract Escrow</h1>
          <p className='text-slate-600'>
            Secure your B2B transaction with blockchain-powered escrow
          </p>
        </div>

        {/* Progress Steps */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <span>✅</span>
                  ) : (
                    <span className='text-sm font-medium'>{step.id}</span>
                  )}
                </div>
                <div className='ml-3'>
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className='text-xs text-slate-500'>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border p-8'>
          {/* Step 1: Order Details */}
          {currentStep === 1 && (
            <div className='space-y-6'>
              <div>
                <h2 className='text-xl font-semibold text-slate-900 mb-4'>Order Details</h2>
                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Order ID
                    </label>
                    <input
                      type='text'
                      value={orderDetails.orderId}
                      onChange={e => setOrderDetails({ ...orderDetails, orderId: e.target.value })}
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='order_electronics_001'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Total Amount (₹)
                    </label>
                    <input
                      type='number'
                      value={orderDetails.totalAmount}
                      onChange={e =>
                        setOrderDetails({ ...orderDetails, totalAmount: Number(e.target.value) })
                      }
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='2500000'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Buyer Wallet Address
                    </label>
                    <input
                      type='text'
                      value={orderDetails.buyerAddress}
                      onChange={e =>
                        setOrderDetails({ ...orderDetails, buyerAddress: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0x742d35cc6491c1a5b96c4e41e763d2a76346bf7a'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Seller Wallet Address
                    </label>
                    <input
                      type='text'
                      value={orderDetails.sellerAddress}
                      onChange={e =>
                        setOrderDetails({ ...orderDetails, sellerAddress: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0x8ba1f109551bd432803012645hac136c001'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Currency
                    </label>
                    <select
                      value={orderDetails.currency}
                      onChange={e => setOrderDetails({ ...orderDetails, currency: e.target.value })}
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='INR'>INR (Indian Rupee)</option>
                      <option value='USD'>USD (US Dollar)</option>
                      <option value='ETH'>ETH (Ethereum)</option>
                      <option value='USDC'>USDC (USD Coin)</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-slate-700 mb-2'>
                      Expiry (Days)
                    </label>
                    <input
                      type='number'
                      value={orderDetails.expiryDays}
                      onChange={e =>
                        setOrderDetails({ ...orderDetails, expiryDays: Number(e.target.value) })
                      }
                      className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='30'
                    />
                  </div>
                </div>
                <div className='mt-6'>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    Description
                  </label>
                  <textarea
                    value={orderDetails.description}
                    onChange={e =>
                      setOrderDetails({ ...orderDetails, description: e.target.value })
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Describe the transaction, products, or services...'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Milestones */}
          {currentStep === 2 && (
            <div className='space-y-6'>
              <div>
                <h2 className='text-xl font-semibold text-slate-900 mb-4'>Payment Milestones</h2>
                <p className='text-slate-600 mb-6'>
                  Define payment milestones and delivery conditions. Each milestone requires
                  confirmation before funds are released.
                </p>

                <div className='space-y-4'>
                  {milestones.map((milestone, index) => (
                    <div key={index} className='border border-slate-200 rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-medium text-slate-900'>
                          Milestone {index + 1}
                        </h3>
                        {milestones.length > 1 && (
                          <button
                            onClick={() => removeMilestone(index)}
                            className='p-1 text-red-600 hover:bg-red-50 rounded'
                          >
                            <span>🗑️</span>
                          </button>
                        )}
                      </div>

                      <div className='grid md:grid-cols-3 gap-4'>
                        <div className='md:col-span-2'>
                          <label className='block text-sm font-medium text-slate-700 mb-2'>
                            Description
                          </label>
                          <input
                            type='text'
                            value={milestone.description}
                            onChange={e => updateMilestone(index, 'description', e.target.value)}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='e.g., Product manufacturing and quality testing'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-slate-700 mb-2'>
                            Amount (₹)
                          </label>
                          <input
                            type='number'
                            value={milestone.amount}
                            onChange={e => updateMilestone(index, 'amount', Number(e.target.value))}
                            className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='1250000'
                          />
                        </div>
                      </div>

                      <div className='mt-4'>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>
                          Required Confirmations
                        </label>
                        <select
                          value={milestone.requiredConfirmations}
                          onChange={e =>
                            updateMilestone(index, 'requiredConfirmations', Number(e.target.value))
                          }
                          className='w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                          <option value={1}>1 (Seller only)</option>
                          <option value={2}>2 (Buyer + Seller)</option>
                          <option value={3}>3 (+ Third party)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMilestone}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <span>➕</span>
                  Add Milestone
                </button>

                {totalMilestoneAmount !== orderDetails.totalAmount &&
                  orderDetails.totalAmount > 0 && (
                    <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                      <div className='flex items-center'>
                        <AlertTriangle className='text-amber-600 mr-2' size={20} />
                        <p className='text-amber-800'>
                          Milestone total (₹{totalMilestoneAmount.toLocaleString()}) doesn't match
                          order amount (₹{orderDetails.totalAmount.toLocaleString()})
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className='space-y-6'>
              <div>
                <h2 className='text-xl font-semibold text-slate-900 mb-4'>Review Escrow Details</h2>

                <div className='grid md:grid-cols-2 gap-8'>
                  <div>
                    <h3 className='font-medium text-slate-900 mb-3'>Order Information</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Order ID:</span>
                        <span className='font-medium'>{orderDetails.orderId}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Total Amount:</span>
                        <span className='font-medium'>
                          ₹{orderDetails.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Currency:</span>
                        <span className='font-medium'>{orderDetails.currency}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Expires In:</span>
                        <span className='font-medium'>{orderDetails.expiryDays} days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className='font-medium text-slate-900 mb-3'>Fees & Costs</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Platform Fee (1.5%):</span>
                        <span className='font-medium'>₹{platformFee.toLocaleString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-slate-600'>Blockchain Fee:</span>
                        <span className='font-medium'>₹100</span>
                      </div>
                      <div className='flex justify-between border-t pt-2'>
                        <span className='text-slate-900 font-medium'>Total Fees:</span>
                        <span className='font-bold'>₹{(platformFee + 100).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-6'>
                  <h3 className='font-medium text-slate-900 mb-3'>
                    Milestones ({milestones.length})
                  </h3>
                  <div className='space-y-3'>
                    {milestones.map((milestone, index) => (
                      <div key={index} className='border border-slate-200 rounded-lg p-3'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <p className='font-medium text-slate-900'>Milestone {index + 1}</p>
                            <p className='text-sm text-slate-600'>{milestone.description}</p>
                          </div>
                          <div className='text-right'>
                            <p className='font-medium text-slate-900'>
                              ₹{milestone.amount.toLocaleString()}
                            </p>
                            <p className='text-xs text-slate-500'>
                              {milestone.requiredConfirmations} confirmations
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Deploy */}
          {currentStep === 4 && (
            <div className='text-center space-y-6'>
              {loading ? (
                <div>
                  <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
                  <h2 className='text-xl font-semibold text-slate-900 mb-2'>
                    Deploying Smart Contract
                  </h2>
                  <p className='text-slate-600'>
                    Creating your secure escrow transaction on the blockchain...
                  </p>
                </div>
              ) : (
                <div>
                  <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span>✅</span>
                  </div>
                  <h2 className='text-xl font-semibold text-slate-900 mb-2'>
                    Escrow Created Successfully!
                  </h2>
                  <p className='text-slate-600 mb-6'>
                    Your smart contract escrow has been deployed to the blockchain.
                  </p>

                  <div className='bg-slate-50 rounded-lg p-4 mb-6'>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-slate-600'>Escrow Contract:</span>
                        <p className='font-mono text-blue-600'>0x9876543210abcdef...</p>
                      </div>
                      <div>
                        <span className='text-slate-600'>Transaction Hash:</span>
                        <p className='font-mono text-blue-600'>0xabcdef1234567890...</p>
                      </div>
                    </div>
                  </div>

                  <div className='flex space-x-4 justify-center'>
                    <button className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                      View Escrow
                    </button>
                    <button className='px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors'>
                      Create Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {currentStep < 4 && (
            <div className='flex justify-between mt-8 pt-6 border-t border-slate-200'>
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className='flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <span>←</span>
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className='flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Next
                  <span>→</span>
                </button>
              ) : (
                <button
                  onClick={handleCreateEscrow}
                  disabled={loading}
                  className='flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                >
                  <span>🔒</span>
                  Create Escrow
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscrowCreationWizard;
