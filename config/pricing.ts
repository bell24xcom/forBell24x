export const PRICING = {
  LEAD_UNLOCK: 500, // ₹500 per lead
  CREDIT_PACKAGES: {
    STARTER: { credits: 2, price: 1000 },
    PRO: { credits: 12, price: 5000 },
    ENTERPRISE: { credits: 30, price: 10000 }
  },
  COMMISSION: {
    BROKERAGE: 0.02, // 2% on deals
    HIGH_VALUE: 0.05 // 5% on ₹10L+ deals
  }
};

export const getPackageByKey = (key: string) => {
  return PRICING.CREDIT_PACKAGES[key.toUpperCase() as keyof typeof PRICING.CREDIT_PACKAGES];
};

export const calculateCommission = (dealValue: number) => {
  if (dealValue >= 1000000) { // ₹10L+
    return dealValue * PRICING.COMMISSION.HIGH_VALUE;
  }
  return dealValue * PRICING.COMMISSION.BROKERAGE;
};
