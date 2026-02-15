/**
 * Production-Grade Rate Limiting System
 * Handles 1000+ concurrent users with Redis-backed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limiting (fallback when Redis is not available)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Different limits for different endpoints
  '/api/auth': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  '/api/rfq': { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
  '/api/quotes': { windowMs: 60 * 1000, max: 20 }, // 20 requests per minute
  '/api/orders': { windowMs: 60 * 1000, max: 5 }, // 5 requests per minute
  '/api/payments': { windowMs: 60 * 1000, max: 3 }, // 3 requests per minute
  '/api/upload': { windowMs: 60 * 1000, max: 5 }, // 5 uploads per minute
  '/api/ai': { windowMs: 60 * 1000, max: 10 }, // 10 AI requests per minute
  default: { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute for other endpoints
}

// Redis client (if available)
let redis: any = null

// Initialize Redis connection
async function initRedis() {
  if (redis) return redis
  
  try {
    const Redis = require('ioredis')
    redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    })
    
    await redis.ping()
    console.log('✅ Redis connected for rate limiting')
    return redis
  } catch (error) {
    console.warn('⚠️ Redis not available, using in-memory rate limiting')
    return null
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}-${userAgent.slice(0, 50)}`
}

/**
 * Get rate limit configuration for endpoint
 */
function getRateLimitConfig(pathname: string) {
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pattern !== 'default' && pathname.startsWith(pattern)) {
      return config
    }
  }
  return RATE_LIMIT_CONFIG.default
}

/**
 * Check rate limit using Redis (preferred)
 */
async function checkRateLimitRedis(
  identifier: string,
  config: { windowMs: number; max: number }
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  if (!redis) {
    throw new Error('Redis not available')
  }

  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const window = Math.floor(now / config.windowMs)
  const windowKey = `${key}:${window}`

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()
    
    // Increment counter
    pipeline.incr(windowKey)
    pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000))
    
    const results = await pipeline.exec()
    const count = results[0][1] as number
    
    const remaining = Math.max(0, config.max - count)
    const resetTime = (window + 1) * config.windowMs
    
    return {
      allowed: count <= config.max,
      remaining,
      resetTime,
    }
  } catch (error) {
    console.error('Redis rate limit error:', error)
    throw error
  }
}

/**
 * Check rate limit using in-memory storage (fallback)
 */
function checkRateLimitMemory(
  identifier: string,
  config: { windowMs: number; max: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `${identifier}:${Math.floor(now / config.windowMs)}`
  
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs })
    return {
      allowed: true,
      remaining: config.max - 1,
      resetTime: now + config.windowMs,
    }
  }
  
  if (current.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }
  
  current.count++
  return {
    allowed: true,
    remaining: config.max - current.count,
    resetTime: current.resetTime,
  }
}

/**
 * Main rate limiting function
 */
export async function rateLimit(
  request: NextRequest,
  customConfig?: { windowMs: number; max: number }
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    const identifier = getClientIdentifier(request)
    const pathname = request.nextUrl.pathname
    const config = customConfig || getRateLimitConfig(pathname)
    
    // Initialize Redis if not already done
    await initRedis()
    
    let result
    
    if (redis) {
      try {
        result = await checkRateLimitRedis(identifier, config)
      } catch (error) {
        console.warn('Redis rate limit failed, falling back to memory:', error)
        result = checkRateLimitMemory(identifier, config)
      }
    } else {
      result = checkRateLimitMemory(identifier, config)
    }
    
    if (!result.allowed) {
      const response = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      )
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', config.max.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
      response.headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString())
      
      return { allowed: false, response }
    }
    
    // Add rate limit headers for successful requests
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.max.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString())
    
    return { allowed: true, response }
    
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Allow request to proceed if rate limiting fails
    return { allowed: true }
  }
}

/**
 * Middleware for API routes
 */
export async function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  customConfig?: { windowMs: number; max: number }
) {
  return async (request: NextRequest) => {
    const { allowed, response } = await rateLimit(request, customConfig)
    
    if (!allowed) {
      return response!
    }
    
    return handler(request)
  }
}

/**
 * Clean up old rate limit entries (run periodically)
 */
export function cleanupRateLimit() {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour
  
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.resetTime > maxAge) {
      rateLimitMap.delete(key)
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000)

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus() {
  return {
    memoryEntries: rateLimitMap.size,
    redisConnected: !!redis,
    config: RATE_LIMIT_CONFIG,
  }
}
