import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatePasswordPolicy, logSecurityEvent } from '../../middleware/security';

// Secure authentication configuration
export const AUTH_CONFIG = {
  // Session configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },

  // JWT configuration
  jwt: {
    expiresIn: '1h',
    refreshExpiresIn: '7d',
    algorithm: 'HS256' as const,
  },

  // MFA configuration
  mfa: {
    issuer: 'Bell24H',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    window: 1,
  },

  // Password policy
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Account lockout
  lockout: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    maxLockouts: 3,
    permanentLockoutDuration: 24 * 60 * 60 * 1000, // 24 hours
  },

  // API key configuration
  apiKey: {
    length: 32,
    prefix: 'bell24h_',
    expiresIn: 365 * 24 * 60 * 60 * 1000, // 1 year
  },
};

// Authentication validation schemas
export const authSchemas = {
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    mfaToken: z.string().optional(),
    rememberMe: z.boolean().optional(),
  }),

  register: z
    .object({
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
      name: z.string().min(2, 'Name must be at least 2 characters'),
      company: z.string().optional(),
      acceptTerms: z
        .boolean()
        .refine(val => val === true, 'You must accept the terms and conditions'),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),

  mfaSetup: z.object({
    userId: z.string(),
    secret: z.string(),
    token: z.string().length(6, 'MFA token must be 6 digits'),
  }),

  mfaVerify: z.object({
    token: z.string().length(6, 'MFA token must be 6 digits'),
    rememberDevice: z.boolean().optional(),
  }),

  passwordReset: z.object({
    email: z.string().email('Invalid email address'),
  }),

  passwordChange: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),

  apiKeyGenerate: z.object({
    name: z.string().min(1, 'API key name is required'),
    permissions: z.array(z.string()).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
};

// Account lockout store (use Redis in production)
const accountLockoutStore = new Map<string, { attempts: number; lockoutUntil: number }>();

// Account lockout configuration
const ACCOUNT_LOCKOUT_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  windowMs: 60 * 60 * 1000, // 1 hour
};

// Track failed login attempts
export function trackFailedLoginAttempt(identifier: string, ip: string) {
  const now = Date.now();
  const key = `${identifier}:${ip}`;

  const current = accountLockoutStore.get(key);

  if (current && current.lockoutUntil > now) {
    // Account is already locked out
    return {
      locked: true,
      remainingTime: current.lockoutUntil - now,
    };
  }

  if (current && now - current.lockoutUntil < ACCOUNT_LOCKOUT_CONFIG.windowMs) {
    // Within the window, increment attempts
    current.attempts++;

    if (current.attempts >= ACCOUNT_LOCKOUT_CONFIG.maxLoginAttempts) {
      // Lock out the account
      current.lockoutUntil = now + ACCOUNT_LOCKOUT_CONFIG.lockoutDuration;

      logSecurityEvent('account_locked', {
        identifier,
        ip,
        attempts: current.attempts,
        lockoutUntil: current.lockoutUntil,
      });

      return {
        locked: true,
        remainingTime: ACCOUNT_LOCKOUT_CONFIG.lockoutDuration,
      };
    }
  } else {
    // Reset or create new entry
    accountLockoutStore.set(key, {
      attempts: 1,
      lockoutUntil: 0,
    });
  }

  return {
    locked: false,
    attempts: current ? current.attempts : 1,
  };
}

// Reset failed login attempts on successful login
export function resetFailedLoginAttempts(identifier: string, ip: string) {
  const key = `${identifier}:${ip}`;
  accountLockoutStore.delete(key);

  logSecurityEvent('login_success', {
    identifier,
    ip,
  });
}

// Check if account is locked out
export function isAccountLockedOut(identifier: string, ip: string): boolean {
  const key = `${identifier}:${ip}`;
  const current = accountLockoutStore.get(key);

  if (!current) return false;

  const now = Date.now();

  // Clean up expired lockouts
  if (current.lockoutUntil > 0 && current.lockoutUntil < now) {
    accountLockoutStore.delete(key);
    return false;
  }

  return current.lockoutUntil > now;
}

// Enhanced password hashing with salt rounds
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Increased from default 10 for better security
  return bcrypt.hash(password, saltRounds);
}

// Enhanced password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate secure JWT token with enhanced options
export function generateJWTToken(payload: any): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '24h',
    issuer: 'bell24h',
    audience: 'bell24h-users',
    algorithm: 'HS256',
  });
}

// Verify JWT token with enhanced validation
export function verifyJWTToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    return jwt.verify(token, secret, {
      issuer: 'bell24h',
      audience: 'bell24h-users',
      algorithms: ['HS256'],
    });
  } catch (error) {
    logSecurityEvent('jwt_verification_failed', {
      error: error instanceof Error ? error.message : String(error),
      token: token.substring(0, 20) + '...', // Log only first 20 chars for security
    });
    throw error;
  }
}

