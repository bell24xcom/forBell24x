/**
 * M1 Exchange Financial Services Integration
 * 
 * Provides early milestone payment services for Bell24H marketplace
 * 
 * @module server/services/financial/m1exchange
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, sql, inArray, not, desc, gte, lte, isNull } from 'drizzle-orm';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';

// Import database and schema
import { users, milestones, escrows, transactions, projects, earlyPayments } from '../../../src/db/schema';

// Load environment variables
dotenv.config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Create a typed Drizzle instance
const db = drizzle(pool, { schema: { users, milestones, escrows, transactions, projects } });

/**
 * M1 Exchange service error class
 */
export class M1ExchangeServiceError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'M1ExchangeServiceError';
  }
}

/**
 * Milestone payment request interface
 */
export interface MilestonePaymentRequest {
  milestoneId: string;
  supplierId: number;
  requestedAmount: number;
  reason?: string;
}

/**
 * Early payment terms interface
 */
export interface EarlyPaymentTerms {
  milestoneId: string;
  originalAmount: number;
  maxEligibleAmount: number;
  earlyPaymentFee: number;
  netAmount: number;
  processingTime: string;
  availableImmediately: boolean;
}

/**
 * Logs M1 Exchange activity
 * @param action - The action being performed
 * @param data - The data being logged
 */
function logM1Activity(action: string, data: any): void {
  console.log(`[${new Date().toISOString()}] [M1Exchange] ${action}:`, JSON.stringify(data, null, 2));
}

/**
 * Calculates fee for early milestone payment
 * @param amount - The milestone amount
 * @param supplierId - The supplier ID to check for volume discounts
 * @returns The calculated fee based on supplier history and amount
 */
async function calculateEarlyPaymentFee(amount: number, supplierId: number): Promise<number> {
  // Get supplier's transaction history to check for volume discount eligibility
  const supplierTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, supplierId),
      eq(transactions.type, 'M1_EARLY_PAYMENT'),
      sql`"timestamp" > NOW() - INTERVAL '90 days'`
    )
  });
  
  // Base fee rate is 2% for infrequent users, 1.5% for regular users, 1% for power users
  let feeRate = 0.02; // Base 2%
  
  if (supplierTransactions.length >= 10) {
    feeRate = 0.01; // 1% for power users (10+ transactions in 90 days)
  } else if (supplierTransactions.length >= 5) {
    feeRate = 0.015; // 1.5% for regular users (5-9 transactions in 90 days)
  }
  
  // Calculate the fee
  const fee = amount * feeRate;
  
  // Minimum fee of 100 INR
  return Math.max(fee, 100);
}

/**
 * Checks if a milestone is eligible for early payment
 * @param milestoneId - The ID of the milestone to check
 * @param supplierId - The ID of the supplier requesting early payment
 * @returns Early payment terms if eligible
 */
