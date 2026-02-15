'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: string;
  hash: string;
  type: 'contract_creation' | 'payment' | 'delivery_confirmation' | 'quality_verification';
  timestamp: string;
  status: 'pending' | 'confirmed' | 'completed';
  participants: string[];
  amount?: string;
  description: string;
  blockNumber: number;
  gasUsed: string;
}

interface SmartContract {
  id: string;
  name: string;
  type: 'escrow' | 'quality_assurance' | 'delivery_tracking' | 'payment_terms';
  status: 'active' | 'completed' | 'pending';
  progress: number;
  conditions: string[];
  participants: string[];
  value: string;
  createdAt: string;
  estimatedCompletion: string;
}

interface SupplyChainStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  timestamp?: string;
  location?: string;
  verifiedBy: string;
  blockHash: string;
  documents: string[];
}

export default function BlockchainIntegration() {
  const [activeTab, setActiveTab] = useState('transparency');
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Simulate live blockchain transactions
  useEffect(() => {
    setHasMounted(true);
    const generateTransaction = (): Transaction => {
      const types: Transaction['type'][] = [
        'contract_creation',
        'payment',
        'delivery_confirmation',
        'quality_verification',
      ];
      const statuses: Transaction['status'][] = ['pending', 'confirmed', 'completed'];
      const randomType = types[Math.floor(Math.random() * types.length)];

      return {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: randomType,
        timestamp: new Date().toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        participants: ['Supplier A', 'Buyer B'],
        amount: randomType === 'payment' ? `₹${(Math.random() * 10 + 1).toFixed(2)}L` : undefined,
        description: getTransactionDescription(randomType),
        blockNumber: 18500000 + Math.floor(Math.random() * 1000),
        gasUsed: `${(Math.random() * 50000 + 21000).toFixed(0)}`,
      };
    };

    const getTransactionDescription = (type: Transaction['type']): string => {
      switch (type) {
        case 'contract_creation':
          return 'New escrow contract created for machinery procurement';
        case 'payment':
          return 'Payment released from escrow to supplier';
        case 'delivery_confirmation':
          return 'Delivery confirmed and recorded on blockchain';
        case 'quality_verification':
          return 'Quality inspection completed and verified';
        default:
          return 'Blockchain transaction processed';
      }
    };

    // Initial transactions
    setLiveTransactions(Array.from({ length: 5 }, generateTransaction));

    // Simulate new transactions every 8 seconds
    const interval = setInterval(() => {
      setLiveTransactions(prev => {
        const newTransaction = generateTransaction();
        return [newTransaction, ...prev.slice(0, 9)]; // Keep only last 10 transactions
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const smartContracts: SmartContract[] = [
    {
      id: 'contract_001',
      name: 'Industrial Equipment Escrow',
      type: 'escrow',
      status: 'active',
      progress: 75,
      conditions: [
        'Quality inspection passed ✓',
        'Delivery confirmation ✓',
        'Installation verification ✓',
        'Final approval pending',
      ],
      participants: ['TechCorp Industries', 'MachineSupply Ltd'],
      value: '₹45.2L',
      createdAt: '2025-01-15',
      estimatedCompletion: '2025-01-25',
    },
    {
      id: 'contract_002',
      name: 'Chemical Batch Quality Assurance',
      type: 'quality_assurance',
      status: 'completed',
      progress: 100,
      conditions: [
        'Lab testing completed ✓',
        'Certification verified ✓',
        'Batch documentation ✓',
        'Final approval received ✓',
      ],
      participants: ['ChemCorp Ltd', 'QualityLabs Inc'],
      value: '₹12.8L',
      createdAt: '2025-01-10',
      estimatedCompletion: '2025-01-20',
    },
    {
      id: 'contract_003',
      name: 'Multi-Modal Logistics Tracking',
      type: 'delivery_tracking',
      status: 'active',
      progress: 45,
      conditions: [
        'Pickup confirmed ✓',
        'Transit tracking active ✓',
        'Customs clearance pending',
        'Final delivery pending',
      ],
      participants: ['GlobalShip Logistics', 'ImportCorp'],
      value: '₹8.5L',
      createdAt: '2025-01-18',
      estimatedCompletion: '2025-01-28',
    },
  ];

  const supplyChainSteps: SupplyChainStep[] = [
    {
      id: 'step_001',
      title: 'Raw Material Sourcing',
      description: 'High-grade steel sourced from certified supplier',
      status: 'completed',
      timestamp: '2025-01-15T10:30:00Z',
      location: 'Mumbai, Maharashtra',
      verifiedBy: 'Quality Inspector #QI001',
      blockHash: '0xa1b2c3d4e5f6...',
      documents: ['Material Certificate', 'Quality Report', 'Supplier Verification'],
    },
    {
      id: 'step_002',
      title: 'Manufacturing Process',
      description: 'CNC machining and quality control completed',
      status: 'completed',
      timestamp: '2025-01-18T14:45:00Z',
      location: 'Pune, Maharashtra',
      verifiedBy: 'Manufacturing Lead #ML002',
      blockHash: '0xb2c3d4e5f6a1...',
      documents: ['Manufacturing Log', 'QC Checklist', 'Process Verification'],
    },
    {
      id: 'step_003',
      title: 'Quality Inspection',
      description: 'Third-party quality inspection and certification',
      status: 'in_progress',
      location: 'Pune, Maharashtra',
      verifiedBy: 'External QA Team #EQA003',
      blockHash: '0xc3d4e5f6a1b2...',
      documents: ['Inspection Report', 'Test Results'],
    },
    {
      id: 'step_004',
      title: 'Packaging & Shipping',
      description: 'Secure packaging and logistics preparation',
      status: 'pending',
      location: 'Pune, Maharashtra',
      verifiedBy: 'Logistics Team #LT004',
      blockHash: '',
      documents: [],
    },
    {
      id: 'step_005',
      title: 'Final Delivery',
      description: 'Delivery to customer location with verification',
      status: 'pending',
      location: 'Bangalore, Karnataka',
      verifiedBy: 'Delivery Team #DT005',
      blockHash: '',
      documents: [],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-100';
      case 'in_progress':
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'confirmed':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'contract_creation':
        return FileText;
      case 'payment':
        return TrendingUp;
      case 'delivery_confirmation':
        return Package;
      case 'quality_verification':
        return CheckCircle2;
      default:
        return Hash;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section className='bg-gradient-to-br from-indigo-50 to-purple-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full mb-4'>
            <span>🛡️</span>
            <span className='text-sm font-semibold text-indigo-700'>BLOCKCHAIN POWERED</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Transparent Supply Chain
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Immutable blockchain records ensure complete transparency, trust, and traceability
            across your entire supply chain.
          </p>

          {/* Demo Button */}
          <motion.button
            onClick={() => setShowDemo(true)}
            className='inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all group'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>▶️</span>
            Watch Blockchain Demo
          </motion.button>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='flex flex-wrap justify-center gap-3 mb-12'
        >
          {[
            { id: 'transparency', label: 'Supply Chain Transparency', icon: Eye },
            { id: 'transactions', label: 'Live Transactions', icon: Zap },
            { id: 'contracts', label: 'Smart Contracts', icon: FileText },
            { id: 'trust', label: 'Trust Metrics', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className='w-4 h-4' />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode='wait'>
          {activeTab === 'transparency' && (
            <motion.div
              key='transparency'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='space-y-8'
            >
              <div className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>Supply Chain Journey</h3>
                <div className='space-y-6'>
                  {supplyChainSteps.map((step, index) => (
                    <div key={step.id} className='relative'>
                      {index < supplyChainSteps.length - 1 && (
                        <div className='absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-indigo-300 to-purple-300'></div>
                      )}
                      <div className='flex items-start gap-6'>
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            step.status === 'completed'
                              ? 'bg-emerald-500'
                              : step.status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          {step.status === 'completed' ? (
                            <span>✅</span>
                          ) : step.status === 'in_progress' ? (
                            <span>🕐</span>
                          ) : (
                            <div className='w-3 h-3 bg-white rounded-full'></div>
                          )}
                        </div>
                        <div className='flex-1 bg-gray-50 rounded-2xl p-6'>
                          <div className='flex items-start justify-between mb-4'>
                            <div>
                              <h4 className='text-lg font-bold text-gray-900 mb-2'>{step.title}</h4>
                              <p className='text-gray-600 mb-3'>{step.description}</p>
                              <div className='flex items-center gap-4 text-sm text-gray-500'>
                                {step.location && (
                                  <div className='flex items-center gap-1'>
                                    <span>📍</span>
                                    {step.location}
                                  </div>
                                )}
                                {step.timestamp && (
                                  <div className='flex items-center gap-1'>
                                    <span>📅</span>
                                    {new Date(step.timestamp).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                step.status
                              )}`}
                            >
                              {step.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                          {step.blockHash && (
                            <div className='bg-white rounded-xl p-4 mb-4'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <p className='text-sm font-medium text-gray-700 mb-1'>
                                    Blockchain Hash
                                  </p>
                                  <p className='text-xs font-mono text-gray-500'>
                                    {step.blockHash}...
                                  </p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(step.blockHash)}
                                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                                >
                                  <span>📋</span>
                                </button>
                              </div>
                            </div>
                          )}

                          <div className='flex items-center justify-between'>
                            <div className='text-sm text-gray-600'>
                              Verified by: <span className='font-medium'>{step.verifiedBy}</span>
                            </div>
                            {step.documents.length > 0 && (
                              <div className='flex gap-2'>
                                {step.documents.map((doc, i) => (
                                  <span
                                    key={i}
                                    className='px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium'
                                  >
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key='transactions'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'
            >
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-2xl font-bold text-gray-900'>Live Transaction Feed</h3>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 bg-emerald-500 rounded-full animate-pulse'></div>
                  <span className='text-sm font-medium text-emerald-700'>Live Updates</span>
                </div>
              </div>

              <div className='space-y-4 max-h-96 overflow-y-auto'>
                {liveTransactions.map((transaction, index) => {
                  const Icon = getTransactionIcon(transaction.type);
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className='flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors'
                    >
                      <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
                        <Icon className='w-5 h-5 text-white' />
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-2'>
                          <h4 className='font-semibold text-gray-900'>{transaction.description}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status.toUpperCase()}
                          </span>
                        </div>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600'>
                          <div>
                            <span className='font-medium'>Hash:</span>
                            <p className='font-mono text-xs'>
                              {transaction.hash.substring(0, 16)}...
                            </p>
                          </div>
                          <div>
                            <span className='font-medium'>Block:</span>
                            <p>#{transaction.blockNumber}</p>
                          </div>
                          <div>
                            <span className='font-medium'>Gas Used:</span>
                            <p>{transaction.gasUsed}</p>
                          </div>
                          <div>
                            <span className='font-medium'>Time:</span>
                            <p>{new Date(transaction.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {transaction.amount && (
                          <div className='mt-2'>
                            <span className='text-lg font-bold text-emerald-600'>
                              {transaction.amount}
                            </span>
                          </div>
                        )}
                      </div>
                      <button className='p-2 hover:bg-gray-200 rounded-lg transition-colors'>
                        <span>🔗</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'contracts' && (
            <motion.div
              key='contracts'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='grid grid-cols-1 lg:grid-cols-2 gap-8'
            >
              {smartContracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer'
                  onClick={() => setSelectedContract(contract)}
                >
                  <div className='flex items-start justify-between mb-6'>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 mb-2'>{contract.name}</h3>
                      <p className='text-indigo-600 font-medium capitalize'>
                        {contract.type.replace('_', ' ')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        contract.status
                      )}`}
                    >
                      {contract.status.toUpperCase()}
                    </span>
                  </div>

                  <div className='mb-6'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-700'>Progress</span>
                      <span className='text-sm font-bold text-gray-900'>{contract.progress}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500'
                        style={{ width: `${contract.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className='space-y-2 mb-6'>
                    {contract.conditions.map((condition, i) => (
                      <div key={i} className='flex items-center gap-2 text-sm'>
                        {condition.includes('✓') ? (
                          <span>✅</span>
                        ) : (
                          <span>🕐</span>
                        )}
                        <span
                          className={
                            condition.includes('✓') ? 'text-gray-600' : 'text-gray-900 font-medium'
                          }
                        >
                          {condition.replace(' ✓', '')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-600'>Contract Value</p>
                      <p className='text-2xl font-bold text-emerald-600'>{contract.value}</p>
                    </div>
                    <span>→</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'trust' && (
            <motion.div
              key='trust'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
            >
              {[
                {
                  title: 'Immutable Records',
                  description: 'All transactions permanently recorded on blockchain',
                  icon: Lock,
                  color: 'from-blue-500 to-blue-600',
                  metric: '100%',
                  subtext: 'Tamper-proof',
                },
                {
                  title: 'Multi-signature Security',
                  description: 'Multiple parties required for transaction approval',
                  icon: Users,
                  color: 'from-emerald-500 to-emerald-600',
                  metric: '3/5',
                  subtext: 'Signatures required',
                },
                {
                  title: 'Complete Transparency',
                  description: 'Full visibility into all supply chain activities',
                  icon: Eye,
                  color: 'from-purple-500 to-purple-600',
                  metric: '24/7',
                  subtext: 'Real-time tracking',
                },
                {
                  title: 'Smart Automation',
                  description: 'Automated execution based on predefined conditions',
                  icon: Zap,
                  color: 'from-amber-500 to-amber-600',
                  metric: '95%',
                  subtext: 'Automation rate',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all'
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                  >
                    <item.icon className='w-8 h-8 text-white' />
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-3'>{item.title}</h3>
                  <p className='text-gray-600 mb-6'>{item.description}</p>
                  <div className='text-3xl font-bold text-indigo-600 mb-1'>{item.metric}</div>
                  <div className='text-sm text-gray-500'>{item.subtext}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contract Details Modal */}
      <AnimatePresence>
        {selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setSelectedContract(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Smart Contract Details</h2>
                <button
                  onClick={() => setSelectedContract(null)}
                  className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  <span>❌</span>
                </button>
              </div>

              <div className='space-y-6'>
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>{selectedContract.name}</h3>
                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                    <span>Type: {selectedContract.type.replace('_', ' ')}</span>
                    <span>Value: {selectedContract.value}</span>
                    <span
                      className={`px-2 py-1 rounded-full ${getStatusColor(
                        selectedContract.status
                      )}`}
                    >
                      {selectedContract.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className='font-bold text-gray-900 mb-3'>Contract Conditions</h4>
                  <div className='space-y-2'>
                    {selectedContract.conditions.map((condition, i) => (
                      <div key={i} className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                        {condition.includes('✓') ? (
                          <span>✅</span>
                        ) : (
                          <span>🕐</span>
                        )}
                        <span
                          className={
                            condition.includes('✓') ? 'text-gray-600' : 'text-gray-900 font-medium'
                          }
                        >
                          {condition.replace(' ✓', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <h4 className='font-bold text-gray-900 mb-2'>Participants</h4>
                    <div className='space-y-2'>
                      {selectedContract.participants.map((participant, i) => (
                        <div key={i} className='flex items-center gap-2 text-sm text-gray-600'>
                          <span>👤</span>
                          {participant}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-900 mb-2'>Timeline</h4>
                    <div className='space-y-2 text-sm text-gray-600'>
                      <div>Created: {selectedContract.createdAt}</div>
                      <div>Est. Completion: {selectedContract.estimatedCompletion}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-bold text-gray-900 mb-3'>Progress Overview</h4>
                  <div className='bg-gray-50 rounded-2xl p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-700'>Completion</span>
                      <span className='text-sm font-bold text-gray-900'>
                        {selectedContract.progress}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-3'>
                      <div
                        className='bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500'
                        style={{ width: `${selectedContract.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-3xl p-8 max-w-4xl w-full'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Blockchain Integration Demo</h2>
                <button
                  onClick={() => setShowDemo(false)}
                  className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  <span>❌</span>
                </button>
              </div>

              <div className='aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6'>
                <div className='text-white text-center'>
                  <span>▶️</span>
                  <p className='text-xl font-semibold'>Blockchain Demo Coming Soon</p>
                  <p className='text-indigo-100'>
                    Learn how our blockchain integration ensures transparency
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span>🛡️</span>
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>1. Secure Recording</h3>
                  <p className='text-gray-600 text-sm'>
                    All transactions recorded immutably on blockchain
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span>👁️</span>
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>2. Full Transparency</h3>
                  <p className='text-gray-600 text-sm'>
                    Real-time visibility into supply chain activities
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span>⚡</span>
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>3. Smart Automation</h3>
                  <p className='text-gray-600 text-sm'>
                    Automated processes based on smart contracts
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