// Enhanced authentication middleware
export function authenticateRequest(req: NextRequest): {
  authenticated: boolean;
  user?: any;
  error?: string;
} {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyJWTToken(token);

    return { authenticated: true, user: decoded };
  } catch (error) {
    logSecurityEvent('authentication_failed', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
    });

    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

// Secure login function with account lockout
export async function secureLogin(
  email: string,
  password: string,
  ip: string,
  userFromDB: any
): Promise<{ success: boolean; token?: string; error?: string; lockoutInfo?: any }> {
  // Check if account is locked out
  if (isAccountLockedOut(email, ip)) {
    const key = `${email}:${ip}`;
    const current = accountLockoutStore.get(key);
    const remainingTime = current ? current.lockoutUntil - Date.now() : 0;

    return {
      success: false,
      error: 'Account temporarily locked due to too many failed attempts',
      lockoutInfo: {
        remainingTime: Math.max(0, remainingTime),
        attempts: current?.attempts || 0,
      },
    };
  }

  // Validate password policy for new passwords (during registration)
  const passwordValidation = validatePasswordPolicy(password);
  if (!passwordValidation.valid) {
    logSecurityEvent('password_policy_violation', {
      email,
      ip,
      errors: passwordValidation.errors,
    });

    return {
      success: false,
      error: 'Password does not meet security requirements',
      lockoutInfo: { errors: passwordValidation.errors },
    };
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, userFromDB.password);

  if (!isValidPassword) {
    // Track failed attempt
    const lockoutResult = trackFailedLoginAttempt(email, ip);

    logSecurityEvent('login_failed', {
      email,
      ip,
      attempts: lockoutResult.attempts,
    });

    return {
      success: false,
      error: 'Invalid email or password',
      lockoutInfo: lockoutResult,
    };
  }

  // Successful login - reset failed attempts
  resetFailedLoginAttempts(email, ip);

  // Generate JWT token
  const token = generateJWTToken({
    userId: userFromDB.id,
    email: userFromDB.email,
    role: userFromDB.role,
  });

  logSecurityEvent('login_successful', {
    email,
    ip,
    userId: userFromDB.id,
  });

  return {
    success: true,
    token,
  };
}

