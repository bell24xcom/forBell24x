/**
 * KredX Financial Services Integration
 * 
 * Provides invoice discounting and financing services for Bell24H marketplace
 * 
 * @module server/services/financial/kredx
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

// Import database and schema
import { users, invoices, financingRequests, transactions } from '../../../db/schema.js';

// Load environment variables
dotenv.config();

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Create a typed Drizzle instance
const db = drizzle(pool, { schema: { users, invoices, financingRequests, transactions } });

// KredX API configuration
const KREDX_API_KEY = process.env.KREDX_API_KEY;
const KREDX_API_SECRET = process.env.KREDX_API_SECRET;
const KREDX_API_URL = process.env.KREDX_API_URL || 'https://api.kredx.com/v2';

/**
 * KredX service error class
 */
export class KredXServiceError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'KredXServiceError';
  }
}

/**
 * Invoice financing options interface
 */
export interface FinancingOptions {
  discountRate: number;
  processingFee: number;
  advanceAmount: number;
  dueDate: Date;
  totalFees: number;
  netAmount: number;
}

/**
 * Invoice submission interface
 */
export interface InvoiceSubmission {
  invoiceId: string;
  buyerId: number;
  supplierId: number;
  amount: number;
  dueDate: Date;
  issueDate: Date;
  invoiceNumber: string;
  description: string;
  attachmentUrl?: string;
}

/**
 * Logs KredX API calls and responses
 * @param action - The action being performed
 * @param data - The data being logged
 */
function logKredXActivity(action: string, data: any): void {
  console.log(`[${new Date().toISOString()}] [KredX] ${action}:`, JSON.stringify(data, null, 2));
}

/**
 * Gets authorization headers for KredX API calls
 */
function getAuthHeaders(): Record<string, string> {
  if (!KREDX_API_KEY || !KREDX_API_SECRET) {
    throw new KredXServiceError('KredX API credentials not configured', 'MISSING_CREDENTIALS');
  }

  const timestamp = Date.now().toString();
  const signature = jwt.sign(
    { apiKey: KREDX_API_KEY, timestamp },
    KREDX_API_SECRET,
    { expiresIn: '1h' }
  );

  return {
    'X-KredX-API-Key': KREDX_API_KEY,
    'X-KredX-Signature': signature,
    'X-KredX-Timestamp': timestamp,
    'Content-Type': 'application/json'
  };
}

/**
 * Evaluates invoice and determines financing options
 * @param invoice - The invoice to evaluate
 * @returns Financing options if available
 */
