import { Purchases } from '@revenuecat/purchases-js';
import { BELL24H_PLANS } from '../lib/subscription-plans';

export class SubscriptionService {
  private purchases: any;
  private initialized = false;

  private ensureInitialized() {
    if (!this.initialized && process.env.REVENUECAT_API_KEY) {
      this.purchases = Purchases.configure({
        apiKey: process.env.REVENUECAT_API_KEY,
        appUserID: null, // Will be set when user logs in
      });
      this.initialized = true;
    }
  }

  async initializeUser(userId: string) {
    this.ensureInitialized();
    await this.purchases.identify(userId);
  }

  async getOfferings() {
    this.ensureInitialized();
    const offerings = await this.purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  }

  async purchasePlan(packageId: string) {
    const packageToPurchase = (await this.getOfferings()).find(
      (pkg: any) => pkg.identifier === packageId
    );

    if (!packageToPurchase) {
      throw new Error('Plan not found');
    }

    const { customerInfo } = await this.purchases.purchasePackage(packageToPurchase);

    return {
      success: true,
      plan: customerInfo.activeSubscriptions[0],
      expiryDate: customerInfo.expirationDate,
    };
  }

  async checkSubscriptionStatus() {
    this.ensureInitialized();
    const customerInfo = await this.purchases.getCustomerInfo();

    return {
      isActive: customerInfo.entitlements.active.pro,
      activePlan: customerInfo.activeSubscriptions[0],
      expiryDate: customerInfo.expirationDate,
    };
  }

  async handleWebhook(event: any) {
    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await this.onSubscriptionCreated(event);
        break;
      case 'RENEWAL':
        await this.onSubscriptionRenewed(event);
        break;
      case 'EXPIRATION':
        await this.onSubscriptionExpired(event);
        break;
      case 'CANCELLATION':
        await this.onSubscriptionCancelled(event);
        break;
    }
  }

  private async onSubscriptionCreated(event: any) {
    // Update user subscription in database
    // Trigger n8n workflow for welcome email
    await fetch('/api/n8n/subscription-activated', {
      method: 'POST',
      body: JSON.stringify({
        userId: event.userId,
        plan: event.plan,
        email: event.email,
        name: event.name,
      }),
    });
  }

  private async onSubscriptionRenewed(event: any) {
    // Update subscription expiry date
    // Trigger n8n workflow for renewal confirmation
  }

  private async onSubscriptionExpired(event: any) {
    // Update user status to expired
    // Trigger n8n workflow for re-engagement
  }

  private async onSubscriptionCancelled(event: any) {
    // Update user status to cancelled
    // Trigger n8n workflow for cancellation confirmation
  }
}

export const subscriptionService = new SubscriptionService();