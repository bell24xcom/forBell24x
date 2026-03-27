'use client';

import { formatIndianCurrency, formatAbbreviatedCurrency, calculateGST } from '@/utils/currency';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  showSymbol?: boolean;
  abbreviated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  showGST?: boolean;
  gstRate?: number;
  className?: string;
}

export default function PriceDisplay({
  amount,
  currency = 'INR',
  showSymbol = true,
  abbreviated = false,
  size = 'md',
  color = 'default',
  showGST = false,
  gstRate = 18,
  className = ''
}: PriceDisplayProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-amber-600';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const formatPrice = () => {
    if (abbreviated) {
      return formatAbbreviatedCurrency(amount, currency);
    }
    return formatIndianCurrency(amount, currency, showSymbol);
  };

  const gstCalculation = showGST ? calculateGST(amount, gstRate, currency) : null;

  return (
    <div className={`font-medium ${getSizeClasses()} ${getColorClasses()} ${className}`}>
      {showGST && gstCalculation ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>Base Price:</span>
            <span>{gstCalculation.formatted.baseAmount}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>GST ({gstRate}%):</span>
            <span>{gstCalculation.formatted.gstAmount}</span>
          </div>
          <div className="flex items-center justify-between font-semibold border-t pt-1">
            <span>Total:</span>
            <span className="text-amber-600">{gstCalculation.formatted.totalAmount}</span>
          </div>
        </div>
      ) : (
        <span>{formatPrice()}</span>
      )}
    </div>
  );
}

// Specialized price display components
export function PriceRangeDisplay({
  minAmount,
  maxAmount,
  currency = 'INR',
  size = 'md',
  color = 'default',
  className = ''
}: {
  minAmount: number;
  maxAmount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-amber-600';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const minFormatted = formatIndianCurrency(minAmount, currency);
  const maxFormatted = formatIndianCurrency(maxAmount, currency);

  return (
    <div className={`font-medium ${getSizeClasses()} ${getColorClasses()} ${className}`}>
      <span>{minFormatted}</span>
      <span className="mx-2 text-gray-500">-</span>
      <span>{maxFormatted}</span>
    </div>
  );
}

export function PriceWithUnitDisplay({
  amount,
  unit,
  currency = 'INR',
  size = 'md',
  color = 'default',
  className = ''
}: {
  amount: number;
  unit: string;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-amber-600';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const formattedAmount = formatIndianCurrency(amount, currency);

  return (
    <div className={`font-medium ${getSizeClasses()} ${getColorClasses()} ${className}`}>
      <span>{formattedAmount}</span>
      <span className="text-gray-600 ml-1">per {unit}</span>
    </div>
  );
}

export function DiscountedPriceDisplay({
  originalPrice,
  discountedPrice,
  currency = 'INR',
  size = 'md',
  className = ''
}: {
  originalPrice: number;
  discountedPrice: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const discount = originalPrice - discountedPrice;
  const discountPercentage = Math.round((discount / originalPrice) * 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className={`font-semibold text-amber-600 ${getSizeClasses()}`}>
        {formatIndianCurrency(discountedPrice, currency)}
      </div>
      <div className="flex items-center space-x-2">
        <span className={`line-through text-gray-500 ${getSizeClasses()}`}>
          {formatIndianCurrency(originalPrice, currency)}
        </span>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          {discountPercentage}% OFF
        </span>
      </div>
    </div>
  );
} 
