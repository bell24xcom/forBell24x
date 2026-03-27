/**
 * Bell24H Security Headers System
 *
 * Implements comprehensive security headers for API and application security
 * Includes CORS, CSP, HSTS, and other security measures
 */

export interface SecurityConfig {
  cors?: CORSConfig;
  csp?: CSPConfig;
  hsts?: HSTSConfig;
  rateLimiting?: boolean;
  ipWhitelist?: string[];
  apiKeyValidation?: boolean;
  csrf?: CSRFConfig;
}

export interface CORSConfig {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export interface CSPConfig {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  connectSrc?: string[];
  fontSrc?: string[];
  objectSrc?: string[];
  mediaSrc?: string[];
  frameSrc?: string[];
  childSrc?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
  formAction?: string[];
  frameAncestors?: string[];
  baseUri?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
  reportUri?: string;
  reportTo?: string;
}

export interface HSTSConfig {
  maxAge: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}

export interface CSRFConfig {
  secret: string;
  cookie?: {
    name?: string;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  };
  headerName?: string;
  ignoreMethods?: string[];
}

// Default security configurations
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://bell24h.com', 'https://www.bell24h.com', 'https://app.bell24h.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'X-CSRF-Token',
      'X-Client-Version',
      'X-Request-ID',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Request-ID',
      'X-Response-Time',
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  },

  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Needed for Next.js in development
      "'unsafe-eval'", // Needed for Next.js in development
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://connect.facebook.net',
      'https://js.stripe.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Needed for CSS-in-JS
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://res.cloudinary.com', // For image uploads
    ],
    connectSrc: [
      "'self'",
      'https://api.bell24h.com',
      'https://www.google-analytics.com',
      'https://api.stripe.com',
      'https://api.cloudinary.com',
      'wss:', // For WebSocket connections
      ...(process.env.NODE_ENV === 'development' ? ['ws:', 'http:'] : []),
    ],
    fontSrc: ["'self'", 'data:', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'", 'blob:', 'data:', 'https:'],
    frameSrc: [
      "'self'",
      'https://js.stripe.com',
      'https://www.youtube.com',
      'https://player.vimeo.com',
    ],
    childSrc: ["'self'", 'blob:'],
    workerSrc: ["'self'", 'blob:'],
    manifestSrc: ["'self'"],
    formAction: ["'self'", 'https://api.bell24h.com'],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production',
    blockAllMixedContent: process.env.NODE_ENV === 'production',
    reportUri: '/api/security/csp-report',
  },

  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  rateLimiting: true,
  apiKeyValidation: true,

  csrf: {
    secret: process.env.CSRF_SECRET || 'bell24h-csrf-secret-key',
    cookie: {
      name: '_csrf',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
    },
    headerName: 'X-CSRF-Token',
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  },
};

export class SecurityHeaders {
  private config: SecurityConfig;

