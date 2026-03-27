// Input validation utilities for Bell24H

export class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export const validators = {
  // Email validation
  email: (value) => {
    if (!value) throw new ValidationError('Email is required', 'email')
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new ValidationError('Please enter a valid email address', 'email')
    }
    
    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.com', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'throwaway.com'
    ]
    
    const domain = value.split('@')[1]
    if (disposableDomains.includes(domain)) {
      throw new ValidationError('Please use a valid email address', 'email')
    }
    
    return value.toLowerCase().trim()
  },

  // Password validation
  password: (value) => {
    if (!value) throw new ValidationError('Password is required', 'password')
    
    if (value.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long', 'password')
    }
    
    if (value.length > 128) {
      throw new ValidationError('Password must be less than 128 characters', 'password')
    }
    
    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ]
    
    if (weakPasswords.includes(value.toLowerCase())) {
      throw new ValidationError('Please choose a stronger password', 'password')
    }
    
    return value
  },

  // Phone number validation (Indian format)
  phone: (value) => {
    if (!value) throw new ValidationError('Phone number is required', 'phone')
    
    // Remove all non-digit characters
    const cleanPhone = value.replace(/\D/g, '')
    
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      throw new ValidationError('Please enter a valid phone number', 'phone')
    }
    
    // Check if it starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9']
    if (cleanPhone.length === 10 && !validPrefixes.includes(cleanPhone[0])) {
      throw new ValidationError('Please enter a valid Indian mobile number', 'phone')
    }
    
    return cleanPhone
  },

  // Company name validation
  companyName: (value) => {
    if (!value) throw new ValidationError('Company name is required', 'companyName')
    
    if (value.length < 2) {
      throw new ValidationError('Company name must be at least 2 characters long', 'companyName')
    }
    
    if (value.length > 100) {
      throw new ValidationError('Company name must be less than 100 characters', 'companyName')
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /on\w+\s*=/i, /data:text\/html/i
    ]
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        throw new ValidationError('Company name contains invalid characters', 'companyName')
      }
    }
    
    return value.trim()
  },

  // Name validation
  name: (value) => {
    if (!value) throw new ValidationError('Name is required', 'name')
    
    if (value.length < 2) {
      throw new ValidationError('Name must be at least 2 characters long', 'name')
    }
    
    if (value.length > 50) {
      throw new ValidationError('Name must be less than 50 characters', 'name')
    }
    
    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/
    if (!nameRegex.test(value)) {
      throw new ValidationError('Name contains invalid characters', 'name')
    }
    
    return value.trim()
  },

  // City validation
  city: (value) => {
    if (!value) throw new ValidationError('City is required', 'city')
    
    if (value.length < 2) {
      throw new ValidationError('City must be at least 2 characters long', 'city')
    }
    
    if (value.length > 50) {
      throw new ValidationError('City must be less than 50 characters', 'city')
    }
    
    return value.trim()
  },

  // State validation
  state: (value) => {
    if (!value) throw new ValidationError('State is required', 'state')
    
    if (value.length < 2) {
      throw new ValidationError('State must be at least 2 characters long', 'state')
    }
    
    if (value.length > 50) {
      throw new ValidationError('State must be less than 50 characters', 'state')
    }
    
    return value.trim()
  },

  // GSTIN validation (Indian GST Number)
  gstin: (value) => {
    if (!value) return null // GSTIN is optional
    
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    
    if (!gstinRegex.test(value)) {
      throw new ValidationError('Please enter a valid GSTIN', 'gstin')
    }
    
    return value.toUpperCase()
  },

  // PAN validation (Indian PAN Number)
  pan: (value) => {
    if (!value) return null // PAN is optional
    
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    
    if (!panRegex.test(value)) {
      throw new ValidationError('Please enter a valid PAN number', 'pan')
    }
    
    return value.toUpperCase()
  }
}

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validate form data
export const validateFormData = (data, schema) => {
  const errors = {}
  const validatedData = {}
  
  for (const [field, validator] of Object.entries(schema)) {
    try {
      const value = data[field]
      validatedData[field] = validator(value)
    } catch (error) {
      if (error instanceof ValidationError) {
        errors[error.field] = error.message
      } else {
        errors[field] = 'Validation failed'
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: validatedData
  }
}

// Rate limiting utility
export class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }
  
  isAllowed(identifier) {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }
  
  getRemainingRequests(identifier) {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    const validRequests = userRequests.filter(time => now - time < this.windowMs)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
}

// CSRF protection
export const generateCSRFToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export const validateCSRFToken = (token, storedToken) => {
  return token === storedToken
} 
