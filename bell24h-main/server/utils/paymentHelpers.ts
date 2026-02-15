import { Payment, PaymentStatus } from '../models/PaymentModel';

/**
 * Format amount based on currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Validate payment amount
 */
export const validatePaymentAmount = (amount: number, currency: string = 'USD'): boolean => {
  if (isNaN(amount) || amount <= 0) {
    return false;
  }

  // Validate amount based on currency
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  
  // Check decimal places based on currency
  switch (currency.toUpperCase()) {
    case 'JPY':
    case 'KRW':
      return decimalPlaces <= 0; // No decimal places
    case 'BHD':
    case 'JOD':
    case 'KWD':
    case 'OMR':
    case 'TND':
      return decimalPlaces <= 3; // 3 decimal places
    default:
      return decimalPlaces <= 2; // 2 decimal places for most currencies
  }
};

/**
 * Generate a unique payment reference
 */
export const generatePaymentReference = (prefix: string = 'PAY'): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`.toUpperCase();
};

/**
 * Get payment status color
 */
export const getStatusColor = (status: PaymentStatus): string => {
  const statusColors: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
    disputed: 'bg-purple-100 text-purple-800',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Calculate fees for a payment
 */
export const calculateFees = (
  amount: number,
  provider: 'stripe' | 'paypal' | 'razorpay' | 'other',
  currency: string = 'USD'
): { fee: number; netAmount: number } => {
  // Default fee structure (2.9% + 30¢ for Stripe, 3.49% for PayPal, 2.5% for Razorpay)
  let feeRate = 0.029; // 2.9%
  let fixedFee = 30; // 30 cents

  switch (provider) {
    case 'paypal':
      feeRate = 0.0349; // 3.49%
      fixedFee = 0;
      break;
    case 'razorpay':
      feeRate = 0.025; // 2.5%
      fixedFee = 0;
      break;
    case 'other':
      feeRate = 0;
      fixedFee = 0;
      break;
    // Default is Stripe
  }

  // Convert fixed fee to the lowest currency unit (e.g., cents for USD)
  const currencyMultiplier = currency.toLowerCase() === 'jpy' ? 1 : 100;
  const fixedFeeInCurrency = fixedFee / (currency.toLowerCase() === 'jpy' ? 1 : 100);

  const fee = amount * feeRate + fixedFeeInCurrency;
  const netAmount = amount - fee;

  return {
    fee: parseFloat(fee.toFixed(2)),
    netAmount: parseFloat(netAmount.toFixed(2)),
  };
};

/**
 * Mask sensitive payment information
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars * 2) {
    return '*'.repeat(data?.length || 0);
  }
  
  const firstPart = data.substring(0, visibleChars);
  const lastPart = data.substring(data.length - visibleChars);
  return `${firstPart}${'*'.repeat(6)}${lastPart}`;
};

/**
 * Validate credit card number using Luhn algorithm
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove all non-digit characters
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Check if the number is empty or contains non-digits
  if (!cleanNumber || !/^\d+$/.test(cleanNumber)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits from right to left
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * Format expiration date
 */
export const formatExpirationDate = (month: string | number, year: string | number): string => {
  const monthStr = typeof month === 'string' ? month.padStart(2, '0') : String(month).padStart(2, '0');
  const yearStr = typeof year === 'string' ? year.slice(-2) : String(year).slice(-2);
  return `${monthStr}/${yearStr}`;
};

/**
 * Check if a card is expired
 */
export const isCardExpired = (expiryDate: Date): boolean => {
  const now = new Date();
  // Set to the first day of the next month at 00:00:00
  const expiry = new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 1);
  return now >= expiry;
};
