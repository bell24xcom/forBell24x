import crypto from 'crypto';
import { Request } from 'express';
import { PaymentStatus } from '../models/PaymentModel';

type PaymentProvider = 'stripe' | 'paypal' | 'razorpay';

export interface PaymentVerificationResult {
  verified: boolean;
  status: string;
  message?: string;
  data?: any;
}

export interface WebhookPayload {
  eventId: string | null;
  eventType: string | null;
  paymentId: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  metadata: Record<string, any>;
  raw: any;
}

export interface PaymentVerificationResult {
  verified: boolean;
  status: string;
  message?: string;
  data?: any;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(digest, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Parse webhook payload based on provider
 */
export function parseWebhookPayload(provider: string, payload: any) {
  switch (provider.toLowerCase()) {
    case 'stripe':
      return {
        eventId: payload.id,
        eventType: payload.type,
        paymentId: payload.data?.object?.id,
        amount: payload.data?.object?.amount,
        currency: payload.data?.object?.currency,
        status: payload.data?.object?.status,
        metadata: payload.data?.object?.metadata,
        raw: payload,
      };

    case 'paypal':
      return {
        eventId: payload.id,
        eventType: payload.event_type,
        paymentId: payload.resource?.id,
        amount: payload.resource?.amount?.value,
        currency: payload.resource?.amount?.currency_code,
        status: payload.resource?.status,
        metadata: payload.resource?.custom_id ? { customId: payload.resource.custom_id } : {},
        raw: payload,
      };

    case 'razorpay':
      return {
        eventId: payload.event_id,
        eventType: payload.event,
        paymentId: payload.payload?.payment?.entity?.id,
        amount: payload.payload?.payment?.entity?.amount,
        currency: payload.payload?.payment?.entity?.currency,
        status: payload.payload?.payment?.entity?.status,
        metadata: payload.payload?.payment?.entity?.notes || {},
        raw: payload,
      };

    default:
      return {
        eventId: null,
        eventType: null,
        paymentId: null,
        amount: null,
        currency: null,
        status: null,
        metadata: {},
        raw: payload,
      };
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    req.connection.remoteAddress ||
    ''
  );
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

/**
 * Format amount based on currency
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100); // Assuming amount is in cents
}

/**
 * Validate payment card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  // Remove all non-digit characters
  const cleanNumber = cardNumber.replace(/\D/g, '');

  // Check if the input is valid (only digits and length between 13 and 19)
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }

  // Luhn algorithm
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
}

/**
 * Mask sensitive payment information
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return data || '';
  }

  const visiblePart = data.slice(-visibleChars);
  const maskedPart = '*'.repeat(Math.max(0, data.length - visibleChars));
  return maskedPart + visiblePart;
}

/**
 * Get payment provider from request
 */
export function getPaymentProvider(provider: string): PaymentProvider | null {
  const normalized = provider.toLowerCase();
  if (['stripe', 'paypal', 'razorpay'].includes(normalized)) {
    return normalized as PaymentProvider;
  }
  return null;
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number, currency: string): boolean {
  // Ensure amount is a positive number
  if (isNaN(amount) || amount <= 0) {
    return false;
  }

  // Validate currency format (ISO 4217)
  if (!/^[A-Z]{3}$/.test(currency)) {
    return false;
  }

  // Additional currency-specific validations can be added here
  // For example, some currencies don't have decimal places
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND'];
  if (zeroDecimalCurrencies.includes(currency)) {
    return Number.isInteger(amount);
  }

  return true;
}

/**
 * Generate a secure random string
 */
export function generateSecureRandomString(length: number = 32): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Parse and validate webhook signature
 */
export function validateWebhookSignature(
  payload: any,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  try {
    const hmac = crypto.createHmac(algorithm, secret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(digest, 'hex')
    );
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

/**
 * Get expiration date from card expiry
 */
export function getCardExpiry(month: string | number, year: string | number): Date | null {
  try {
    const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
    
    // Handle 2-digit year
    const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
    
    // Create date for the last day of the expiration month
    return new Date(fullYear, monthNum, 0);
  } catch (error) {
    console.error('Error parsing card expiry:', error);
    return null;
  }
}

/**
 * Check if a card is expired
 */
export function isCardExpired(expiryDate: Date): boolean {
  const now = new Date();
  // Set to the last day of the current month at 23:59:59.999
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return expiryDate < endOfMonth;
}
