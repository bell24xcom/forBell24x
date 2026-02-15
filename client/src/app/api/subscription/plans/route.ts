import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Subscription Plans API
 * Item 24: Pro Tier Subscription System
 * 
 * Returns available subscription plans
 */

export const subscriptionPlans = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    features: [
      'Basic profile listing',
      'Up to 10 products',
      'Basic RFQ matching',
      'Email support'
    ],
    limits: {
      products: 10,
      rfqsPerMonth: 5,
      aiInsights: false,
      premiumFeatures: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1500, // ₹1,500/month
    priceYearly: 15000, // ₹15,000/year (20% discount)
    features: [
      'Unlimited products',
      'Unlimited RFQs',
      'AI-powered matching',
      'SHAP/LIME explainability',
      'Priority support',
      'Featured listing',
      'Advanced analytics',
      'API access'
    ],
    limits: {
      products: -1, // Unlimited
      rfqsPerMonth: -1, // Unlimited
      aiInsights: true,
      premiumFeatures: true
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 5000, // ₹5,000/month
    priceYearly: 50000, // ₹50,000/year
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Priority matching',
      'Advanced reporting',
      'Multi-user accounts'
    ],
    limits: {
      products: -1,
      rfqsPerMonth: -1,
      aiInsights: true,
      premiumFeatures: true,
      customFeatures: true
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      plans: subscriptionPlans,
      currentPromotion: {
        earlyAdopter: {
          active: true,
          discount: '100%',
          duration: '6 months',
          description: 'Free Pro tier for first 100 early adopters'
        }
      }
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