export async function checkMilestoneEligibility(
  milestoneId: string, 
  supplierId: number
): Promise<EarlyPaymentTerms> {
  try {
    logM1Activity('Checking milestone eligibility', { milestoneId, supplierId });

    // Fetch milestone details
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        project: true
      }
    });

    if (!milestone) {
      throw new M1ExchangeServiceError('Milestone not found', 'MILESTONE_NOT_FOUND');
    }

    // Verify supplier is assigned to this milestone's project
    if (milestone.project.supplierId !== supplierId) {
      throw new M1ExchangeServiceError('Supplier is not assigned to this milestone', 'UNAUTHORIZED');
    }

    // Check if milestone is approved
    if (milestone.status !== 'APPROVED') {
      throw new M1ExchangeServiceError(
        'Milestone must be approved to request early payment', 
        'MILESTONE_NOT_APPROVED'
      );
    }

    // Check if milestone is already paid or early payment is already processed
    if (milestone.paymentStatus === 'PAID' || milestone.paymentStatus === 'EARLY_PAYMENT_PROCESSED') {
      throw new M1ExchangeServiceError(
        'Milestone is already paid or early payment is already processed', 
        'ALREADY_PAID'
      );
    }

    // Check if there's sufficient escrow for this project
    const escrow = await db.query.escrows.findFirst({
      where: eq(escrows.projectId, milestone.projectId)
    });

    if (!escrow || escrow.balance < milestone.amount) {
      throw new M1ExchangeServiceError(
        'Insufficient escrow balance for early payment', 
        'INSUFFICIENT_ESCROW'
      );
    }

    // Calculate early payment fee
    const earlyPaymentFee = await calculateEarlyPaymentFee(milestone.amount, supplierId);
    
    // Calculate net amount after fee
    const netAmount = milestone.amount - earlyPaymentFee;

    const earlyPaymentTerms: EarlyPaymentTerms = {
      milestoneId,
      originalAmount: milestone.amount,
      maxEligibleAmount: milestone.amount,
      earlyPaymentFee,
      netAmount,
      processingTime: 'Immediate',
      availableImmediately: true
    };

    return earlyPaymentTerms;
  } catch (error) {
    if (error instanceof M1ExchangeServiceError) {
      throw error;
    }
    
    logM1Activity('Error checking milestone eligibility', error);
    throw new M1ExchangeServiceError(
      'Failed to check milestone eligibility',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Processes early payment for a milestone
 * @param requestData - The milestone early payment request data
 * @returns Transaction details if successful
 */
export async function processEarlyPayment(requestData: MilestonePaymentRequest): Promise<any> {
  try {
    const { milestoneId, supplierId, requestedAmount, reason } = requestData;
    logM1Activity('Processing early payment', requestData);

    // Check eligibility first
    const eligibility = await checkMilestoneEligibility(milestoneId, supplierId);

    // Verify requested amount is valid
    if (requestedAmount > eligibility.maxEligibleAmount) {
      throw new M1ExchangeServiceError(
        `Requested amount exceeds maximum eligible amount of ${eligibility.maxEligibleAmount}`,
        'INVALID_AMOUNT'
      );
    }

    // Fetch milestone details
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId),
      with: {
        project: true
      }
    });

    if (!milestone) {
      throw new M1ExchangeServiceError('Milestone not found', 'MILESTONE_NOT_FOUND');
    }

    // Calculate fees based on actual requested amount
    const earlyPaymentFee = await calculateEarlyPaymentFee(requestedAmount, supplierId);
    const netAmount = requestedAmount - earlyPaymentFee;

    // Begin transaction to ensure all database operations succeed or fail together
    await pool.query('BEGIN');

    try {
      // Update escrow balance
      await db.update(escrows)
        .set({ 
          balance: sql`balance - ${requestedAmount}`,
          updatedAt: new Date()
        })
        .where(eq(escrows.projectId, milestone.projectId));

      // Update milestone payment status
      await db.update(milestones)
        .set({ 
          paymentStatus: 'EARLY_PAYMENT_PROCESSED',
          paymentDate: new Date(),
          paymentAmount: requestedAmount,
          paymentReference: `M1_EARLY_${milestoneId}`
        })
        .where(eq(milestones.id, milestoneId));

      // Create transaction records
      const paymentTransactionId = randomUUID();
      await db.insert(transactions).values({
        id: paymentTransactionId,
        userId: supplierId,
        amount: netAmount,
        type: 'M1_EARLY_PAYMENT',
        status: 'COMPLETED',
        referenceId: milestoneId,
        description: `Early milestone payment for ${milestone.title}`,
        timestamp: new Date(),
        metadata: JSON.stringify({
          projectId: milestone.projectId,
          milestoneId,
          requestedAmount,
          earlyPaymentFee,
          netAmount,
          reason
        })
      });

      // Create fee transaction record
      const feeTransactionId = randomUUID();
      await db.insert(transactions).values({
        id: feeTransactionId,
        userId: supplierId,
        amount: -earlyPaymentFee,
        type: 'M1_PAYMENT_FEE',
        status: 'COMPLETED',
        referenceId: milestoneId,
        description: `Fee for early milestone payment: ${milestone.title}`,
        timestamp: new Date(),
        metadata: JSON.stringify({
          projectId: milestone.projectId,
          milestoneId,
          feeAmount: earlyPaymentFee,
          relatedTransactionId: paymentTransactionId
        })
      });

      // Commit transaction
      await pool.query('COMMIT');

      return {
        transactionId: paymentTransactionId,
        milestoneId,
        requestedAmount,
        earlyPaymentFee,
        netAmount,
        status: 'COMPLETED',
        timestamp: new Date().toISOString()
      };
    } catch (dbError) {
      // Rollback on any database error
      await pool.query('ROLLBACK');
      throw dbError;
    }
  } catch (error) {
    if (error instanceof M1ExchangeServiceError) {
      throw error;
    }
    
    logM1Activity('Error processing early payment', error);
    throw new M1ExchangeServiceError(
      'Failed to process early payment',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Gets early payment history for a supplier
 * @param supplierId - The ID of the supplier
 * @returns Early payment history records
 */
export async function getPaymentHistory(supplierId: number): Promise<any[]> {
  try {
    logM1Activity('Getting early payment history', { supplierId });

    // Query database for early payment transactions
    const earlyPayments = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, supplierId),
        eq(transactions.type, 'M1_EARLY_PAYMENT')
      ),
      orderBy: [sql`"timestamp" DESC`]
    });

    // Get associated milestone details
    const history = await Promise.all(
      earlyPayments.map(async (payment) => {
        const milestone = await db.query.milestones.findFirst({
          where: eq(milestones.id, payment.referenceId),
          with: {
            project: true
          }
        });
        
        // Get associated fee transaction
        const feeTransaction = await db.query.transactions.findFirst({
          where: and(
            eq(transactions.userId, supplierId),
            eq(transactions.type, 'M1_PAYMENT_FEE'),
            eq(transactions.referenceId, payment.referenceId)
          )
        });
        
        return {
          transactionId: payment.id,
          milestoneId: payment.referenceId,
          projectId: milestone?.projectId,
          projectName: milestone?.project.name,
          milestoneName: milestone?.title,
          paymentAmount: payment.amount,
          feeAmount: Math.abs(feeTransaction?.amount || 0),
          paymentDate: payment.timestamp,
          status: payment.status
        };
      })
    );

    return history;
  } catch (error) {
    logM1Activity('Error getting payment history', error);
    throw new M1ExchangeServiceError(
      'Failed to get payment history',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Calculates total savings for a supplier from using M1 Exchange
 * @param supplierId - The ID of the supplier
 * @returns Savings calculation details
 */
export async function calculateSupplierSavings(supplierId: number): Promise<any> {
  try {
    logM1Activity('Calculating supplier savings', { supplierId });

    // Get all early payment transactions
    const earlyPayments = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, supplierId),
        eq(transactions.type, 'M1_EARLY_PAYMENT')
      )
    });

    // Get all fee transactions
    const feeTransactions = await db.query.transactions.findMany({
      where: and(
        eq(transactions.userId, supplierId),
        eq(transactions.type, 'M1_PAYMENT_FEE')
      )
    });

    // Calculate total early payment amount
    const totalEarlyPaymentAmount = earlyPayments.reduce(
      (sum, payment) => sum + payment.amount, 
      0
    );

    // Calculate total fees paid
    const totalFeesPaid = feeTransactions.reduce(
      (sum, fee) => sum + Math.abs(fee.amount), 
      0
    );

    // Calculate average payment acceleration (days earlier than scheduled)
    // This would require comparing the early payment date with the original scheduled date
    // For now, we'll use a placeholder calculation
    const averageDaysAccelerated = 30; // Placeholder value
    
    // Calculate opportunity cost savings based on average interest rate of 18% APR
    const dailyInterestRate = 0.18 / 365;
    const opportunityCostSavings = totalEarlyPaymentAmount * dailyInterestRate * averageDaysAccelerated;
    
    // Calculate net benefit
    const netBenefit = opportunityCostSavings - totalFeesPaid;

    return {
      supplierId,
      totalEarlyPayments: earlyPayments.length,
      totalEarlyPaymentAmount,
      totalFeesPaid,
      averageDaysAccelerated,
      opportunityCostSavings,
      netBenefit,
      averageFeeRate: totalEarlyPaymentAmount > 0 ? 
        (totalFeesPaid / totalEarlyPaymentAmount * 100).toFixed(2) + '%' : 
        '0%'
    };
  } catch (error) {
    logM1Activity('Error calculating supplier savings', error);
    throw new M1ExchangeServiceError(
      'Failed to calculate supplier savings',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Checks M1 Exchange service status
 * @returns Service status information
 */
export async function checkServiceStatus(): Promise<{ status: string; version?: string; uptime?: number }> {
  try {
    const m1ApiUrl = process.env.M1EXCHANGE_API_URL || 'https://api.m1exchange.com/v1';
    
    // If in development mode, just return a mock response
    if (process.env.NODE_ENV === 'development' && !process.env.M1EXCHANGE_API_KEY) {
      return {
        status: 'operational',
        version: '2.1.0',
        uptime: 99.98
      };
    }
    
    // In production, actually check the M1 Exchange API status
    const response = await axios.get(`${m1ApiUrl}/status`, {
      headers: {
        'Authorization': `Bearer ${process.env.M1EXCHANGE_API_KEY}`
      }
    });
    
    return response.data;
  } catch (error) {
    logM1Activity('Service status check failed', error);
    return {
      status: 'degraded',
      error: error.message
    };
  }
}

/**
 * Request early payment for a milestone
 * @param milestoneId - ID of the milestone
 * @param supplierId - ID of the supplier
 * @param requestedAmount - Amount requested for early payment
 * @param remarks - Optional remarks for the request
 * @returns Early payment request details
 */
export async function requestEarlyPayment(
  milestoneId: number, 
  supplierId: number, 
  requestedAmount: number,
  remarks?: string
): Promise<any> {
  try {
    logM1Activity('Requesting early payment', { milestoneId, supplierId, requestedAmount, remarks });
    
    // First check eligibility
    const eligibility = await checkMilestoneEligibility(milestoneId.toString(), supplierId);
    
    if (requestedAmount > eligibility.maxEligibleAmount) {
      throw new M1ExchangeServiceError(
        'Requested amount exceeds eligible amount',
        'INVALID_AMOUNT',
        { maxEligible: eligibility.maxEligibleAmount }
      );
    }
    
    // Calculate the early payment fee
    const fee = await calculateEarlyPaymentFee(requestedAmount, supplierId);
    
    // Calculate net amount (requested amount minus fee)
    const netAmount = requestedAmount - fee;
    
    // Create early payment record in database
    const [earlyPayment] = await db.insert(earlyPayments).values({
      milestoneId: milestoneId,
      supplierId: supplierId,
      requestedAmount: requestedAmount,
      feeAmount: fee,
      netAmount: netAmount,
      status: 'requested',
      requestDate: new Date(),
      remarks: remarks || null
    }).returning();
    
    // Process the payment through M1 Exchange API
    // In development mode, we'll skip the actual API call
    if (process.env.NODE_ENV !== 'development' || process.env.M1EXCHANGE_API_KEY) {
      const m1ApiUrl = process.env.M1EXCHANGE_API_URL || 'https://api.m1exchange.com/v1';
      
      await axios.post(`${m1ApiUrl}/early-payments/request`, {
        milestoneId: milestoneId.toString(),
        supplierId: supplierId.toString(),
        amount: requestedAmount,
        fee: fee,
        netAmount: netAmount,
        referenceId: earlyPayment.id.toString(),
        remarks: remarks
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.M1EXCHANGE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return earlyPayment;
  } catch (error) {
    logM1Activity('Error requesting early payment', error);
    
    if (error instanceof M1ExchangeServiceError) {
      throw error;
    }
    
    throw new M1ExchangeServiceError(
      'Failed to request early payment',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Get transaction by ID
 * @param transactionId - ID of the transaction
 * @returns Transaction details
 */
export async function getTransactionById(transactionId: number): Promise<any> {
  try {
    logM1Activity('Getting transaction by ID', { transactionId });
    
    const transaction = await db.query.earlyPayments.findFirst({
      where: eq(earlyPayments.id, transactionId),
      with: {
        milestone: {
          with: {
            project: true
          }
        }
      }
    });
    
    if (!transaction) {
      return null;
    }
    
    // Format the response with project and milestone details
    return {
      ...transaction,
      projectId: transaction.milestone.projectId,
      projectName: transaction.milestone.project.name,
      milestoneName: transaction.milestone.title,
      buyerId: transaction.milestone.project.buyerId
    };
  } catch (error) {
    logM1Activity('Error getting transaction by ID', error);
    throw new M1ExchangeServiceError(
      'Failed to get transaction',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Get transactions by supplier ID
 * @param supplierId - ID of the supplier
 * @returns List of transactions
 */
export async function getTransactionsBySupplier(supplierId: number): Promise<any[]> {
  try {
    logM1Activity('Getting transactions by supplier', { supplierId });
    
    const transactions = await db.query.earlyPayments.findMany({
      where: eq(earlyPayments.supplierId, supplierId),
      with: {
        milestone: {
          with: {
            project: true
          }
        }
      },
      orderBy: [desc(earlyPayments.requestDate)]
    });
    
    // Format the response with project and milestone details
    return transactions.map(transaction => ({
      ...transaction,
      projectId: transaction.milestone.projectId,
      projectName: transaction.milestone.project.name,
      milestoneName: transaction.milestone.title
    }));
  } catch (error) {
    logM1Activity('Error getting transactions by supplier', error);
    throw new M1ExchangeServiceError(
      'Failed to get transactions',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Update transaction status
 * @param transactionId - ID of the transaction
 * @param status - New status
 * @param remarks - Optional remarks for the status update
 * @returns Updated transaction
 */
export async function updateTransactionStatus(
  transactionId: number,
  status: string,
  remarks?: string
): Promise<any> {
  try {
    logM1Activity('Updating transaction status', { transactionId, status, remarks });
    
    // Get the current transaction
    const currentTransaction = await getTransactionById(transactionId);
    
    if (!currentTransaction) {
      throw new M1ExchangeServiceError('Transaction not found', 'NOT_FOUND');
    }
    
    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'requested': ['approved', 'rejected'],
      'approved': ['processed', 'rejected'],
      'processed': ['completed', 'rejected'],
      'completed': [],
      'rejected': []
    };
    
    if (!validTransitions[currentTransaction.status]?.includes(status)) {
      throw new M1ExchangeServiceError(
        `Invalid status transition from ${currentTransaction.status} to ${status}`,
        'INVALID_STATUS_TRANSITION'
      );
    }
    
    // Update status and processing date if applicable
    const updateData: any = { status };
    
    if (remarks) {
      updateData.statusRemarks = remarks;
    }
    
    if (status === 'approved') {
      updateData.approvalDate = new Date();
    } else if (status === 'processed') {
      updateData.processingDate = new Date();
    } else if (status === 'completed') {
      updateData.completionDate = new Date();
    } else if (status === 'rejected') {
      updateData.rejectionDate = new Date();
    }
    
    // Update the transaction in the database
    const [updatedTransaction] = await db
      .update(earlyPayments)
      .set(updateData)
      .where(eq(earlyPayments.id, transactionId))
      .returning();
    
    // If approved or processed, update escrow if applicable
    if (status === 'approved' || status === 'processed') {
      // Here you would integrate with the escrow system
      // This is a placeholder for escrow integration
      // await escrowService.reserveFunds(currentTransaction.milestoneId, currentTransaction.requestedAmount);
    }
    
    // If completed, initiate the payment
    if (status === 'completed') {
      // Here you would initiate the actual payment
      // This is a placeholder for payment execution
      // await paymentService.executePayment(currentTransaction.supplierId, currentTransaction.netAmount);
    }
    
    return {
      ...updatedTransaction,
      projectId: currentTransaction.projectId,
      projectName: currentTransaction.projectName,
      milestoneName: currentTransaction.milestoneName
    };
  } catch (error) {
    logM1Activity('Error updating transaction status', error);
    
    if (error instanceof M1ExchangeServiceError) {
      throw error;
    }
    
    throw new M1ExchangeServiceError(
      'Failed to update transaction status',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Generate payment report
 * @param options - Report options
 * @returns Payment report data
 */
export async function generatePaymentReport(options: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}): Promise<any> {
  try {
    logM1Activity('Generating payment report', options);
    
    let query = db.select()
      .from(earlyPayments)
      .leftJoin(milestones, eq(earlyPayments.milestoneId, milestones.id))
      .leftJoin(projects, eq(milestones.projectId, projects.id));
    
    // Apply filters
    if (options.startDate) {
      query = query.where(gte(earlyPayments.requestDate, options.startDate));
    }
    
    if (options.endDate) {
      query = query.where(lte(earlyPayments.requestDate, options.endDate));
    }
    
    if (options.status) {
      query = query.where(eq(earlyPayments.status, options.status));
    }
    
    const results = await query;
    
    // Calculate summary metrics
    const totalRequests = results.length;
    const totalRequestedAmount = results.reduce((sum, row) => 
      sum + (row.earlyPayments?.requestedAmount || 0), 0);
    const totalFeeAmount = results.reduce((sum, row) => 
      sum + (row.earlyPayments?.feeAmount || 0), 0);
    
    // Group by status
    const statusSummary = results.reduce((acc, row) => {
      const status = row.earlyPayments?.status || 'unknown';
      if (!acc[status]) {
        acc[status] = {
          count: 0,
          totalAmount: 0
        };
      }
      acc[status].count += 1;
      acc[status].totalAmount += row.earlyPayments?.requestedAmount || 0;
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);
    
    // Group by supplier
    const supplierSummary = results.reduce((acc, row) => {
      const supplierId = row.earlyPayments?.supplierId?.toString() || 'unknown';
      if (!acc[supplierId]) {
        acc[supplierId] = {
          count: 0,
          totalAmount: 0,
          totalFees: 0
        };
      }
      acc[supplierId].count += 1;
      acc[supplierId].totalAmount += row.earlyPayments?.requestedAmount || 0;
      acc[supplierId].totalFees += row.earlyPayments?.feeAmount || 0;
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number; totalFees: number }>);
    
    return {
      period: {
        startDate: options.startDate?.toISOString() || 'all-time',
        endDate: options.endDate?.toISOString() || 'present'
      },
      summary: {
        totalRequests,
        totalRequestedAmount,
        totalFeeAmount,
        averageFeeRate: totalRequestedAmount > 0 ? 
          (totalFeeAmount / totalRequestedAmount * 100).toFixed(2) + '%' : '0%'
      },
      byStatus: statusSummary,
      bySupplier: supplierSummary,
      transactions: results.map(row => ({
        id: row.earlyPayments?.id,
        supplierId: row.earlyPayments?.supplierId,
        milestoneId: row.earlyPayments?.milestoneId,
        projectId: row.milestones?.projectId,
        projectName: row.projects?.name,
        milestoneName: row.milestones?.title,
        requestedAmount: row.earlyPayments?.requestedAmount,
        feeAmount: row.earlyPayments?.feeAmount,
        netAmount: row.earlyPayments?.netAmount,
        status: row.earlyPayments?.status,
        requestDate: row.earlyPayments?.requestDate,
        completionDate: row.earlyPayments?.completionDate
      }))
    };
  } catch (error) {
    logM1Activity('Error generating payment report', error);
    throw new M1ExchangeServiceError(
      'Failed to generate payment report',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Get eligible milestones for early payment
 * @param supplierId - ID of the supplier
 * @returns List of eligible milestones
 */
export async function getEligibleMilestones(supplierId: number): Promise<any[]> {
  try {
    logM1Activity('Getting eligible milestones', { supplierId });
    
    // Get milestones that are approved but not yet paid
    const eligibleMilestones = await db.query.milestones.findMany({
      where: and(
        eq(milestones.supplierId, supplierId),
        eq(milestones.status, 'approved'),
        isNull(milestones.paymentDate)
      ),
      with: {
        project: true
      }
    });
    
    // Check if each milestone already has a pending early payment request
    const result = await Promise.all(eligibleMilestones.map(async (milestone) => {
      const existingRequest = await db.query.earlyPayments.findFirst({
        where: and(
          eq(earlyPayments.milestoneId, milestone.id),
          eq(earlyPayments.supplierId, supplierId),
          inArray(earlyPayments.status, ['requested', 'approved', 'processed'])
        )
      });
      
      // If there's an existing request, this milestone is not eligible anymore
      if (existingRequest) {
        return null;
      }
      
      // Calculate fees and terms for this milestone
      const earlyPaymentFee = await calculateEarlyPaymentFee(milestone.amount, supplierId);
      
      return {
        milestoneId: milestone.id,
        projectId: milestone.projectId,
        projectName: milestone.project.name,
        milestoneName: milestone.title,
        originalAmount: milestone.amount,
        maxEligibleAmount: milestone.amount,
        earlyPaymentFee,
        netAmount: milestone.amount - earlyPaymentFee,
        dueDate: milestone.dueDate,
        processingTime: '1-2 business days',
        availableImmediately: true
      };
    }));
    
    // Filter out null entries (milestones that already have pending requests)
    return result.filter(item => item !== null);
  } catch (error) {
    logM1Activity('Error getting eligible milestones', error);
    throw new M1ExchangeServiceError(
      'Failed to get eligible milestones',
      'SERVICE_ERROR',
      error
    );
  }
}

// Service instance for export
export const m1exchangeService = {
  checkServiceStatus,
  checkMilestoneEligibility,
  requestEarlyPayment,
  processEarlyPayment,
  getTransactionById,
  getTransactionsBySupplier,
  updateTransactionStatus,
  getPaymentHistory,
  calculateSupplierSavings,
  generatePaymentReport,
  getEligibleMilestones
};