  constructor(config?: SecurityConfig) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  /**
   * Generate CORS headers
   */
  generateCORSHeaders(origin?: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const corsConfig = this.config.cors;

    if (!corsConfig) return headers;

    // Handle origin
    if (corsConfig.origin) {
      if (typeof corsConfig.origin === 'boolean') {
        headers['Access-Control-Allow-Origin'] = corsConfig.origin ? '*' : '';
      } else if (typeof corsConfig.origin === 'string') {
        headers['Access-Control-Allow-Origin'] = corsConfig.origin;
      } else if (Array.isArray(corsConfig.origin) && origin) {
        if (corsConfig.origin.includes(origin)) {
          headers['Access-Control-Allow-Origin'] = origin;
        }
      }
    }

    // Handle methods
    if (corsConfig.methods) {
      headers['Access-Control-Allow-Methods'] = corsConfig.methods.join(', ');
    }

    // Handle headers
    if (corsConfig.allowedHeaders) {
      headers['Access-Control-Allow-Headers'] = corsConfig.allowedHeaders.join(', ');
    }

    if (corsConfig.exposedHeaders) {
      headers['Access-Control-Expose-Headers'] = corsConfig.exposedHeaders.join(', ');
    }

    // Handle credentials
    if (corsConfig.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    // Handle max age
    if (corsConfig.maxAge) {
      headers['Access-Control-Max-Age'] = corsConfig.maxAge.toString();
    }

    return headers;
  }

  /**
   * Generate Content Security Policy header
   */
  generateCSPHeader(): string {
    const cspConfig = this.config.csp;
    if (!cspConfig) return '';

    const directives: string[] = [];

    // Add each directive
    Object.entries(cspConfig).forEach(([key, value]) => {
      if (key === 'upgradeInsecureRequests' && value) {
        directives.push('upgrade-insecure-requests');
      } else if (key === 'blockAllMixedContent' && value) {
        directives.push('block-all-mixed-content');
      } else if (key === 'reportUri' && value) {
        directives.push(`report-uri ${value}`);
      } else if (key === 'reportTo' && value) {
        directives.push(`report-to ${value}`);
      } else if (Array.isArray(value) && value.length > 0) {
        const directiveName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        directives.push(`${directiveName} ${value.join(' ')}`);
      }
    });

    return directives.join('; ');
  }

  /**
   * Generate HSTS header
   */
  generateHSTSHeader(): string {
    const hstsConfig = this.config.hsts;
    if (!hstsConfig) return '';

    let header = `max-age=${hstsConfig.maxAge}`;

    if (hstsConfig.includeSubDomains) {
      header += '; includeSubDomains';
    }

    if (hstsConfig.preload) {
      header += '; preload';
    }

    return header;
  }

  /**
   * Generate all security headers
   */
  generateSecurityHeaders(origin?: string): Record<string, string> {
    const headers: Record<string, string> = {
      // Basic security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': this.generatePermissionsPolicy(),
      'X-DNS-Prefetch-Control': 'off',
      'X-Download-Options': 'noopen',
      'X-Permitted-Cross-Domain-Policies': 'none',

      // Custom headers
      'X-Powered-By': 'Bell24H',
      'X-API-Version': '2.1',
      'X-Request-ID': this.generateRequestId(),

      // Cache control for API responses
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
      Expires: '0',
    };

    // Add CORS headers
    Object.assign(headers, this.generateCORSHeaders(origin));

    // Add CSP header
    const csp = this.generateCSPHeader();
    if (csp) {
      headers['Content-Security-Policy'] = csp;
    }

    // Add HSTS header (only in production)
    if (process.env.NODE_ENV === 'production') {
      const hsts = this.generateHSTSHeader();
      if (hsts) {
        headers['Strict-Transport-Security'] = hsts;
      }
    }

    return headers;
  }

  /**
   * Generate Permissions Policy header
   */
  private generatePermissionsPolicy(): string {
    const policies = [
      'accelerometer=()',
      'camera=()',
      'geolocation=(self)',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=(self)',
      'payment=(self)',
      'usb=()',
      'interest-cohort=()',
    ];

    return policies.join(', ');
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `bell24h-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate API key
   */
  validateAPIKey(apiKey?: string): boolean {
    if (!this.config.apiKeyValidation || !apiKey) {
      return !this.config.apiKeyValidation; // Allow if validation is disabled
    }

    // In production, this would validate against a database
    const validApiKeys = [
      process.env.API_KEY_ADMIN,
      process.env.API_KEY_ENTERPRISE,
      process.env.API_KEY_PRO,
    ].filter(Boolean);

    return validApiKeys.includes(apiKey);
  }

  /**
   * Check if IP is allowed
   */
  isIPAllowed(ip: string): boolean {
    if (!this.config.ipWhitelist || this.config.ipWhitelist.length === 0) {
      return true; // Allow all if no whitelist
    }

    return this.config.ipWhitelist.includes(ip);
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2);
    const secret = this.config.csrf?.secret || 'default-secret';

    // In production, use a proper HMAC
    const token = Buffer.from(`${timestamp}:${random}:${secret}`).toString('base64');
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, cookie?: string): boolean {
    if (!this.config.csrf || !token) {
      return !this.config.csrf; // Allow if CSRF is disabled
    }

    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [timestamp, random, secret] = decoded.split(':');

      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 60 * 60 * 1000) {
        return false;
      }

      // Validate secret
      return secret === this.config.csrf.secret;
    } catch (error) {
      return false;
    }
  }
}

// Utility functions
export const securityUtils = {
  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input.replace(/[<>'"&]/g, char => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
  },

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Hash password (placeholder - use bcrypt in production)
   */
  hashPassword(password: string): string {
    // This is a placeholder - use bcrypt or similar in production
    return Buffer.from(password).toString('base64');
  },

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else suggestions.push('Include special characters');

    return {
      valid: score >= 4,
      score,
      suggestions,
    };
  },

  /**
   * Extract IP address from request
   */
  extractIP(headers: Headers): string {
    return (
      headers.get('x-forwarded-for')?.split(',')[0] ||
      headers.get('x-real-ip') ||
      headers.get('cf-connecting-ip') ||
      headers.get('x-client-ip') ||
      'unknown'
    );
  },

  /**
   * Check if request is from bot
   */
  isBot(userAgent?: string): boolean {
    if (!userAgent) return false;

    const botPatterns = [
      /bot/i,
      /spider/i,
      /crawler/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /postman/i,
      /insomnia/i,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  },
};

// Global security headers instance
export const globalSecurityHeaders = new SecurityHeaders();
