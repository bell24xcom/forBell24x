/**
 * Bell24h — Input sanitization & validation utilities
 * Used at all API boundary points before writing to DB.
 */

// ─── String sanitization ─────────────────────────────────────────────────────

/** Strip HTML tags and trim whitespace */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')     // strip HTML tags
    .replace(/[<>'"]/g, '')      // strip remaining dangerous chars
    .trim()
    .slice(0, maxLength);
}

/** Sanitize and truncate a longer text field (description, requirements) */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  return sanitizeString(input, maxLength);
}

/** Normalize phone number — digits only, strip +91 prefix */
export function normalizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  return digits.slice(-10); // take last 10 digits
}

/** Validate that a string is a valid 10-digit Indian mobile number */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

// ─── Email ───────────────────────────────────────────────────────────────────

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

// ─── GST Number ──────────────────────────────────────────────────────────────

/**
 * Validate Indian GST number format.
 * Format: 2-digit state code + 10-char PAN + 1 entity + 1 Z + 1 check
 * Example: 27AAAAA0000A1Z5
 */
export function isValidGST(gst: unknown): boolean {
  if (typeof gst !== 'string') return false;
  return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.trim().toUpperCase());
}

export function normalizeGST(gst: string): string {
  return gst.trim().toUpperCase();
}

// ─── Udyam Number ────────────────────────────────────────────────────────────

/**
 * Validate Udyam Registration Number.
 * Format: UDYAM-XX-00-0000000
 */
export function isValidUdyam(udyam: unknown): boolean {
  if (typeof udyam !== 'string') return false;
  return /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(udyam.trim().toUpperCase());
}

// ─── Numeric validation ───────────────────────────────────────────────────────

export function safeFloat(value: unknown, fallback = 0): number {
  const n = parseFloat(String(value));
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

export function safePositiveFloat(value: unknown): number | null {
  const n = safeFloat(value, -1);
  return n > 0 ? n : null;
}

// ─── Trust score recalculator ─────────────────────────────────────────────────

/**
 * Calculate trust score from user verification fields.
 * Call this whenever user fields change.
 *
 * Score breakdown (max 100):
 *  +20  has email
 *  +20  has phone (verified)
 *  +15  isVerified (KYC done)
 *  +15  has GST number (valid)
 *  +10  has Udyam number
 *  +10  has at least one accepted quote
 *  +10  has company name filled
 */
export function calculateTrustScore(user: {
  email?: string | null;
  phone?: string | null;
  isVerified?: boolean;
  gstNumber?: string | null;
  udyamNumber?: string | null;
  company?: string | null;
  acceptedQuotesCount?: number;
}): number {
  let score = 0;
  if (user.email)           score += 20;
  if (user.phone)           score += 20;
  if (user.isVerified)      score += 15;
  if (user.gstNumber && isValidGST(user.gstNumber))     score += 15;
  if (user.udyamNumber && isValidUdyam(user.udyamNumber)) score += 10;
  if ((user.acceptedQuotesCount ?? 0) > 0)              score += 10;
  if (user.company)         score += 10;
  return Math.min(score, 100);
}
