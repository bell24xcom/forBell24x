import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  limitations: string[];
  limits: {
    rfqs: number;
    suppliers: number;
    apiCalls: number;
    storage: number; // in GB
  };
  aiFeatures: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  analytics: boolean;
  escrowProtection: boolean;
  voiceRFQ: boolean;
  videoRFQ: boolean;
  hindiSupport: boolean;
  gstVerification: boolean;
  trustScoring: boolean;
  mobileApp: boolean;
  whiteLabel: boolean;
  dedicatedManager: boolean;
  customIntegrations: boolean;
  sla: string;
  uptime: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    currency: '₹',
    period: 'month',
    features: [
      'Up to 5 RFQs per month',
      'Basic supplier matching',
      'Email support',
      'Mobile app access',
      'Basic analytics',
      'GST verification',
      'Text RFQ only'
    ],
    limitations: [
      'Limited AI features',
      'No priority support',
      'Basic reporting only'
    ],
    limits: {
      rfqs: 5,
      suppliers: 50,
      apiCalls: 100,
      storage: 1
    },
    aiFeatures: false,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
    analytics: true,
    escrowProtection: false,
    voiceRFQ: false,
    videoRFQ: false,
    hindiSupport: false,
    gstVerification: true,
    trustScoring: false,
    mobileApp: true,
    whiteLabel: false,
    dedicatedManager: false,
    customIntegrations: false,
    sla: '24 hours',
    uptime: '99.5%'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    currency: '₹',
    period: 'month',
    features: [
      'Up to 50 RFQs per month',
      'Advanced AI matching',
      'Voice & Video RFQs',
      'Priority support',
      'Advanced analytics',
      'Escrow protection',
      'Hindi language support',
      'Trust scoring',
      'API access',
      'Custom integrations'
    ],
    limitations: [
      'Limited custom branding',
      'Standard SLA'
    ],
    limits: {
      rfqs: 50,
      suppliers: 500,
      apiCalls: 10000,
      storage: 10
    },
    aiFeatures: true,
    prioritySupport: true,
    customDomain: false,
    apiAccess: true,
    analytics: true,
    escrowProtection: true,
    voiceRFQ: true,
    videoRFQ: true,
    hindiSupport: true,
    gstVerification: true,
    trustScoring: true,
    mobileApp: true,
    whiteLabel: false,
    dedicatedManager: false,
    customIntegrations: true,
    sla: '12 hours',
    uptime: '99.9%'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    currency: '₹',
    period: 'month',
    features: [
      'Unlimited RFQs',
      'Full AI suite with SHAP/LIME',
      'White-label solution',
      'Dedicated account manager',
      'Custom domain',
      'Advanced reporting',
      'Full escrow protection',
      'Multi-language support',
      'Custom integrations',
      'SLA guarantee',
      'Training & onboarding',
      '24/7 phone support'
    ],
    limitations: [],
    limits: {
      rfqs: -1, // Unlimited
      suppliers: -1, // Unlimited
      apiCalls: -1, // Unlimited
      storage: 100
    },
    aiFeatures: true,
    prioritySupport: true,
    customDomain: true,
    apiAccess: true,
    analytics: true,
    escrowProtection: true,
    voiceRFQ: true,
    videoRFQ: true,
    hindiSupport: true,
    gstVerification: true,
    trustScoring: true,
    mobileApp: true,
    whiteLabel: true,
    dedicatedManager: true,
    customIntegrations: true,
    sla: '4 hours',
    uptime: '99.99%'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const userId = searchParams.get('userId');

    if (planId) {
      // Get specific plan details
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) {
        return NextResponse.json(
          { success: false, error: 'Plan not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: plan
      });
    }

    if (userId) {
      // Get user's current subscription
      // In production, fetch from database
      const mockUserSubscription = {
        id: 'sub_123456789',
        userId: userId,
        planId: 'professional',
        status: 'active',
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        features: subscriptionPlans.find(p => p.id === 'professional')?.features || [],
        limitations: subscriptionPlans.find(p => p.id === 'professional')?.limitations || [],
        usage: {
          rfqsUsed: 23,
          rfqsLimit: 50,
          suppliersUsed: 156,
          suppliersLimit: 500,
          apiCallsUsed: 1247,
          apiCallsLimit: 10000,
          storageUsed: 2.5,
          storageLimit: 10
        },
        billing: {
          amount: 2999,
          currency: '₹',
          nextBilling: '2025-02-01',
          paymentMethod: 'Razorpay - Card ending in 4242',
          status: 'active'
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-16T12:00:00Z'
      };

      return NextResponse.json({
        success: true,
        data: mockUserSubscription
      });
    }

    // Get all plans
    return NextResponse.json({
      success: true,
      data: subscriptionPlans
    });

  } catch (error) {
    console.error('Subscription API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, planId, paymentData } = await request.json();

    switch (action) {
      case 'subscribe':
        return await handleSubscription(userId, planId, paymentData);
      
      case 'upgrade':
        return await handleUpgrade(userId, planId, paymentData);
      
      case 'downgrade':
        return await handleDowngrade(userId, planId);
      
      case 'cancel':
        return await handleCancellation(userId);
      
      case 'renew':
        return await handleRenewal(userId, paymentData);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Subscription Action Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process subscription action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleSubscription(userId: string, planId: string, paymentData: any) {
  try {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order for payment
    const orderData = {
      amount: plan.price * 100, // Convert to paise
      currency: plan.currency === '₹' ? 'INR' : plan.currency,
      receipt: `sub_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
        planName: plan.name
      }
    };

    // In production, create actual Razorpay order
    const mockOrder = {
      id: `order_${Date.now()}`,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: 'created'
    };

    // Create subscription record
    const subscription = {
      id: `sub_${Date.now()}`,
      userId: userId,
      planId: planId,
      status: 'pending_payment',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      features: plan.features,
      limitations: plan.limitations,
      usage: {
        rfqsUsed: 0,
        rfqsLimit: plan.limits.rfqs,
        suppliersUsed: 0,
        suppliersLimit: plan.limits.suppliers,
        apiCallsUsed: 0,
        apiCallsLimit: plan.limits.apiCalls,
        storageUsed: 0,
        storageLimit: plan.limits.storage
      },
      billing: {
        amount: plan.price,
        currency: plan.currency,
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: paymentData.method || 'Razorpay',
        status: 'pending'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        payment: {
          orderId: mockOrder.id,
          amount: mockOrder.amount,
          currency: mockOrder.currency,
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        }
      }
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

async function handleUpgrade(userId: string, newPlanId: string, paymentData: any) {
  // Implementation for plan upgrade
  return NextResponse.json({
    success: true,
    message: 'Plan upgrade initiated',
    data: { userId, newPlanId, status: 'upgrading' }
  });
}

async function handleDowngrade(userId: string, newPlanId: string) {
  // Implementation for plan downgrade
  return NextResponse.json({
    success: true,
    message: 'Plan downgrade initiated',
    data: { userId, newPlanId, status: 'downgrading' }
  });
}

async function handleCancellation(userId: string) {
  // Implementation for subscription cancellation
  return NextResponse.json({
    success: true,
    message: 'Subscription cancelled',
    data: { userId, status: 'cancelled' }
  });
}

async function handleRenewal(userId: string, paymentData: any) {
  // Implementation for subscription renewal
  return NextResponse.json({
    success: true,
    message: 'Subscription renewed',
    data: { userId, status: 'renewed' }
  });
}
