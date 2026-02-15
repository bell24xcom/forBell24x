// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

// Company name validation
export const validateCompanyName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 100;
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Currency validation
export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'];
  return validCurrencies.includes(currency.toUpperCase());
};

// Amount validation
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000000000; // Max 1 billion
};

// Date validation
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// File size validation (in bytes)
export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size > 0 && size <= maxSize;
};

// File type validation
export const validateFileType = (type: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(type.toLowerCase());
};

// Required field validation
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Length validation
export const validateLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

// Numeric range validation
export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Array validation
export const validateArray = (array: any[], minLength: number, maxLength: number): boolean => {
  return array.length >= minLength && array.length <= maxLength;
};

// Object validation
export const validateObject = (obj: any, requiredKeys: string[]): boolean => {
  return requiredKeys.every(key => obj.hasOwnProperty(key));
};

// Custom validation function type
export type ValidationFunction = (value: any) => boolean;

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validate multiple fields
export const validateFields = (
  data: Record<string, any>,
  rules: Record<string, ValidationFunction[]>
): ValidationResult => {
  const errors: string[] = [];

  Object.entries(rules).forEach(([field, validators]) => {
    validators.forEach(validator => {
      if (!validator(data[field])) {
        errors.push(`Invalid ${field}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 