import { PrismaClient } from '@prisma/client';

// Define JsonValue type that matches Prisma's JsonValue
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue; }
interface JsonArray extends Array<JsonValue> {}

const prisma = new PrismaClient();

// Main Payment interface
export interface Payment {
  id: string;
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'stripe' | 'paypal' | 'razorpay' | 'other';
  providerData: JsonValue;
  metadata: JsonValue;
  verified: boolean;
  verifiedAt: Date | null;
  lastVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed';

// Type for creating a new payment
export interface PaymentCreateInput {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  provider: 'stripe' | 'paypal' | 'razorpay' | 'other';
  providerData?: JsonValue;
  metadata?: JsonValue;
  verified?: boolean;
  verifiedAt?: Date;
  lastVerifiedAt?: Date;
}

// Type for updating a payment
export interface PaymentUpdateInput {
  status?: PaymentStatus;
  verified?: boolean;
  verifiedAt?: Date;
  lastVerifiedAt?: Date;
  providerData?: JsonValue;
  metadata?: JsonValue;
}

export const Payment = {
  async create(data: PaymentCreateInput) {
    const now = new Date();
    const payment = await prisma.payment.create({
      data: {
        ...data,
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        verified: data.verified || false,
        verifiedAt: data.verified ? data.verifiedAt || now : null,
        lastVerifiedAt: now,
        providerData: data.providerData || {},
        metadata: data.metadata || {},
      },
    });
    return payment as unknown as Payment;
  },

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
    }) as unknown as Payment | null;
  },

  async findByPaymentId(paymentId: string) {
    return prisma.payment.findUnique({
      where: { paymentId },
    }) as unknown as Payment | null;
  },

  async update(id: string, data: PaymentUpdateInput) {
    const updateData: any = { ...data };
    
    if (data.status === 'succeeded' && !data.verified) {
      updateData.verified = true;
      updateData.verifiedAt = new Date();
    }
    
    if (Object.keys(updateData).length > 0) {
      updateData.lastVerifiedAt = new Date();
    }
    
    return prisma.payment.update({
      where: { id },
      data: updateData,
    }) as unknown as Payment;
  },

  async updateByPaymentId(paymentId: string, data: PaymentUpdateInput) {
    const payment = await this.findByPaymentId(paymentId);
    if (!payment) return null;
    return this.update(payment.id, data);
  },

  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents
  },

  async verifyPayment(paymentId: string, provider: string) {
    const payment = await prisma.payment.findFirst({
      where: { paymentId, provider },
    });

    if (!payment) {
      return null;
    }

    // Update verification status
    return this.update(payment.id, {
      verified: true,
      status: 'succeeded',
      lastVerifiedAt: new Date(),
    });
  },

  async getPaymentHistory(userId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 10, offset = 0 } = options;
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments as unknown as Payment[],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + payments.length < total,
      },
    };
  },
};