export async function evaluateInvoice(invoice: InvoiceSubmission): Promise<FinancingOptions> {
  try {
    logKredXActivity('Evaluating invoice', invoice);

    // Get buyer credit profile from database or KredX API
    const buyerResult = await db.query.users.findFirst({
      where: eq(users.id, invoice.buyerId),
      with: {
        buyerProfile: true
      }
    });

    if (!buyerResult) {
      throw new KredXServiceError('Buyer not found', 'BUYER_NOT_FOUND');
    }

    // Call KredX API to evaluate invoice
    const response = await axios.post(
      `${KREDX_API_URL}/invoice/evaluate`,
      {
        invoiceAmount: invoice.amount,
        invoiceDueDate: invoice.dueDate.toISOString(),
        invoiceIssueDate: invoice.issueDate.toISOString(),
        buyerDetails: {
          id: buyerResult.id,
          name: buyerResult.username,
          creditScore: buyerResult.buyerProfile?.creditScore || 0
        }
      },
      { headers: getAuthHeaders() }
    );

    logKredXActivity('KredX API evaluation response', response.data);

    // Calculate financing options based on response
    const { discountRate, processingFee } = response.data;
    const advanceAmount = invoice.amount * (1 - (discountRate / 100));
    const totalFees = (invoice.amount * (discountRate / 100)) + processingFee;
    const netAmount = advanceAmount - processingFee;

    const financingOptions: FinancingOptions = {
      discountRate,
      processingFee,
      advanceAmount,
      dueDate: invoice.dueDate,
      totalFees,
      netAmount
    };

    return financingOptions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logKredXActivity('KredX API error', {
        status: error.response?.status,
        data: error.response?.data
      });
      throw new KredXServiceError(
        error.response?.data?.message || 'Failed to evaluate invoice',
        'API_ERROR',
        error.response?.data
      );
    }
    
    logKredXActivity('KredX service error', error);
    throw new KredXServiceError(
      'Failed to evaluate invoice',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Submits invoice for financing
 * @param invoiceId - The ID of the invoice to finance
 * @param supplierId - The ID of the supplier requesting financing
 * @returns Transaction details if successful
 */
export async function financeInvoice(invoiceId: string, supplierId: number): Promise<any> {
  try {
    logKredXActivity('Financing invoice', { invoiceId, supplierId });

    // Fetch invoice details
    const invoiceResult = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });

    if (!invoiceResult) {
      throw new KredXServiceError('Invoice not found', 'INVOICE_NOT_FOUND');
    }

    // Verify supplier owns this invoice
    if (invoiceResult.supplierId !== supplierId) {
      throw new KredXServiceError('Supplier does not own this invoice', 'UNAUTHORIZED');
    }

    // Call KredX API to finance invoice
    const response = await axios.post(
      `${KREDX_API_URL}/invoice/finance`,
      {
        invoiceId,
        supplierId,
        invoiceAmount: invoiceResult.amount,
        invoiceDueDate: invoiceResult.dueDate.toISOString(),
        paymentDetails: {
          accountNumber: invoiceResult.accountNumber,
          bankName: invoiceResult.bankName,
          ifscCode: invoiceResult.ifscCode
        }
      },
      { headers: getAuthHeaders() }
    );

    logKredXActivity('KredX API finance response', response.data);

    // Create transaction record in database
    const transactionId = randomUUID();
    await db.insert(transactions).values({
      id: transactionId,
      userId: supplierId,
      amount: response.data.advanceAmount,
      type: 'KREDX_FINANCING',
      status: 'COMPLETED',
      referenceId: invoiceId,
      description: `KredX financing for invoice ${invoiceResult.invoiceNumber}`,
      timestamp: new Date(),
      metadata: JSON.stringify(response.data)
    });

    // Update invoice status
    await db.update(invoices)
      .set({ 
        status: 'FINANCED',
        financedAmount: response.data.advanceAmount,
        financedDate: new Date()
      })
      .where(eq(invoices.id, invoiceId));

    return {
      transactionId,
      invoiceId,
      advanceAmount: response.data.advanceAmount,
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logKredXActivity('KredX API error', {
        status: error.response?.status,
        data: error.response?.data
      });
      throw new KredXServiceError(
        error.response?.data?.message || 'Failed to finance invoice',
        'API_ERROR',
        error.response?.data
      );
    }
    
    logKredXActivity('KredX service error', error);
    throw new KredXServiceError(
      'Failed to finance invoice',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Tracks buyer payment for financed invoice
 * @param invoiceId - The ID of the invoice that was paid
 * @param buyerId - The ID of the buyer making the payment
 * @param amount - The amount that was paid
 * @returns Payment confirmation details
 */
export async function trackInvoicePayment(
  invoiceId: string, 
  buyerId: number, 
  amount: number
): Promise<any> {
  try {
    logKredXActivity('Tracking invoice payment', { invoiceId, buyerId, amount });

    // Fetch invoice details
    const invoiceResult = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });

    if (!invoiceResult) {
      throw new KredXServiceError('Invoice not found', 'INVOICE_NOT_FOUND');
    }

    // Verify buyer is responsible for this invoice
    if (invoiceResult.buyerId !== buyerId) {
      throw new KredXServiceError('Buyer does not own this invoice', 'UNAUTHORIZED');
    }

    // Call KredX API to record payment
    const response = await axios.post(
      `${KREDX_API_URL}/invoice/payment`,
      {
        invoiceId,
        buyerId,
        paymentAmount: amount,
        paymentDate: new Date().toISOString()
      },
      { headers: getAuthHeaders() }
    );

    logKredXActivity('KredX API payment response', response.data);

    // Create transaction record in database
    const transactionId = randomUUID();
    await db.insert(transactions).values({
      id: transactionId,
      userId: buyerId,
      amount: amount,
      type: 'KREDX_PAYMENT',
      status: 'COMPLETED',
      referenceId: invoiceId,
      description: `Payment for financed invoice ${invoiceResult.invoiceNumber}`,
      timestamp: new Date(),
      metadata: JSON.stringify(response.data)
    });

    // Update invoice status
    await db.update(invoices)
      .set({ 
        status: 'PAID',
        paidAmount: amount,
        paidDate: new Date()
      })
      .where(eq(invoices.id, invoiceId));

    return {
      transactionId,
      invoiceId,
      paymentAmount: amount,
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logKredXActivity('KredX API error', {
        status: error.response?.status,
        data: error.response?.data
      });
      throw new KredXServiceError(
        error.response?.data?.message || 'Failed to track invoice payment',
        'API_ERROR',
        error.response?.data
      );
    }
    
    logKredXActivity('KredX service error', error);
    throw new KredXServiceError(
      'Failed to track invoice payment',
      'SERVICE_ERROR',
      error
    );
  }
}

/**
 * Gets financing history for a supplier
 * @param supplierId - The ID of the supplier
 * @returns Financing history records
 */
export async function getFinancingHistory(supplierId: number): Promise<any[]> {
  try {
    logKredXActivity('Getting financing history', { supplierId });

    // Query database for financed invoices
    const financedInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.supplierId, supplierId),
        eq(invoices.status, 'FINANCED')
      ),
      orderBy: [sql`"financedDate" DESC`]
    });

    // Get associated transactions
    const transactions = await Promise.all(
      financedInvoices.map(async (invoice) => {
        const txn = await db.query.transactions.findFirst({
          where: and(
            eq(transactions.userId, supplierId),
            eq(transactions.referenceId, invoice.id),
            eq(transactions.type, 'KREDX_FINANCING')
          )
        });
        
        return {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          buyerId: invoice.buyerId,
          originalAmount: invoice.amount,
          financedAmount: invoice.financedAmount,
          financedDate: invoice.financedDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          transactionId: txn?.id,
          transactionTimestamp: txn?.timestamp
        };
      })
    );

    return transactions;
  } catch (error) {
    logKredXActivity('Error getting financing history', error);
    throw new KredXServiceError(
      'Failed to get financing history',
      'SERVICE_ERROR',
      error
    );
  }
}

export default {
  evaluateInvoice,
  financeInvoice,
  trackInvoicePayment,
  getFinancingHistory
};
