/**
 * InsForge Auth Helper — Bell24h
 *
 * Bridges InsForge auth with existing NextAuth session.
 * InsForge handles: file storage, realtime, advanced auth features
 * NextAuth handles: session tokens, server-side auth (existing)
 *
 * Usage in server API routes:
 *   import { verifyInsforgeToken } from '@/lib/auth/insforge-auth'
 *
 * Usage in client components:
 *   import { signInWithInsforge, signUpWithInsforge } from '@/lib/auth/insforge-auth'
 */

import { getInsforgeClient, getInsforgeAdmin } from '@/lib/insforge';

// ── Client-side: Sign up a new user via InsForge ──────────────────────────
export async function signUpWithInsforge(
  email: string,
  password: string,
  metadata?: {
    fullName?: string;
    phone?: string;
    role?: 'buyer' | 'supplier' | 'admin';
    companyName?: string;
  }
) {
  const client = getInsforgeClient();
  if (!client) {
    return { error: { message: 'InsForge not configured. Add credentials to .env.production' } };
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata?.fullName,
        phone: metadata?.phone,
        role: metadata?.role ?? 'buyer',
        company_name: metadata?.companyName,
        platform: 'bell24h',
      },
    },
  });

  return { data, error };
}

// ── Client-side: Sign in existing user ────────────────────────────────────
export async function signInWithInsforge(email: string, password: string) {
  const client = getInsforgeClient();
  if (!client) {
    return { error: { message: 'InsForge not configured' } };
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  return { data, error };
}

// ── Server-side: Verify InsForge JWT token ────────────────────────────────
export async function verifyInsforgeToken(token: string) {
  const admin = getInsforgeAdmin();
  if (!admin) return null;

  try {
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ── Server-side: Get user by ID (admin) ───────────────────────────────────
export async function getInsforgeUserById(userId: string) {
  const admin = getInsforgeAdmin();
  if (!admin) return null;

  try {
    const { data: { user }, error } = await admin.auth.admin.getUserById(userId);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ── Server-side: List all users (admin panel) ─────────────────────────────
export async function listInsforgeUsers(page = 1, perPage = 50) {
  const admin = getInsforgeAdmin();
  if (!admin) return { users: [], total: 0 };

  try {
    const { data: { users }, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) return { users: [], total: 0 };
    return { users, total: users.length };
  } catch {
    return { users: [], total: 0 };
  }
}

// ── Sync InsForge user with Neon/Prisma DB ────────────────────────────────
// Call this after signUp to ensure user exists in both InsForge + Neon DB
export async function syncInsforgeUserWithDB(insforgeUserId: string, email: string) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return existingUser;

    const newUser = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        // Store InsForge user ID for cross-reference
        // Add insforgeId field to Prisma schema if needed
      },
    });
    return newUser;
  } catch (err) {
    console.error('[InsForge Sync] Failed to sync user with Prisma DB:', err);
    return null;
  }
}