// Secure registration function
export async function secureRegistration(
  email: string,
  password: string,
  name: string,
  ip: string
): Promise<{ success: boolean; error?: string }> {
  // Validate password policy
  const passwordValidation = validatePasswordPolicy(password);
  if (!passwordValidation.valid) {
    logSecurityEvent('registration_password_policy_violation', {
      email,
      ip,
      errors: passwordValidation.errors,
    });

    return {
      success: false,
      error: `Password requirements not met: ${passwordValidation.errors.join(', ')}`,
    };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  logSecurityEvent('registration_attempt', {
    email,
    ip,
    name,
  });

  // Return success - actual user creation should be handled by the calling function
  return {
    success: true,
  };
}

// Generate secure API key
export function generateSecureAPIKey(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

// Validate API key format
export function validateAPIKeyFormat(apiKey: string): boolean {
  // API key should be 64 characters long hex string
  return /^[a-f0-9]{64}$/i.test(apiKey);
}

// Secure authentication class
export class SecureAuth {
  private static instance: SecureAuth;
  private sessionStore: Map<string, any> = new Map();
  private failedAttempts: Map<
    string,
    { count: number; lastAttempt: number; lockoutUntil?: number }
  > = new Map();
  private trustedDevices: Map<string, Set<string>> = new Map();

  private constructor() {}

  static getInstance(): SecureAuth {
    if (!SecureAuth.instance) {
      SecureAuth.instance = new SecureAuth();
    }
    return SecureAuth.instance;
  }

  // Generate MFA secret
  async generateMFASecret(
    userId: string,
    email: string
  ): Promise<{ secret: string; qrCode: string }> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, AUTH_CONFIG.mfa.issuer, secret);

    const qrCode = await QRCode.toDataURL(otpauth);

    return { secret, qrCode };
  }

  // Verify MFA token
  verifyMFAToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  // Generate backup codes
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < AUTH_CONFIG.passwordPolicy.minLength) {
      errors.push(
        `Password must be at least ${AUTH_CONFIG.passwordPolicy.minLength} characters long`
      );
    }

    if (AUTH_CONFIG.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (AUTH_CONFIG.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (AUTH_CONFIG.passwordPolicy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (AUTH_CONFIG.passwordPolicy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check account lockout status
  checkLockoutStatus(identifier: string): { isLocked: boolean; remainingTime?: number } {
    const attempts = this.failedAttempts.get(identifier);

    if (!attempts) {
      return { isLocked: false };
    }

    const now = Date.now();

    // Check if account is permanently locked
    if (attempts.count >= AUTH_CONFIG.lockout.maxLockouts * AUTH_CONFIG.lockout.maxAttempts) {
      const permanentLockoutTime =
        attempts.lastAttempt + AUTH_CONFIG.lockout.permanentLockoutDuration;
      if (now < permanentLockoutTime) {
        return {
          isLocked: true,
          remainingTime: permanentLockoutTime - now,
        };
      } else {
        // Reset permanent lockout
        this.failedAttempts.delete(identifier);
        return { isLocked: false };
      }
    }

    // Check if account is temporarily locked
    if (attempts.lockoutUntil && now < attempts.lockoutUntil) {
      return {
        isLocked: true,
        remainingTime: attempts.lockoutUntil - now,
      };
    }

    // Reset lockout if time has passed
    if (attempts.lockoutUntil && now >= attempts.lockoutUntil) {
      this.failedAttempts.delete(identifier);
      return { isLocked: false };
    }

    return { isLocked: false };
  }

  // Record failed login attempt
  recordFailedAttempt(identifier: string): void {
    const attempts = this.failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
    const now = Date.now();

    attempts.count++;
    attempts.lastAttempt = now;

    // Apply lockout if max attempts reached
    if (attempts.count >= AUTH_CONFIG.lockout.maxAttempts) {
      attempts.lockoutUntil = now + AUTH_CONFIG.lockout.lockoutDuration;
    }

    this.failedAttempts.set(identifier, attempts);
  }

  // Reset failed attempts on successful login
  resetFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  // Generate API key
  generateAPIKey(userId: string, name: string, permissions?: string[]): string {
    const timestamp = Date.now();
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );

    const apiKey = `${AUTH_CONFIG.apiKey.prefix}${timestamp}_${randomString}`;

    // Store API key metadata (in production, use secure database)
    this.sessionStore.set(apiKey, {
      userId,
      name,
      permissions: permissions || [],
      createdAt: timestamp,
      expiresAt: timestamp + AUTH_CONFIG.apiKey.expiresIn,
    });

    return apiKey;
  }

  // Validate API key
  validateAPIKey(apiKey: string): { isValid: boolean; userId?: string; permissions?: string[] } {
    const metadata = this.sessionStore.get(apiKey);

    if (!metadata) {
      return { isValid: false };
    }

    const now = Date.now();
    if (now > metadata.expiresAt) {
      this.sessionStore.delete(apiKey);
      return { isValid: false };
    }

    return {
      isValid: true,
      userId: metadata.userId,
      permissions: metadata.permissions,
    };
  }

  // Revoke API key
  revokeAPIKey(apiKey: string): boolean {
    return this.sessionStore.delete(apiKey);
  }

  // Add trusted device
  addTrustedDevice(userId: string, deviceId: string): void {
    const devices = this.trustedDevices.get(userId) || new Set();
    devices.add(deviceId);
    this.trustedDevices.set(userId, devices);
  }

  // Check if device is trusted
  isTrustedDevice(userId: string, deviceId: string): boolean {
    const devices = this.trustedDevices.get(userId);
    return devices ? devices.has(deviceId) : false;
  }

  // Remove trusted device
  removeTrustedDevice(userId: string, deviceId: string): boolean {
    const devices = this.trustedDevices.get(userId);
    if (devices) {
      const removed = devices.delete(deviceId);
      if (devices.size === 0) {
        this.trustedDevices.delete(userId);
      }
      return removed;
    }
    return false;
  }

  // Generate device ID
  async generateDeviceId(): Promise<string> {
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const deviceString = `${userAgent}|${screenResolution}|${timezone}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(deviceString);

    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Secure session management
  createSecureSession(userId: string, data: any): string {
    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + AUTH_CONFIG.session.maxAge,
    };

    this.sessionStore.set(sessionId, sessionData);
    return sessionId;
  }

  // Get session data
  getSessionData(sessionId: string): any {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessionStore.delete(sessionId);
      return null;
    }

    return session;
  }

  // Destroy session
  destroySession(sessionId: string): boolean {
    return this.sessionStore.delete(sessionId);
  }

  // Clean up expired sessions
  cleanupExpiredSessions(): void {
    const now = Date.now();

    for (const [key, value] of this.sessionStore.entries()) {
      if (value.expiresAt && now > value.expiresAt) {
        this.sessionStore.delete(key);
      }
    }

    // Clean up expired failed attempts
    for (const [key, value] of this.failedAttempts.entries()) {
      if (value.lockoutUntil && now > value.lockoutUntil) {
        this.failedAttempts.delete(key);
      }
    }
  }
}

// Export singleton instance
export const secureAuth = SecureAuth.getInstance();

// Utility functions
export const authUtils = {
  // Hash password (in production, use bcrypt)
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Generate secure random string
  generateSecureRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);

    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }

    return result;
  },

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  },
};
