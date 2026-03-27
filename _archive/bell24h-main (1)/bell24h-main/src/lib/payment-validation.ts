import { z } from 'zod';

// Payment validation schemas
export const razorpayOrderSchema = z.object({
  amount: z.number()
    .min(100, 'Minimum amount is ₹1.00')
    .max(100000000, 'Maximum amount is ₹10,00,000.00'),
  currency: z.string()
    .min(3, 'Currency must be at least 3 characters')
    .max(3, 'Currency must be exactly 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency must be in uppercase (e.g., INR, USD)'),
  receipt: z.string()
    .min(1, 'Receipt ID is required')
    .max(40, 'Receipt ID must be less than 40 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Receipt ID can only contain letters, numbers, hyphens, and underscores'),
  notes: z.record(z.string()).optional(),
  partial_payment: z.boolean().optional(),
  callback_url: z.string().url().optional(),
  callback_method: z.enum(['get', 'post']).optional()
});

export const razorpayPaymentSchema = z.object({
  razorpay_payment_id: z.string()
    .min(1, 'Payment ID is required')
    .max(100, 'Payment ID must be less than 100 characters'),
  razorpay_order_id: z.string()
    .min(1, 'Order ID is required')
    .max(100, 'Order ID must be less than 100 characters'),
  razorpay_signature: z.string()
    .min(1, 'Signature is required')
    .max(200, 'Signature must be less than 200 characters')
});

