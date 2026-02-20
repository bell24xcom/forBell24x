export class N8NMarketing {
  private baseUrl: string;
  private webhookPath: string;

  constructor() {
    this.baseUrl = process.env.N8N_WEBHOOK_URL || 'http://165.232.187.195:5678/webhook/';
    this.webhookPath = 'bell24h-events';
  }

  private async sendToN8N(eventType: string, data: unknown) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    try {
      const response = await fetch(`${this.baseUrl}${this.webhookPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventType, data }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      console.error('N8N webhook error:', error);
      throw error;
    }
  }

  async notifyPaymentSuccess(data: {
    orderId: string;
    amount: number;
    email: string;
    name: string;
    rfqTitle: string;
  }) {
    return this.sendToN8N('payment_success', {
      orderId: data.orderId,
      amount: data.amount,
      email: data.email,
      name: data.name,
      rfqTitle: data.rfqTitle,
      timestamp: new Date().toISOString(),
    });
  }

  async notifySubscriptionActivated(data: {
    userId: string;
    plan: string;
    email: string;
    name: string;
  }) {
    return this.sendToN8N('subscription_activated', {
      userId: data.userId,
      plan: data.plan,
      email: data.email,
      name: data.name,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyRFQPosted(data: {
    rfqId: string;
    title: string;
    category: string;
    buyerId: string;
    buyerName: string;
  }) {
    return this.sendToN8N('rfq_posted', {
      rfqId: data.rfqId,
      title: data.title,
      category: data.category,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      timestamp: new Date().toISOString(),
    });
  }

  async notifySupplierMatched(data: {
    rfqId: string;
    supplierId: string;
    supplierName: string;
    buyerId: string;
  }) {
    return this.sendToN8N('supplier_matched', {
      rfqId: data.rfqId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      buyerId: data.buyerId,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyQuoteReceived(data: {
    rfqId: string;
    quoteId: string;
    supplierId: string;
    supplierName: string;
    amount: number;
  }) {
    return this.sendToN8N('quote_received', {
      rfqId: data.rfqId,
      quoteId: data.quoteId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      amount: data.amount,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyQuoteAccepted(data: {
    rfqId: string;
    quoteId: string;
    rfqTitle: string;
    supplierId: string;
    supplierName: string;
    buyerId: string;
    buyerName: string;
    amount: number;
    confirmBy: string; // ISO date — 7 days from now
  }) {
    return this.sendToN8N('quote_accepted', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyDealCompleted(data: {
    rfqId: string;
    rfqTitle: string;
    supplierId: string;
    supplierName: string;
    buyerId: string;
    buyerName: string;
  }) {
    return this.sendToN8N('deal_completed', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

export const n8nMarketing = new N8NMarketing();