/**
 * Format a balance amount for display
 * @param amount - Amount in smallest currency unit (e.g., paise for INR, cents for USD)
 * @param currency - Currency code (e.g., 'INR', 'USD')
 * @returns Formatted currency string
 */
export function formatBalance(amount: number, currency: string = 'INR'): string {
  // Convert from smallest unit to standard unit (e.g., paise to rupees)
  const amountInCurrency = amount / 100;
  const formatter = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amountInCurrency);
}

/**
 * Format a balance amount with symbol only (no currency code)
 * @param amount - Amount in smallest currency unit
 * @param currency - Currency code (e.g., 'INR', 'USD')
 * @returns Formatted amount with symbol (e.g., '₹500.00')
 */
export function formatBalanceWithSymbol(amount: number, currency: string = 'INR'): string {
  const amountInCurrency = amount / 100;
  const options: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const formatted = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', options).format(
    amountInCurrency
  );

  // Add currency symbol
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${formatted}`;
}

/**
 * Get the currency symbol for a given currency code
 * @param currency - Currency code (e.g., 'INR', 'USD')
 * @returns Currency symbol (e.g., '₹', '$')
 */
export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return `${currency} `;
  }
}

/**
 * Convert a standard amount to the smallest currency unit (e.g., rupees to paise)
 * @param amount - Amount in standard units (e.g., 500.50 for ₹500.50)
 * @returns Amount in smallest currency unit (e.g., 50050 for ₹500.50)
 */
export function toSmallestUnit(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert from smallest currency unit to standard amount (e.g., paise to rupees)
 * @param amount - Amount in smallest currency unit (e.g., 50050 for ₹500.50)
 * @returns Amount in standard units (e.g., 500.50 for ₹500.50)
 */
export function fromSmallestUnit(amount: number): number {
  return amount / 100;
}

/**
 * Validate if an amount is valid for the given currency
 * @param amount - Amount to validate
 * @param currency - Currency code
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateAmount(
  amount: number,
  currency: string
): { isValid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  // Convert to smallest unit and ensure it's an integer
  const amountInSmallestUnit = toSmallestUnit(amount);
  if (!Number.isInteger(amountInSmallestUnit)) {
    return {
      isValid: false,
      error: `Amount must have a maximum of ${currency === 'INR' ? '2' : '2'} decimal places`,
    };
  }

  return { isValid: true };
}