export const walletTransactionSchema = z.object({
  amount: z.number()
    .min(100, 'Minimum amount is ₹1.00')
    .max(1000000, 'Maximum amount is ₹10,00,000.00'),
  type: z.enum(['deposit', 'withdrawal', 'payment', 'refund']),
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters'),
  recipient_id: z.string().optional(),
  order_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export const escrowTransactionSchema = z.object({
  amount: z.number()
    .min(1000, 'Minimum escrow amount is ₹10.00')
    .max(50000000, 'Maximum escrow amount is ₹5,00,000.00'),
  buyer_id: z.string()
    .min(1, 'Buyer ID is required'),
  seller_id: z.string()
    .min(1, 'Seller ID is required'),
  order_id: z.string()
    .min(1, 'Order ID is required'),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  delivery_terms: z.string()
    .min(1, 'Delivery terms are required')
    .max(1000, 'Delivery terms must be less than 1000 characters'),
  dispute_resolution: z.string()
    .min(1, 'Dispute resolution terms are required')
    .max(1000, 'Dispute resolution terms must be less than 1000 characters')
});

// Input sanitization functions
export function sanitizePaymentInput(input: any): any {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  const sanitized: any = {};
  
  Object.keys(input).forEach(key => {
    const value = input[key];
    
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value
        .replace(/[<>\"']/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim()
        .substring(0, 1000); // Limit length
    } else if (typeof value === 'number') {
      // Validate number ranges
      if (key.includes('amount') || key.includes('price')) {
        sanitized[key] = Math.max(0, Math.min(value, 100000000)); // Max ₹10 lakhs
      } else {
        sanitized[key] = value;
      }
    } else if (typeof value === 'boolean') {
      sanitized[key] = Boolean(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, 100); // Limit array length
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizePaymentInput(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

export function validatePaymentAmount(amount: number, currency: string = 'INR'): {
  isValid: boolean;
  error?: string;
} {
  // Currency-specific validation
  const limits = {
    INR: { min: 100, max: 100000000 }, // ₹1 to ₹10 lakhs
    USD: { min: 1, max: 100000 }, // $0.01 to $1000
    EUR: { min: 1, max: 100000 }, // €0.01 to €1000
    GBP: { min: 1, max: 100000 } // £0.01 to £1000
  };

  const limit = limits[currency as keyof typeof limits] || limits.INR;

  if (amount < limit.min) {
    return {
      isValid: false,
      error: `Minimum amount is ${currency === 'INR' ? '₹' : '$'}${limit.min / (currency === 'INR' ? 100 : 100)}`
    };
  }

  if (amount > limit.max) {
    return {
      isValid: false,
      error: `Maximum amount is ${currency === 'INR' ? '₹' : '$'}${limit.max / (currency === 'INR' ? 100 : 100)}`
    };
  }

  return { isValid: true };
}

export function validatePaymentMethod(method: string): {
  isValid: boolean;
  error?: string;
} {
  const allowedMethods = [
    'card',
    'netbanking',
    'wallet',
    'upi',
    'emi',
    'paylater',
    'banktransfer'
  ];

  if (!allowedMethods.includes(method.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid payment method. Allowed methods: ${allowedMethods.join(', ')}`
    };
  }

  return { isValid: true };
}

export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
}

export function validatePhone(phone: string, country: string = 'IN'): {
  isValid: boolean;
  error?: string;
} {
  if (!phone || phone.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  if (country === 'IN') {
    // Indian phone number validation
    if (cleanPhone.length < 10 || cleanPhone.length > 10) {
      return { isValid: false, error: 'Indian phone number must be 10 digits' };
    }

    // Check if it starts with valid digits
    if (!['6', '7', '8', '9'].includes(cleanPhone[0])) {
      return { isValid: false, error: 'Indian phone number must start with 6, 7, 8, or 9' };
    }
  }

  return { isValid: true };
}

export function validatePAN(pan: string): {
  isValid: boolean;
  error?: string;
} {
  if (!pan || pan.length === 0) {
    return { isValid: false, error: 'PAN is required' };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(pan.toUpperCase())) {
    return { isValid: false, error: 'Invalid PAN format. Example: ABCDE1234F' };
  }

  return { isValid: true };
}

export function validateGST(gst: string): {
  isValid: boolean;
  error?: string;
} {
  if (!gst || gst.length === 0) {
    return { isValid: false, error: 'GST number is required' };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstRegex.test(gst.toUpperCase())) {
    return { isValid: false, error: 'Invalid GST format. Example: 07ABCDE1234F1Z5' };
  }

  return { isValid: true };
}

export function validateBankAccount(accountNumber: string): {
  isValid: boolean;
  error?: string;
} {
  if (!accountNumber || accountNumber.length === 0) {
    return { isValid: false, error: 'Bank account number is required' };
  }

  // Remove spaces and non-digits
  const cleanAccount = accountNumber.replace(/\D/g, '');

  if (cleanAccount.length < 9 || cleanAccount.length > 18) {
    return { isValid: false, error: 'Bank account number must be between 9 and 18 digits' };
  }

  return { isValid: true };
}

export function validateIFSC(ifsc: string): {
  isValid: boolean;
  error?: string;
} {
  if (!ifsc || ifsc.length === 0) {
    return { isValid: false, error: 'IFSC code is required' };
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!ifscRegex.test(ifsc.toUpperCase())) {
    return { isValid: false, error: 'Invalid IFSC format. Example: SBIN0001234' };
  }

  return { isValid: true };
}

// Comprehensive validation function
export function validatePaymentRequest(data: any): {
  isValid: boolean;
  errors: string[];
  sanitizedData: any;
} {
  const errors: string[] = [];
  let sanitizedData = sanitizePaymentInput(data);

  try {
    // Validate amount
    if (data.amount) {
      const amountValidation = validatePaymentAmount(data.amount, data.currency);
      if (!amountValidation.isValid) {
        errors.push(amountValidation.error!);
      }
    }

    // Validate payment method
    if (data.method) {
      const methodValidation = validatePaymentMethod(data.method);
      if (!methodValidation.isValid) {
        errors.push(methodValidation.error!);
      }
    }

    // Validate email
    if (data.email) {
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.error!);
      }
    }

    // Validate phone
    if (data.phone) {
      const phoneValidation = validatePhone(data.phone, data.country);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error!);
      }
    }

    // Validate PAN
    if (data.pan) {
      const panValidation = validatePAN(data.pan);
      if (!panValidation.isValid) {
        errors.push(panValidation.error!);
      }
    }

    // Validate GST
    if (data.gst) {
      const gstValidation = validateGST(data.gst);
      if (!gstValidation.isValid) {
        errors.push(gstValidation.error!);
      }
    }

    // Validate bank account
    if (data.bankAccount) {
      const bankValidation = validateBankAccount(data.bankAccount);
      if (!bankValidation.isValid) {
        errors.push(bankValidation.error!);
      }
    }

    // Validate IFSC
    if (data.ifsc) {
      const ifscValidation = validateIFSC(data.ifsc);
      if (!ifscValidation.isValid) {
        errors.push(ifscValidation.error!);
      }
    }

  } catch (error) {
    errors.push('Validation error occurred');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Rate limiting validation
export function validateRequestFrequency(
  clientIP: string,
  endpoint: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  // This would integrate with the rate limiter
  // For now, return a basic validation
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: Date.now() + windowMs
  };
}

// Security validation
export function validateSecurityHeaders(headers: Record<string, string>): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for required security headers
  const requiredHeaders = [
    'user-agent',
    'content-type',
    'x-forwarded-for'
  ];

  requiredHeaders.forEach(header => {
    if (!headers[header.toLowerCase()]) {
      warnings.push(`Missing security header: ${header}`);
    }
  });

  // Check for suspicious patterns
  const userAgent = headers['user-agent'] || '';
  if (userAgent.length < 10) {
    warnings.push('Suspicious user agent detected');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}
