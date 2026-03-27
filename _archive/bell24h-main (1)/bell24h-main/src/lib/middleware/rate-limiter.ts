import { NextRequest } from 'next/server';

// In-memory store for rate limiting (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limiting middleware for API endpoints
 * @param request - NextRequest object
 * @param key - Unique identifier for the rate limit (e.g., 'wallet-read', 'wallet-transaction')
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns RateLimitResult with success status and remaining requests
 */
export async function rateLimit(
  request: NextRequest,
  key: string,
  maxRequests: number,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): Promise<RateLimitResult> {
  const clientIP = getClientIP(request);
  const rateLimitKey = `${key}:${clientIP}`;
  const now = Date.now();

  // Get current rate limit data
  const current = rateLimitStore.get(rateLimitKey);

  if (!current || now > current.resetTime) {
    // First request or window expired
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  // Increment counter
  current.count++;
  rateLimitStore.set(rateLimitKey, current);

  return {
    success: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
  };
}

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-client-ip') ||
    'unknown'
  );
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  // Wallet operations
  'wallet-read': { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
  'wallet-transaction': { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 transactions per hour

  // Authentication
  'auth-login': { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 login attempts per 15 minutes
  'auth-register': { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour

  // API endpoints
  'api-general': { maxRequests: 1000, windowMs: 60 * 60 * 1000 }, // 1000 requests per hour
  'api-sensitive': { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 requests per hour

  // File uploads
  'file-upload': { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
} as const;

/**
 * Get rate limit configuration for a specific endpoint
 */
export function getRateLimitConfig(endpoint: keyof typeof RATE_LIMITS) {
  return RATE_LIMITS[endpoint];
}

/**
 * Enhanced rate limiter with configuration lookup
 */
export async function rateLimitWithConfig(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const config = getRateLimitConfig(endpoint);
  return rateLimit(request, endpoint, config.maxRequests, config.windowMs);
}
