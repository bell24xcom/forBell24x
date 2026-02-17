/**
 * InsForge Auth Helper — Bell24h
 *
 * All InsForge calls go through SERVER-SIDE API routes only.
 * The ik_ API key never reaches the browser.
 *
 * How it works:
 *   Frontend → POST /api/insforge/auth/signup → this helper → InsForge
 *   Frontend → POST /api/insforge/auth/signin → this helper → InsForge
 */

import { getInsforge, isInsforgeConfigured } from '@/lib/insforge';

// ── Create a new user (server-side) ──────────────────────────────────────
export async function createInsforgeUser(
  email: string,
  password: string,
  metadata?: {
    fullName?: string;
    phone?: string;
    role?: 'buyer' | 'supplier' | 'admin';
    companyName?: string;
  }
) {
  if (!isInsforgeConfigured()) {
    return { data: null, error: 'InsForge not configured. Add ik_ key to .env.production' };
  }

  const client = getInsforge();
  if (!client) return { data: null, error: 'InsForge client failed to init' };

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: metadata?.fullName,
      phone: metadata?.phone,
      role: metadata?.role ?? 'buyer',
      company_name: metadata?.companyName,
      platform: 'bell24h',
    },
  });

  if (error) return { data: null, error: error.message };
  return { data: data.user, error: null };
}

// ── Verify a user token (server-side) ────────────────────────────────────
export async function verifyInsforgeToken(token: string) {
  const client = getInsforge();
  if (!client) return null;

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ── Get user by ID (server-side admin) ───────────────────────────────────
export async function getInsforgeUserById(userId: string) {
  const client = getInsforge();
  if (!client) return null;

  try {
    const { data: { user }, error } = await client.auth.admin.getUserById(userId);
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}

// ── List all users (admin panel) ─────────────────────────────────────────
export async function listInsforgeUsers(page = 1, perPage = 50) {
  const client = getInsforge();
  if (!client) return { users: [], total: 0 };

  try {
    const { data: { users }, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) return { users: [], total: 0 };
    return { users, total: users.length };
  } catch {
    return { users: [], total: 0 };
  }
}

// ── Sync InsForge user → Neon/Prisma DB ──────────────────────────────────
export async function syncUserWithPrisma(insforgeUserId: string, email: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    return await prisma.user.create({
      data: { email, name: email.split('@')[0] },
    });
  } catch (err) {
    console.error('[InsForge Sync] Failed:', err);
    return null;
  }
}
