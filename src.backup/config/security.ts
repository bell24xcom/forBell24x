import { N8nAuthMiddleware } from '../middleware/n8nAuth';
import { logger } from '../utils/logger';

// Security configuration
export const securityConfig = {
  // API Keys
  apiKeys: {
    n8n: process.env.N8N_API_KEY,
    webhook: process.env.WEBHOOK_SECRET
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-N8N-API-KEY'],
    allowCredentials: true
  },

  // Security Headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'"
  },

  // Password Policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },

  // Audit Logging
  auditLog: {
    enabled: true,
    level: 'info',
    format: 'json'
  },

  // File Upload Security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    scanViruses: true
  },

  // API Security
  api: {
    requireApiKey: true,
    requireJwt: true,
    requireRateLimit: true,
    requireWebhookSignature: true
  }
};

// Initialize N8nAuthMiddleware
export const n8nAuth = new N8nAuthMiddleware({
  apiKey: securityConfig.apiKeys.n8n!,
  jwtSecret: securityConfig.jwt.secret!,
  rateLimit: securityConfig.rateLimit
});

// Security middleware
export const securityMiddleware = {
  // API Key verification
  verifyApiKey: n8nAuth.verifyApiKey,

  // JWT verification
  verifyJwt: n8nAuth.verifyJwt,

  // Rate limiting
  rateLimit: n8nAuth.rateLimit,

  // Webhook signature verification
  verifyWebhookSignature: n8nAuth.verifyWebhookSignature,

  // Audit logging
  auditLog: n8nAuth.auditLog,

  // CORS configuration
  corsConfig: n8nAuth.corsConfig,

  // Security headers
  securityHeaders: n8nAuth.securityHeaders,

  // Error handling
  errorHandler: n8nAuth.errorHandler
};

// Security utility functions
export const securityUtils = {
  // Generate API key
  generateApiKey: () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  },

  // Hash password
  hashPassword: async (password: string) => {
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  // Verify password
  verifyPassword: async (password: string, hash: string) => {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hash);
  },

  // Generate JWT token
  generateToken: (payload: any) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn
    });
  },

  // Verify JWT token
  verifyToken: (token: string) => {
    const jwt = require('jsonwebtoken');
    return jwt.verify(token, securityConfig.jwt.secret);
  },

  // Validate password against policy
  validatePassword: (password: string) => {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = securityConfig.passwordPolicy;

    if (password.length < minLength) {
      return false;
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      return false;
    }

    if (requireNumbers && !/\d/.test(password)) {
      return false;
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return false;
    }

    return true;
  },

  // Sanitize user input
  sanitizeInput: (input: string) => {
    const sanitizeHtml = require('sanitize-html');
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    });
  },

  // Generate CSRF token
  generateCsrfToken: () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  },

  // Verify CSRF token
  verifyCsrfToken: (token: string, storedToken: string) => {
    const crypto = require('crypto');
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(storedToken)
    );
  }
};

// Export security configuration
export default securityConfig; 