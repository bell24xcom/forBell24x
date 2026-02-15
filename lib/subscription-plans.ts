export const BELL24H_PLANS = {
  FREE: {
    identifier: 'bell24h_free',
    features: [
      '3_rfqs_per_month',
      'basic_matching',
      'community_access',
      'limited_support'
    ],
    price: 0,
    description: 'Perfect for trying out Bell24h',
  },

  PRO: {
    identifier: 'bell24h_pro_monthly',
    features: [
      'unlimited_rfqs',
      'ai_matching',
      'voice_rfq',
      'video_rfq',
      'priority_support',
      'advanced_analytics',
      'early_access_features'
    ],
    price: 2999, // ₹2,999/month
    description: 'For serious buyers and suppliers',
  },

  ENTERPRISE: {
    identifier: 'bell24h_enterprise_yearly',
    features: [
      'custom_ai_models',
      'api_access',
      'dedicated_support',
      'white_label',
      'custom_domain',
      'advanced_security',
      'priority_feature_requests'
    ],
    price: 299999, // ₹2,99,999/year
    description: 'For large enterprises and agencies',
  }
};

export const BELL24H_PLAN_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

export const BELL24H_FEATURE_MATRIX = {
  '3_rfqs_per_month': {
    tier: 'FREE',
    description: 'Post up to 3 RFQs per month'
  },
  'unlimited_rfqs': {
    tier: 'PRO',
    description: 'Post unlimited RFQs'
  },
  'basic_matching': {
    tier: 'FREE',
    description: 'Basic supplier matching'
  },
  'ai_matching': {
    tier: 'PRO',
    description: 'AI-powered supplier matching'
  },
  'voice_rfq': {
    tier: 'PRO',
    description: 'Voice RFQ processing'
  },
  'video_rfq': {
    tier: 'PRO',
    description: 'Video RFQ processing'
  },
  'priority_support': {
    tier: 'PRO',
    description: 'Priority email support'
  },
  'advanced_analytics': {
    tier: 'PRO',
    description: 'Advanced RFQ analytics'
  },
  'early_access_features': {
    tier: 'PRO',
    description: 'Early access to new features'
  },
  'custom_ai_models': {
    tier: 'ENTERPRISE',
    description: 'Custom AI models for your business'
  },
  'api_access': {
    tier: 'ENTERPRISE',
    description: 'Full API access'
  },
  'dedicated_support': {
    tier: 'ENTERPRISE',
    description: 'Dedicated account manager'
  },
  'white_label': {
    tier: 'ENTERPRISE',
    description: 'White-label solution'
  },
  'custom_domain': {
    tier: 'ENTERPRISE',
    description: 'Custom domain support'
  },
  'advanced_security': {
    tier: 'ENTERPRISE',
    description: 'Advanced security features'
  },
  'priority_feature_requests': {
    tier: 'ENTERPRISE',
    description: 'Priority feature requests'
  },
  'community_access': {
    tier: 'FREE',
    description: 'Access to community features'
  },
  'limited_support': {
    tier: 'FREE',
    description: 'Community support only'
  }
};