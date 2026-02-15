// Bell24H Enhanced Financial System Types
// Comprehensive Banking, GST, and Escrow Integration

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  branchName?: string;
  accountType: 'savings' | 'current' | 'cc' | 'od';
  gstLinked: boolean;
  verified: boolean;
  isPrimary: boolean;
  verificationDate?: Date;
  verificationMethod?: 'penny_drop' | 'statement' | 'manual';
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface GSTDetails {
  id: string;
  userId: string;
  gstNumber: string;
  legalName: string;
  tradeName?: string;
  businessType: 'proprietorship' | 'partnership' | 'private_limited' | 'public_limited' | 'llp';
  registrationDate: Date;
  status: 'active' | 'inactive' | 'cancelled' | 'suspended';
  address: {
    building: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  verified: boolean;
  verificationDate?: Date;
  complianceScore: number; // 0-100
  lastReturnFiled?: Date;
  annualTurnover?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnhancedWallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  frozenBalance: number;
  currency: string;

  // Enhanced Limits
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;

  // Verification & Security
  isVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  riskScore: number; // 0-100

  // Banking Integration
  primaryBankId?: string;
  razorpayAccountId?: string;
  razorpayContactId?: string;

  // GST Integration
  gstDetailsId?: string;
  gstCompliant: boolean;

  // Escrow Settings
  escrowEnabled: boolean;
  escrowThreshold: number; // Default ₹5,00,000
  autoEscrowEnabled: boolean;

  // Statistics
  totalTransacted: number;
  escrowTransactions: number;
  directTransactions: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface EscrowAccount {
  id: string;
  escrowNumber: string; // Unique identifier like ESC-2025-001234

  // Parties
  buyerId: string;
  supplierId: string;

  // Financial Details
  amount: number;
  currency: string;
  escrowFee: number;
  totalAmount: number; // amount + escrowFee

  // Status & Lifecycle
  status: 'created' | 'funded' | 'active' | 'disputed' | 'completed' | 'cancelled' | 'refunded';
  createdAt: Date;
  fundedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;

  // Contract & Legal
  contractTerms: string;
  legalDocumentUrl?: string;
  digitalSignatures: DigitalSignature[];

  // Milestones
  milestones: EscrowMilestone[];
  currentMilestone: number;

  // Dispute Management
  disputeReason?: string;
  disputeDate?: Date;
  arbitratorId?: string;
  disputeResolution?: string;

  // Compliance
  gstApplicable: boolean;
  gstAmount?: number;
  tdsApplicable: boolean;
  tdsAmount?: number;

  // Metadata
  orderId?: string;
  rfqId?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface EscrowMilestone {
  id: string;
  escrowId: string;
  sequence: number;
  title: string;
  description: string;
  amount: number;
  percentage: number;

  // Timeline
  expectedDate: Date;
  actualDate?: Date;

  // Status
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'disputed';

  // Deliverables
  deliverables: string[];
  submissionUrl?: string;
  submissionNotes?: string;
  submissionDate?: Date;

  // Approval
  approvalDate?: Date;
  approvalNotes?: string;
  rejectionReason?: string;

  // Payment
  paymentDate?: Date;
  transactionId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface DigitalSignature {
  id: string;
  signerId: string;
  signerType: 'buyer' | 'supplier' | 'arbitrator';
  signatureHash: string;
  signedAt: Date;
  ipAddress: string;
  userAgent: string;
  documentHash: string;
}

export interface TransactionFlow {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;

  // Flow Type
  flowType:
    | 'direct_transfer'
    | 'escrow_creation'
    | 'escrow_funding'
    | 'milestone_payment'
    | 'escrow_release';

  // Routing Logic
  routingReason: 'below_threshold' | 'above_threshold' | 'user_preference' | 'risk_assessment';
  threshold: number;

  // Parties
  fromUserId: string;
  toUserId: string;
  fromWalletId: string;
  toWalletId: string;
  escrowId?: string;

  // Status & Processing
  status: 'initiated' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processingStarted?: Date;
  processingCompleted?: Date;

  // Fees & Charges
  transactionFee: number;
  escrowFee?: number;
  gstAmount?: number;
  tdsAmount?: number;
  netAmount: number;

  // Gateway Integration
  gatewayProvider: 'razorpay' | 'stripe' | 'bank_transfer' | 'wallet';
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;

  // Compliance
  gstCompliant: boolean;
  antiMoneyLaunderingCheck: boolean;
  riskScore: number;

  createdAt: Date;
  completedAt?: Date;
}

export interface ComplianceVerification {
  id: string;
  userId: string;

  // Verification Status
  overallStatus: 'pending' | 'partial' | 'complete' | 'expired' | 'rejected';
  complianceScore: number; // 0-100

  // Individual Verifications
  bankVerification: {
    status: 'pending' | 'verified' | 'failed';
    verifiedAt?: Date;
    method?: 'penny_drop' | 'statement' | 'manual';
    attempts: number;
  };

  gstVerification: {
    status: 'pending' | 'verified' | 'failed';
    verifiedAt?: Date;
    method?: 'api' | 'document' | 'manual';
    lastChecked?: Date;
  };

  kycVerification: {
    status: 'pending' | 'verified' | 'failed';
    verifiedAt?: Date;
    documentsSubmitted: string[];
    verificationNotes?: string;
  };

  addressVerification: {
    status: 'pending' | 'verified' | 'failed';
    verifiedAt?: Date;
    method?: 'document' | 'utility_bill' | 'bank_statement';
  };

  // Risk Assessment
  riskProfile: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  lastRiskAssessment: Date;

  // Compliance History
  verificationHistory: VerificationAttempt[];

  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationAttempt {
  id: string;
  type: 'bank' | 'gst' | 'kyc' | 'address';
  status: 'success' | 'failed' | 'pending';
  method: string;
  reason?: string;
  attemptedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface InvoiceDiscounting {
  id: string;
  invoiceId: string;
  supplierId: string;
  buyerId: string;

  // Invoice Details
  invoiceAmount: number;
  currency: string;
  invoiceDate: Date;
  dueDate: Date;

  // Discounting Details
  discountingPlatform: 'm1_exchange' | 'kredx' | 'invoicemart' | 'internal';
  requestedAmount: number;
  approvedAmount?: number;
  discountRate: number;
  processingFee: number;
  netAmount?: number;

  // Enhanced Rates (Escrow-backed)
  escrowBacked: boolean;
  escrowId?: string;
  enhancedRate?: number; // Better rate due to escrow backing
  riskReduction: number; // Percentage risk reduction

  // Status & Processing
  status: 'requested' | 'under_review' | 'approved' | 'rejected' | 'funded' | 'repaid';
  requestedAt: Date;
  approvedAt?: Date;
  fundedAt?: Date;
  repaidAt?: Date;

  // Risk Assessment
  buyerRiskScore: number;
  supplierRiskScore: number;
  invoiceRiskScore: number;
  overallRiskScore: number;

  // Compliance
  gstCompliant: boolean;
  bankVerified: boolean;
  creditScore?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialDashboardData {
  userId: string;

  // Wallet Summary
  wallet: {
    totalBalance: number;
    availableBalance: number;
    escrowBalance: number;
    frozenBalance: number;
  };

  // Transaction Summary
  transactions: {
    thisMonth: {
      direct: { count: number; amount: number };
      escrow: { count: number; amount: number };
      total: { count: number; amount: number };
    };
    lastMonth: {
      direct: { count: number; amount: number };
      escrow: { count: number; amount: number };
      total: { count: number; amount: number };
    };
  };

  // Active Escrows
  escrows: {
    active: EscrowAccount[];
    pendingApproval: EscrowAccount[];
    disputed: EscrowAccount[];
    completed: number;
  };

  // Compliance Status
  compliance: {
    overallScore: number;
    bankVerified: boolean;
    gstVerified: boolean;
    kycCompleted: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };

  // Invoice Discounting
  invoiceDiscounting: {
    availableLimit: number;
    usedLimit: number;
    pendingRequests: number;
    avgDiscountRate: number;
  };

  // Analytics
  analytics: {
    avgTransactionSize: number;
    escrowUsageRate: number;
    complianceScore: number;
    costSavings: number;
  };
}

// API Response Types
export interface BankVerificationResponse {
  success: boolean;
  verified: boolean;
  accountHolder: string;
  bankName: string;
  ifscValid: boolean;
  message: string;
  verificationId?: string;
}

export interface GSTVerificationResponse {
  success: boolean;
  verified: boolean;
  gstDetails: {
    gstNumber: string;
    legalName: string;
    tradeName?: string;
    status: string;
    registrationDate: string;
    businessType: string;
    address: any;
  };
  message: string;
  verificationId?: string;
}

export interface TransactionRequest {
  amount: number;
  currency: string;
  fromUserId: string;
  toUserId: string;
  description?: string;
  orderId?: string;
  useEscrow?: boolean; // Optional override
  milestones?: Omit<EscrowMilestone, 'id' | 'escrowId' | 'createdAt' | 'updatedAt'>[];
}

export interface TransactionResponse {
  success: boolean;
  transactionId: string;
  flowType: 'direct_transfer' | 'escrow_creation';
  escrowId?: string;
  message: string;
  nextSteps?: string[];
}

// Webhook Types
export interface EscrowWebhookPayload {
  eventType:
    | 'escrow.created'
    | 'escrow.funded'
    | 'milestone.submitted'
    | 'milestone.approved'
    | 'escrow.completed'
    | 'escrow.disputed';
  escrowId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface PaymentWebhookPayload {
  eventType: 'payment.success' | 'payment.failed' | 'payment.pending';
  transactionId: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  data: Record<string, any>;
}
