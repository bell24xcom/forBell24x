/**
 * Bell24H Security Middleware
 *
 * Comprehensive security middleware for API routes
 * Integrates rate limiting, security headers, CSRF protection, and more
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  globalRateLimiter,
  rateLimitUtils,
  RATE_LIMIT_CONFIGS,
  SECURITY_RATE_LIMITS,
} from './rate-limiter';
import { globalSecurityHeaders, securityUtils } from './security-headers';

export interface SecurityMiddlewareConfig {
  rateLimiting?: {
    enabled: boolean;
    tier?: 'free' | 'pro' | 'enterprise' | 'admin';
    customConfig?: any;
  };
  cors?: {
    enabled: boolean;
    origins?: string[];
  };
  csrf?: {
    enabled: boolean;
    methods?: string[];
  };
  apiKeyValidation?: {
    enabled: boolean;
    required: boolean;
  };
  ipWhitelist?: {
    enabled: boolean;
    allowedIPs?: string[];
  };
  botDetection?: {
    enabled: boolean;
    allowBots?: boolean;
  };
  requestLogging?: {
    enabled: boolean;
    logLevel?: 'info' | 'warn' | 'error';
  };
}

export interface SecurityContext {
  ip: string;
  userAgent: string;
  origin: string;
  method: string;
  path: string;
  apiKey?: string;
  userId?: string;
  tier?: 'free' | 'pro' | 'enterprise' | 'admin';
  isBot: boolean;
  requestId: string;
  timestamp: number;
}

export interface SecurityResult {
  allowed: boolean;
  response?: NextResponse;
  context: SecurityContext;
  rateLimitInfo?: any;
  securityHeaders?: Record<string, string>;
  errors?: string[];
}

// Default middleware configuration
const DEFAULT_MIDDLEWARE_CONFIG: SecurityMiddlewareConfig = {
  rateLimiting: {
    enabled: true,
    tier: 'free',
  },
  cors: {
    enabled: true,
    origins:
      process.env.NODE_ENV === 'production'
        ? ['https://bell24h.com', 'https://www.bell24h.com', 'https://app.bell24h.com']
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
  csrf: {
    enabled: true,
    methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
  },
  apiKeyValidation: {
    enabled: true,
    required: false,
  },
  ipWhitelist: {
    enabled: false,
    allowedIPs: [],
  },
  botDetection: {
    enabled: true,
    allowBots: false,
  },
  requestLogging: {
    enabled: true,
    logLevel: 'info',
  },
};

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;

  constructor(config?: SecurityMiddlewareConfig) {
    this.config = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config };
  }

  /**
   * Main security middleware function
   */
  async protect(request: NextRequest, config?: SecurityMiddlewareConfig): Promise<SecurityResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const effectiveConfig = { ...this.config, ...config };

    // Extract security context
    const context = this.extractSecurityContext(request);

    // Generate security headers
    const securityHeaders = globalSecurityHeaders.generateSecurityHeaders(context.origin);
    securityHeaders['X-Response-Time'] = '0'; // Will be updated at the end

    // Log request if enabled
    if (effectiveConfig.requestLogging?.enabled) {
      this.logRequest(context, effectiveConfig.requestLogging.logLevel || 'info');
    }

    // 1. Check IP whitelist
    if (effectiveConfig.ipWhitelist?.enabled) {
      if (!this.checkIPWhitelist(context.ip, effectiveConfig.ipWhitelist.allowedIPs || [])) {
        errors.push('IP not whitelisted');
        return {
          allowed: false,
          response: this.createErrorResponse(403, 'Access denied: IP not allowed', securityHeaders),
          context,
          errors,
        };
      }
    }

    // 2. Bot detection
    if (effectiveConfig.botDetection?.enabled && !effectiveConfig.botDetection.allowBots) {
      if (context.isBot) {
        errors.push('Bot detected');
        return {
          allowed: false,
          response: this.createErrorResponse(403, 'Access denied: Bot detected', securityHeaders),
          context,
          errors,
        };
      }
    }

    // 3. CORS preflight handling
    if (context.method === 'OPTIONS' && effectiveConfig.cors?.enabled) {
      const corsResponse = new NextResponse(null, {
        status: 200,
        headers: securityHeaders,
      });

      return {
        allowed: true,
        response: corsResponse,
        context,
        securityHeaders,
      };
    }

    // 4. API key validation
    if (effectiveConfig.apiKeyValidation?.enabled && effectiveConfig.apiKeyValidation.required) {
      if (!context.apiKey) {
        errors.push('API key missing');
        return {
          allowed: false,
          response: this.createErrorResponse(401, 'API key required', securityHeaders),
          context,
          errors,
        };
      }

      if (!globalSecurityHeaders.validateAPIKey(context.apiKey)) {
        errors.push('Invalid API key');
        return {
          allowed: false,
          response: this.createErrorResponse(401, 'Invalid API key', securityHeaders),
          context,
          errors,
        };
      }
    }

    // 5. Rate limiting
    let rateLimitInfo = null;
    if (effectiveConfig.rateLimiting?.enabled) {
      const rateLimitResult = await this.checkRateLimit(context, effectiveConfig.rateLimiting);

      if (!rateLimitResult.allowed) {
        errors.push('Rate limit exceeded');
        const rateLimitHeaders = rateLimitUtils.getRateLimitHeaders(rateLimitResult);

        return {
          allowed: false,
          response: this.createErrorResponse(429, 'Rate limit exceeded', {
            ...securityHeaders,
            ...rateLimitHeaders,
          }),
          context,
          rateLimitInfo: rateLimitResult,
          errors,
        };
      }

      rateLimitInfo = rateLimitResult;

      // Add rate limit headers to response
      const rateLimitHeaders = rateLimitUtils.getRateLimitHeaders(rateLimitResult);
      Object.assign(securityHeaders, rateLimitHeaders);
    }

    // 6. CSRF protection
    if (effectiveConfig.csrf?.enabled) {
      const csrfMethods = effectiveConfig.csrf.methods || ['POST', 'PUT', 'DELETE', 'PATCH'];

      if (csrfMethods.includes(context.method)) {
        const csrfToken = request.headers.get('X-CSRF-Token');
        const csrfCookie = request.cookies.get('_csrf')?.value;

        if (!globalSecurityHeaders.validateCSRFToken(csrfToken || '', csrfCookie)) {
          errors.push('CSRF token invalid');
          return {
            allowed: false,
            response: this.createErrorResponse(403, 'CSRF token invalid', securityHeaders),
            context,
            errors,
          };
        }
      }
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;
    securityHeaders['X-Response-Time'] = `${responseTime}ms`;

    return {
      allowed: true,
      context,
      rateLimitInfo,
      securityHeaders,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Extract security context from request
   */
  private extractSecurityContext(request: NextRequest): SecurityContext {
    const ip = securityUtils.extractIP(request.headers);
    const userAgent = request.headers.get('user-agent') || '';
    const origin = request.headers.get('origin') || '';
    const method = request.method;
    const path = request.nextUrl.pathname;
    const apiKey =
      request.headers.get('X-API-Key') ||
      request.headers.get('Authorization')?.replace('Bearer ', '');
    const userId = request.headers.get('X-User-ID');
    const isBot = securityUtils.isBot(userAgent);
    const requestId = globalSecurityHeaders.generateSecurityHeaders()['X-Request-ID'];

    // Determine user tier (this would normally come from user data)
    let tier: 'free' | 'pro' | 'enterprise' | 'admin' = 'free';
    if (apiKey) {
      if (apiKey.startsWith('admin_')) tier = 'admin';
      else if (apiKey.startsWith('enterprise_')) tier = 'enterprise';
      else if (apiKey.startsWith('pro_')) tier = 'pro';
    }

    return {
      ip,
      userAgent,
      origin,
      method,
      path,
      apiKey,
      userId: userId || undefined,
      tier,
      isBot,
      requestId,
      timestamp: Date.now(),
    };
  }

  /**
   * Check IP whitelist
   */
  private checkIPWhitelist(ip: string, allowedIPs: string[]): boolean {
    if (allowedIPs.length === 0) return true;

    // Check for exact match
    if (allowedIPs.includes(ip)) return true;

    // Check for CIDR ranges (basic implementation)
    for (const allowedIP of allowedIPs) {
      if (allowedIP.includes('/')) {
        // This is a basic CIDR check - in production, use a proper IP library
        const [network, prefixLength] = allowedIP.split('/');
        // Simplified CIDR matching logic would go here
      }
    }

    return false;
  }

  /**
   * Check rate limit
   */
  private async checkRateLimit(context: SecurityContext, rateLimitConfig: any): Promise<any> {
    const key = context.userId
      ? rateLimitUtils.generateUserKey(context.userId)
      : rateLimitUtils.generateIPKey(context.ip, context.userAgent);

    // Determine rate limit configuration
    let config;

    // Check if it's a security-sensitive endpoint
    if (context.path.includes('/auth/login') || context.path.includes('/auth/signin')) {
      config = SECURITY_RATE_LIMITS.passwordReset;
    } else if (context.path.includes('/auth/register') || context.path.includes('/auth/signup')) {
      config = SECURITY_RATE_LIMITS.accountCreation;
    } else if (context.path.includes('/api/gdpr/export')) {
      config = SECURITY_RATE_LIMITS.dataExport;
    } else if (context.path.includes('/api/gdpr/deletion')) {
      config = SECURITY_RATE_LIMITS.dataDeletion;
    } else {
      // Use tier-based rate limiting
      const tierConfig = rateLimitUtils.getUserTierConfig(context.tier || 'free');

      if (context.path.includes('/api/search')) {
        config = tierConfig.search;
      } else if (context.path.includes('/api/upload')) {
        config = tierConfig.upload;
      } else if (context.path.includes('/api/rfq')) {
        config = tierConfig.rfq;
      } else {
        config = tierConfig.api;
      }
    }

    return await globalRateLimiter.checkLimit(key, config, context.tier);
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    status: number,
    message: string,
    headers: Record<string, string>
  ): NextResponse {
    const errorResponse = {
      error: {
        message,
        code: status,
        timestamp: new Date().toISOString(),
        requestId: headers['X-Request-ID'],
      },
    };

    return new NextResponse(JSON.stringify(errorResponse), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  /**
   * Log request
   */
  private logRequest(context: SecurityContext, logLevel: 'info' | 'warn' | 'error'): void {
    const logData = {
      requestId: context.requestId,
      timestamp: new Date(context.timestamp).toISOString(),
      method: context.method,
      path: context.path,
      ip: context.ip,
      userAgent: context.userAgent,
      tier: context.tier,
      isBot: context.isBot,
      ...(context.userId && { userId: context.userId }),
      ...(context.apiKey && { apiKeyPrefix: context.apiKey.substring(0, 8) + '...' }),
    };

    switch (logLevel) {
      case 'info':
        console.log('🔐 Security Middleware:', JSON.stringify(logData, null, 2));
        break;
      case 'warn':
        console.warn('⚠️  Security Warning:', JSON.stringify(logData, null, 2));
        break;
      case 'error':
        console.error('❌ Security Error:', JSON.stringify(logData, null, 2));
        break;
    }
  }
}

// Utility functions for route protection
export const securityMiddleware = new SecurityMiddleware();

/**
 * Protect API route with security middleware
 */
export function withSecurity(config?: SecurityMiddlewareConfig) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest) {
      // Apply security middleware
      const securityResult = await securityMiddleware.protect(request, config);

      // If not allowed, return error response
      if (!securityResult.allowed) {
        return securityResult.response!;
      }

      // If it's a CORS preflight, return the response
      if (securityResult.response && request.method === 'OPTIONS') {
        return securityResult.response;
      }

      // Call the original handler
      const response = await handler(request);

      // Add security headers to response
      if (securityResult.securityHeaders) {
        Object.entries(securityResult.securityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return response;
    };
  };
}

/**
 * Create middleware for specific endpoint types
 */
export const createSecurityMiddleware = {
  /**
   * Standard API protection
   */
  api: (config?: SecurityMiddlewareConfig) =>
    withSecurity({
      rateLimiting: { enabled: true, tier: 'free' },
      cors: { enabled: true },
      csrf: { enabled: false }, // Usually disabled for API endpoints
      apiKeyValidation: { enabled: false, required: false },
      botDetection: { enabled: true, allowBots: true },
      requestLogging: { enabled: true, logLevel: 'info' },
      ...config,
    }),

  /**
   * Authentication endpoints protection
   */
  auth: (config?: SecurityMiddlewareConfig) =>
    withSecurity({
      rateLimiting: { enabled: true, tier: 'free' },
      cors: { enabled: true },
      csrf: { enabled: true },
      apiKeyValidation: { enabled: false, required: false },
      botDetection: { enabled: true, allowBots: false },
      requestLogging: { enabled: true, logLevel: 'warn' },
      ...config,
    }),

  /**
   * Admin endpoints protection
   */
  admin: (config?: SecurityMiddlewareConfig) =>
    withSecurity({
      rateLimiting: { enabled: true, tier: 'admin' },
      cors: { enabled: true },
      csrf: { enabled: true },
      apiKeyValidation: { enabled: true, required: true },
      botDetection: { enabled: true, allowBots: false },
      requestLogging: { enabled: true, logLevel: 'warn' },
      ...config,
    }),

  /**
   * Public endpoints protection
   */
  public: (config?: SecurityMiddlewareConfig) =>
    withSecurity({
      rateLimiting: { enabled: true, tier: 'free' },
      cors: { enabled: true },
      csrf: { enabled: false },
      apiKeyValidation: { enabled: false, required: false },
      botDetection: { enabled: true, allowBots: true },
      requestLogging: { enabled: true, logLevel: 'info' },
      ...config,
    }),
};

// Export commonly used configurations
export const SECURITY_CONFIGS = {
  API_STANDARD: {
    rateLimiting: { enabled: true, tier: 'free' as const },
    cors: { enabled: true },
    csrf: { enabled: false },
    apiKeyValidation: { enabled: false, required: false },
    botDetection: { enabled: true, allowBots: true },
    requestLogging: { enabled: true, logLevel: 'info' as const },
  },

  API_AUTHENTICATED: {
    rateLimiting: { enabled: true, tier: 'pro' as const },
    cors: { enabled: true },
    csrf: { enabled: true },
    apiKeyValidation: { enabled: true, required: true },
    botDetection: { enabled: true, allowBots: false },
    requestLogging: { enabled: true, logLevel: 'info' as const },
  },

  API_ADMIN: {
    rateLimiting: { enabled: true, tier: 'admin' as const },
    cors: { enabled: true },
    csrf: { enabled: true },
    apiKeyValidation: { enabled: true, required: true },
    botDetection: { enabled: true, allowBots: false },
    requestLogging: { enabled: true, logLevel: 'warn' as const },
  },
};
