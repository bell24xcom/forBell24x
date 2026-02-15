// Indian Currency (INR) Support and Formatting Utilities

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  position: 'before' | 'after';
}

// Supported currencies with Indian formatting
export const CURRENCIES: { [key: string]: CurrencyConfig } = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    position: 'before'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    position: 'before'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    position: 'before'
  }
};

// Default currency for Indian market
export const DEFAULT_CURRENCY = 'INR';

/**
 * Format amount in Indian currency format (1,00,000 instead of 100,000)
 */
export function formatIndianCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  showSymbol: boolean = true
): string {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  
  // Convert to string with proper decimal places
  const fixedAmount = amount.toFixed(config.decimalPlaces);
  
  // Split into integer and decimal parts
  const [integerPart, decimalPart] = fixedAmount.split('.');
  
  // Format integer part with Indian numbering system
  let formattedInteger = '';
  const length = integerPart.length;
  
  for (let i = 0; i < length; i++) {
    if (i > 0 && (length - i) % 2 === 1 && i !== length - 1) {
      formattedInteger += ',';
    }
    formattedInteger += integerPart[i];
  }
  
  // Combine with decimal part
  const formattedAmount = decimalPart 
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
  
  // Add currency symbol
  if (showSymbol) {
    return config.position === 'before'
      ? `${config.symbol}${formattedAmount}`
      : `${formattedAmount}${config.symbol}`;
  }
  
  return formattedAmount;
}

/**
 * Format amount in standard international format
 */
export function formatInternationalCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  showSymbol: boolean = true
): string {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  });
  
  return formatter.format(amount);
}

/**
 * Parse currency string back to number
 */
export function parseCurrency(
  value: string,
  currency: string = DEFAULT_CURRENCY
): number {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  
  // Remove currency symbol and spaces
  let cleanValue = value.replace(/[^\d.,]/g, '');
  
  // Handle different decimal separators
  if (config.decimalSeparator === ',') {
    cleanValue = cleanValue.replace(/\./g, '').replace(/,/g, '.');
  } else {
    cleanValue = cleanValue.replace(/,/g, '');
  }
  
  return parseFloat(cleanValue) || 0;
}

/**
 * Convert amount between currencies (simplified)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: { [key: string]: number } = {}
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Default exchange rates (in real app, these would come from an API)
  const defaultRates = {
    'USD_INR': 83.5,
    'EUR_INR': 90.2,
    'INR_USD': 1 / 83.5,
    'INR_EUR': 1 / 90.2,
    'EUR_USD': 1.08,
    'USD_EUR': 1 / 1.08
  };
  
  const rates = { ...defaultRates, ...exchangeRates };
  const rateKey = `${fromCurrency}_${toCurrency}`;
  const rate = rates[rateKey];
  
  if (!rate) {
    console.warn(`Exchange rate not found for ${rateKey}`);
    return amount;
  }
  
  return amount * rate;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  return config.symbol;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: string = DEFAULT_CURRENCY): string {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  return config.name;
}

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): boolean {
  return currency in CURRENCIES;
}

/**
 * Format price range (e.g., "₹1,000 - ₹5,000")
 */
export function formatPriceRange(
  minAmount: number,
  maxAmount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const minFormatted = formatIndianCurrency(minAmount, currency);
  const maxFormatted = formatIndianCurrency(maxAmount, currency);
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Format price with unit (e.g., "₹150 per meter")
 */
export function formatPriceWithUnit(
  amount: number,
  unit: string,
  currency: string = DEFAULT_CURRENCY
): string {
  const formattedAmount = formatIndianCurrency(amount, currency);
  return `${formattedAmount} per ${unit}`;
}

/**
 * Format large amounts in abbreviated form (e.g., "₹1.5L", "₹2.3Cr")
 */
export function formatAbbreviatedCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const symbol = getCurrencySymbol(currency);
  
  if (amount >= 10000000) { // 1 Crore
    return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `${symbol}${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatIndianCurrency(amount, currency);
  }
}

/**
 * Calculate GST amount
 */
export function calculateGST(
  amount: number,
  gstRate: number = 18, // Default 18% GST
  currency: string = DEFAULT_CURRENCY
): {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  formatted: {
    baseAmount: string;
    gstAmount: string;
    totalAmount: string;
  };
} {
  const gstAmount = (amount * gstRate) / 100;
  const totalAmount = amount + gstAmount;
  
  return {
    baseAmount: amount,
    gstAmount,
    totalAmount,
    formatted: {
      baseAmount: formatIndianCurrency(amount, currency),
      gstAmount: formatIndianCurrency(gstAmount, currency),
      totalAmount: formatIndianCurrency(totalAmount, currency)
    }
  };
}

/**
 * Format currency for display in forms
 */
export function formatCurrencyForInput(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const config = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  return amount.toFixed(config.decimalPlaces);
} 
