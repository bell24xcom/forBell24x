import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface SecurityConfig {
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  allowedIPs?: string[];
  blockedIPs?: string[];
  rateLimitWindow: number;
  securityHeaders: Record<string, string>;
}

interface RateLimitStore {
  [key: string]: {
    requests: number[];
    lastReset: number;
  };
}

const rateLimitStore: RateLimitStore = {};

const securityConfig: SecurityConfig = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  rateLimitWindow: 60000, // 1 minute
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
};

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export function checkRateLimit(clientIP: string, endpoint: string): boolean {
  const key = `${clientIP}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - securityConfig.rateLimitWindow;
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      requests: [],
      lastReset: now
    };
  }
  
  const store = rateLimitStore[key];
  
  // Clean old requests outside the window
  store.requests = store.requests.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (store.requests.length >= securityConfig.maxRequestsPerMinute) {
    return false;
  }
  
  // Add current request
  store.requests.push(now);
  store.lastReset = now;
  
  return true;
}

export function validateRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  secret: string
): boolean {
  try {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

export function sanitizePaymentData(data: any): any {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  delete sanitized.cardNumber;
  delete sanitized.cvv;
  delete sanitized.expiryMonth;
  delete sanitized.expiryYear;
  
  // Sanitize string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key]
        .replace(/[<>\"']/g, '')
        .trim()
        .substring(0, 1000); // Limit length
    }
  });
  
  return sanitized;
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityConfig.securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

export function logSecurityEvent(
  event: string,
  details: any,
  clientIP: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    clientIP,
    details: sanitizePaymentData(details),
    userAgent: 'unknown' // Will be set by caller
  };
  
  console.log(`[SECURITY-${severity.toUpperCase()}] ${JSON.stringify(logEntry)}`);
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (Sentry, DataDog, etc.)
    // monitoringService.logSecurityEvent(logEntry);
  }
}

export function validatePaymentAmount(amount: number): boolean {
  // Minimum amount: ₹1
  // Maximum amount: ₹10,00,000 (₹10 lakhs)
  return amount >= 100 && amount <= 100000000;
}

export function validateCurrency(currency: string): boolean {
  const allowedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
  return allowedCurrencies.includes(currency.toUpperCase());
}

export function generateSecureOrderId(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(8).toString('hex');
  return `order_${timestamp}_${random}`;
}

export function maskSensitiveData(data: any): any {
  const masked = { ...data };
  
  if (masked.email) {
    const [local, domain] = masked.email.split('@');
    masked.email = `${local.substring(0, 2)}***@${domain}`;
  }
  
  if (masked.phone) {
    masked.phone = masked.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
  }
  
  if (masked.cardNumber) {
    masked.cardNumber = masked.cardNumber.replace(/\d(?=\d{4})/g, '*');
  }
  
  return masked;
}

export function detectFraudulentActivity(
  clientIP: string,
  userAgent: string,
  paymentData: any
): { isFraudulent: boolean; riskScore: number; reasons: string[] } {
  const reasons: string[] = [];
  let riskScore = 0;
  
  // Check for suspicious patterns
  if (paymentData.amount > 5000000) { // ₹5 lakhs
    riskScore += 30;
    reasons.push('High transaction amount');
  }
  
  if (paymentData.currency !== 'INR') {
    riskScore += 20;
    reasons.push('Non-INR currency');
  }
  
  // Check for rapid successive requests
  const key = `${clientIP}:payment`;
  const store = rateLimitStore[key];
  if (store && store.requests.length > 10) {
    riskScore += 40;
    reasons.push('Rapid successive payment attempts');
  }
  
  // Check for suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    riskScore += 25;
    reasons.push('Suspicious user agent');
  }
  
  // Check for known fraud patterns
  const suspiciousPatterns = [
    /test.*payment/i,
    /fraud/i,
    /hack/i
  ];
  
  const paymentDescription = JSON.stringify(paymentData);
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(paymentDescription)) {
      riskScore += 50;
      reasons.push('Suspicious payment description');
    }
  });
  
  return {
    isFraudulent: riskScore > 70,
    riskScore,
    reasons
  };
}

export function createSecurePaymentResponse(
  success: boolean,
  data: any,
  message: string,
  request: NextRequest
): NextResponse {
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  const response = NextResponse.json({
    success,
    data: maskSensitiveData(data),
    message,
    timestamp: new Date().toISOString(),
    requestId: generateSecureOrderId()
  });
  
  // Add security headers
  addSecurityHeaders(response);
  
  // Log the event
  logSecurityEvent(
    success ? 'payment_success' : 'payment_failure',
    { success, message, clientIP, userAgent },
    clientIP,
    success ? 'low' : 'medium'
  );
  
  return response;
}

// Export the main security middleware function
export function razorpaySecurityMiddleware(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const endpoint = request.nextUrl.pathname;
    
    // Check rate limiting
    if (!checkRateLimit(clientIP, endpoint)) {
      logSecurityEvent('rate_limit_exceeded', { endpoint, clientIP }, clientIP, 'high');
      
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded. Please try again later.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }
    
    // Add security headers to response
    const response = await handler(request, context);
    return addSecurityHeaders(response);
  };
}
