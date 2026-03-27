export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  notes?: Record<string, any>;
}

export interface PaymentVerification {
  id: string;
  status: string;
  verified: boolean;
  amount?: number;
  currency?: string;
}

export class MockPaymentProvider {
  private orders: Map<string, PaymentOrder> = new Map();
  private payments: Map<string, PaymentVerification> = new Map();

  createOrder(options: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, any>;
  }): PaymentOrder {
    const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const order: PaymentOrder = {
      id: orderId,
      amount: options.amount,
      currency: options.currency || 'INR',
      status: 'created',
      receipt: options.receipt || `mock_receipt_${Date.now()}`,
      notes: options.notes,
    };

    this.orders.set(orderId, order);

    console.log('🔧 Mock Payment Provider: Created order', order);

    return order;
  }

  verifyPayment(paymentId: string): PaymentVerification {
    // Simulate payment verification
    const verification: PaymentVerification = {
      id: paymentId,
      status: 'success',
      verified: true,
      amount: Math.floor(Math.random() * 10000) + 1000, // Random amount between 1000-11000
      currency: 'INR',
    };

    this.payments.set(paymentId, verification);

    console.log('🔧 Mock Payment Provider: Verified payment', verification);

    return verification;
  }

  createRazorpayXDeposit(amount: number, transactionId: string): Promise<any> {
    return Promise.resolve({
      id: `mock_deposit_${Date.now()}`,
      amount,
      transactionId,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  }

  createEscrowAccount(data: {
    buyerId: string;
    sellerId: string;
    amount: number;
    currency?: string;
  }): Promise<any> {
    return Promise.resolve({
      id: `mock_escrow_${Date.now()}`,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      amount: data.amount,
      currency: data.currency || 'INR',
      status: 'created',
      timestamp: new Date().toISOString(),
    });
  }

  releaseEscrowFunds(escrowId: string): Promise<any> {
    return Promise.resolve({
      id: escrowId,
      status: 'released',
      timestamp: new Date().toISOString(),
    });
  }

  processDirectPayment(data: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    currency?: string;
  }): Promise<any> {
    return Promise.resolve({
      id: `mock_direct_${Date.now()}`,
      fromWalletId: data.fromWalletId,
      toWalletId: data.toWalletId,
      amount: data.amount,
      currency: data.currency || 'INR',
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  }

  initiateWithdrawal(data: { walletId: string; amount: number; bankDetails?: any }): Promise<any> {
    return Promise.resolve({
      id: `mock_withdrawal_${Date.now()}`,
      walletId: data.walletId,
      amount: data.amount,
      status: 'initiated',
      timestamp: new Date().toISOString(),
    });
  }

  // Get all mock orders for debugging
  getOrders(): PaymentOrder[] {
    return Array.from(this.orders.values());
  }

  // Get all mock payments for debugging
  getPayments(): PaymentVerification[] {
    return Array.from(this.payments.values());
  }

  // Clear mock data (useful for testing)
  clearData(): void {
    this.orders.clear();
    this.payments.clear();
  }
}

// Export singleton instance
export const mockPaymentProvider = new MockPaymentProvider();
