import { PaymentProvider } from '../models/PaymentModel';
import { getPaymentProviderConfig } from '../config/paymentConfig';

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedData?: any;
}

/**
 * Validate payment amount based on currency and provider
 */
export function validatePaymentAmount(
  amount: number,
  currency: string,
  provider: PaymentProvider
): PaymentValidationResult {
  const errors: string[] = [];
  const config = getPaymentProviderConfig(provider);
  
  // Basic validation
  if (isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  // Check against provider's min/max amounts
  if (amount < config.settings.minAmount) {
    errors.push(`Minimum amount is ${config.settings.minAmount} ${currency.toUpperCase()}`);
  }

  if (amount > config.settings.maxAmount) {
    errors.push(`Maximum amount is ${config.settings.maxAmount} ${currency.toUpperCase()}`);
  }

  // Validate decimal places based on currency
  const decimalPlaces = getDecimalPlaces(amount);
  const maxDecimalPlaces = getMaxDecimalPlaces(currency);
  
  if (decimalPlaces > maxDecimalPlaces) {
    errors.push(`Maximum ${maxDecimalPlaces} decimal places allowed for ${currency.toUpperCase()}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedData: {
      amount: parseFloat(amount.toFixed(maxDecimalPlaces)),
      currency: currency.toLowerCase(),
    },
  };
}

/**
 * Validate credit card details
 */
export function validateCreditCard(card: {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}): PaymentValidationResult {
  const errors: string[] = [];
  const { number, expMonth, expYear, cvc } = card;

  // Card number validation
  const cleanNumber = number.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    errors.push('Card number must be between 13 and 19 digits');
  } else if (!isValidLuhn(cleanNumber)) {
    errors.push('Invalid card number');
  }

  // Expiration date validation
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    errors.push('Card has expired');
  }

  // CVC validation
  const isAmex = /^3[47]/.test(cleanNumber);
  if (isAmex) {
    if (!/^\d{4}$/.test(cvc)) {
      errors.push('American Express cards require a 4-digit CVC');
    }
  } else if (!/^\d{3,4}$/.test(cvc)) {
    errors.push('CVC must be 3 or 4 digits');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedData: {
      number: cleanNumber,
      expMonth,
      expYear,
      cvc,
      last4: cleanNumber.slice(-4),
      brand: detectCardBrand(cleanNumber),
    },
  };
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(
  method: any,
  provider: PaymentProvider
): PaymentValidationResult {
  const errors: string[] = [];
  
  if (!method || typeof method !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid payment method'],
    };
  }

  switch (method.type) {
    case 'card':
      return validateCreditCard(method.card);
    
    case 'wallet':
      if (!method.walletType) {
        errors.push('Wallet type is required');
      }
      break;
      
    case 'bank_transfer':
      if (!method.accountNumber || !method.routingNumber) {
        errors.push('Account and routing numbers are required');
      }
      break;
      
    default:
      errors.push('Unsupported payment method');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedData: method,
  };
}

/**
 * Validate billing address
 */
export function validateBillingAddress(address: any): PaymentValidationResult {
  const errors: string[] = [];
  const requiredFields = ['line1', 'city', 'country'];
  
  if (!address || typeof address !== 'object') {
    return {
      isValid: false,
      errors: ['Billing address is required'],
    };
  }
  
  for (const field of requiredFields) {
    if (!address[field]) {
      errors.push(`${field} is required`);
    }
  }
  
  // Validate country code format (ISO 3166-1 alpha-2)
  if (address.country && !/^[A-Z]{2}$/i.test(address.country)) {
    errors.push('Invalid country code');
  }
  
  // Validate postal code if country requires it
  if (requiresPostalCode(address.country) && !address.postalCode) {
    errors.push('Postal code is required for this country');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    normalizedData: {
      ...address,
      country: address.country?.toUpperCase(),
    },
  };
}

/**
 * Get the number of decimal places in a number
 */
function getDecimalPlaces(num: number): number {
  const decimalPart = num.toString().split('.')[1];
  return decimalPart ? decimalPart.length : 0;
}

/**
 * Get maximum allowed decimal places for a currency
 */
function getMaxDecimalPlaces(currency: string): number {
  // Zero-decimal currencies
  const zeroDecimalCurrencies = [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
    'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
  ];
  
  // Three-decimal currencies
  const threeDecimalCurrencies = ['bhd', 'jod', 'kwd', 'omr', 'tnd'];
  
  const currencyCode = currency.toLowerCase();
  
  if (zeroDecimalCurrencies.includes(currencyCode)) {
    return 0;
  }
  
  if (threeDecimalCurrencies.includes(currencyCode)) {
    return 3;
  }
  
  // Default to 2 decimal places
  return 2;
}

/**
 * Check if a country requires a postal code
 */
function requiresPostalCode(countryCode: string): boolean {
  // List of countries that require postal codes
  const countriesRequiringPostalCode = [
    'US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'AU', 'JP', 'CN',
    'IN', 'BR', 'RU', 'MX', 'ZA', 'AR', 'CL', 'CO', 'PE', 'VE'
  ];
  
  return countriesRequiringPostalCode.includes(countryCode?.toUpperCase());
}

/**
 * Validate a number using the Luhn algorithm
 */
function isValidLuhn(number: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits from right to left
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);
    
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
 * Detect credit card brand from number
 */
function detectCardBrand(number: string): string {
  const cleanNumber = number.replace(/\s+/g, '');
  
  // Visa
  if (/^4/.test(cleanNumber)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(cleanNumber)) {
    return 'amex';
  }
  
  // Discover
  if (/^6(?:011|5|4[4-9]|22(?:1(?:2[6-9]|[3-9])|[2-8]|9(?:[01]|2[0-5])))/.test(cleanNumber)) {
    return 'discover';
  }
  
  // Diners Club
  if (/^3(?:0[0-5]|[68][0-9])[0-9]/.test(cleanNumber)) {
    return 'diners';
  }
  
  // JCB
  if (/^35(2[89]|[3-8][0-9])/.test(cleanNumber)) {
    return 'jcb';
  }
  
  return 'unknown';
}
