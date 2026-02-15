import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

export interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
  };
  encryption: {
    algorithm: string;
    key: string;
    iv: string;
  };
  ssl: {
    enabled: boolean;
    certPath: string;
    keyPath: string;
  };
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  limit: number;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
}

class SecurityService {
  private config: SecurityConfig;
  private rateLimiters: Map<string, any> = new Map();

  constructor() {
    this.config = {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
      },
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        key: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
        iv: process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex'),
      },
      ssl: {
        enabled: process.env.SSL_ENABLED === 'true',
        certPath: process.env.SSL_CERT_PATH || '',
        keyPath: process.env.SSL_KEY_PATH || '',
      },
    };
  }

  // Rate Limiting
  createRateLimiter(options?: Partial<SecurityConfig['rateLimit']>): any {
    const config = { ...this.config.rateLimit, ...options };

    return rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: config.message,
      standardHeaders: config.standardHeaders,
      legacyHeaders: config.legacyHeaders,
      handler: (req, res) => {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
      },
      keyGenerator: req => {
        // Use IP address or user ID for rate limiting
        return (req as any).user?.id || req.ip;
      },
      skip: req => {
        // Skip rate limiting for certain routes or users
        return req.path.startsWith('/health') || (req as any).user?.role === 'admin';
      },
    });
  }

  createCustomRateLimiter(key: string, windowMs: number, max: number, message?: string): any {
    const limiter = rateLimit({
      windowMs,
      max,
      message: message || `Rate limit exceeded for ${key}`,
      keyGenerator: () => key,
    });

    this.rateLimiters.set(key, limiter);
    return limiter;
  }

  getRateLimitInfo(req: any): RateLimitInfo | null {
    const limiter = req.rateLimit;
    if (!limiter) return null;

    return {
      remaining: limiter.remaining,
      resetTime: new Date(Date.now() + limiter.resetTime),
      limit: limiter.limit,
    };
  }

  // CORS Configuration
  getCorsConfig(): any {
    return cors({
      origin: (origin, callback) => {
        const allowedOrigins = Array.isArray(this.config.cors.origin)
          ? this.config.cors.origin
          : [this.config.cors.origin];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: this.config.cors.credentials,
      methods: this.config.cors.methods,
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
      ],
      exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    });
  }

  // Helmet Security Headers
  getHelmetConfig(): any {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          scriptSrc: ["'self'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'wss:', 'https:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });
  }

  // Data Encryption
  encrypt(data: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.config.encryption.algorithm,
      Buffer.from(this.config.encryption.key, 'hex'),
      iv
    );

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.config.encryption.algorithm,
      Buffer.from(this.config.encryption.key, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  encryptObject(obj: any): EncryptedData {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  decryptObject(encryptedData: EncryptedData): any {
    const jsonString = this.decrypt(encryptedData);
    return JSON.parse(jsonString);
  }

  // Password Hashing
  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, this.config.encryption.key, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(hashedPassword, 'hex'), Buffer.from(hash, 'hex'));
  }

  // JWT Token Security
  generateSecureToken(payload: any, expiresIn: string = '1h'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + (expiresIn === '1h' ? 3600 : parseInt(expiresIn));

    const tokenPayload = {
      ...payload,
      iat: now,
      exp,
      jti: crypto.randomBytes(16).toString('hex'),
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.config.encryption.key)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): any {
    try {
      const [header, payload, signature] = token.split('.');

      const expectedSignature = crypto
        .createHmac('sha256', this.config.encryption.key)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Input Validation and Sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // SQL Injection Prevention
  escapeSqlString(str: string): string {
    return str.replace(/'/g, "''").replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
  }

  // XSS Prevention
  escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return str.replace(/[&<>"'/]/g, match => htmlEscapes[match]);
  }

  // CSRF Protection
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateCSRFToken(token: string, storedToken: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(storedToken, 'hex'));
  }

  // File Upload Security
  validateFileUpload(file: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (file.size > maxSize) {
      errors.push('File size exceeds maximum allowed size (10MB)');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File type not allowed');
    }

    // Check for malicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs'];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (dangerousExtensions.includes(fileExtension)) {
      errors.push('File type not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Audit Logging
  logSecurityEvent(event: string, details: any, userId?: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userId,
      ip: '127.0.0.1', // In real implementation, get from request
      userAgent: 'Unknown', // In real implementation, get from request
    };

    console.log('Security Event:', logEntry);

    // In production, this would be sent to a logging service
    // or stored in a secure audit log database
  }

  // SSL/TLS Configuration
  getSSLConfig(): any {
    if (!this.config.ssl.enabled) {
      return null;
    }

    try {
      const fs = require('fs');
      return {
        cert: fs.readFileSync(this.config.ssl.certPath),
        key: fs.readFileSync(this.config.ssl.keyPath),
        ca: process.env.SSL_CA_PATH ? fs.readFileSync(process.env.SSL_CA_PATH) : undefined,
      };
    } catch (error) {
      console.error('SSL configuration error:', error);
      return null;
    }
  }

  // Security Headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    };
  }

  // API Key Validation
  validateAPIKey(apiKey: string): boolean {
    // In production, this would validate against a database
    const validKeys = process.env.VALID_API_KEYS?.split(',') || [];
    return validKeys.includes(apiKey);
  }

  generateAPIKey(): string {
    return `bell24h_${crypto.randomBytes(32).toString('hex')}`;
  }

  // Session Security
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateSession(sessionId: string, userId: string): boolean {
    // In production, this would validate against a session store
    return sessionId.length === 64 && userId.length > 0;
  }

  // Two-Factor Authentication
  generateTOTPSecret(): string {
    return crypto.randomBytes(20).toString('hex');
  }

  generateTOTPCode(secret: string): string {
    const time = Math.floor(Date.now() / 30000); // 30-second window
    const key = Buffer.from(secret, 'hex');

    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(time), 0);

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0xf;
    const code =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, '0');
  }

  verifyTOTPCode(secret: string, code: string): boolean {
    const currentCode = this.generateTOTPCode(secret);
    return code === currentCode;
  }

  // Cleanup
  cleanup(): void {
    this.rateLimiters.clear();
  }
}

export const securityService = new SecurityService();
