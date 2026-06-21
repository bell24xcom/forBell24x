// RevenueCat removed — subscriptions are handled via Razorpay + /api/payment/subscribe
// This stub keeps the revenuecat/webhook route compilable until that route is removed.

export class SubscriptionService {
  async handleWebhook(event: any) {
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'EXPIRATION':
      case 'CANCELLATION':
        break;
    }
  }
}

export const subscriptionService = new SubscriptionService();
