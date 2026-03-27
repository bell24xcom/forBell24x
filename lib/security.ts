import { nanoid } from 'nanoid';
import crypto from 'crypto';

/**
 * Validates a URL to prevent SSRF (Server-Side Request Forgery).
 * Blocks private IP ranges, localhost, and loopback addresses.
 */
export function validateExternalUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();

    // Block common SSRF targets
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS Metadata
      'metadata.google.internal',
    ];

    if (blockedHosts.some(blocked => hostname.includes(blocked))) {
      return false;
    }

    // Block private IP ranges (basic check)
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    const privateIpRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/;
    if (privateIpRegex.test(hostname)) {
      return false;
    }

    // Only allow HTTP/HTTPS
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure random token.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a secure, non-predictable ID.
 */
export function generateSecureId(prefix?: string): string {
  const id = nanoid();
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Deep freezes an object to prevent prototype pollution or accidental modification.
 */
export function deepFreeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach(prop => {
    const value = (obj as any)[prop];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

/**
 * Safely creates an object without a prototype.
 */
export function createSafeObject<T>(data: T): T {
  const safeObj = Object.create(null);
  return Object.assign(safeObj, data);
}
