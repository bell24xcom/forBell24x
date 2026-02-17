/**
 * InsForge Client — Bell24h B2B Marketplace
 * InsForge is Supabase-compatible. Uses @supabase/supabase-js under the hood.
 *
 * Setup:
 *   1. Add NEXT_PUBLIC_INSFORGE_BASE_URL to .env.production
 *   2. Add NEXT_PUBLIC_INSFORGE_ANON_KEY to .env.production
 *   3. Add INSFORGE_SERVICE_ROLE_KEY to .env.production (server-side only)
 *
 * Get credentials from: InsForge Dashboard → Your Project → Settings → API
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const insforgeServiceKey = process.env.INSFORGE_SERVICE_ROLE_KEY;

// Validate env vars are set (non-crashing — warns in dev)
function validateEnv(url?: string, key?: string, label = 'InsForge') {
  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[${label}] Missing env vars. Set NEXT_PUBLIC_INSFORGE_BASE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY in .env.production`
      );
    }
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────
// CLIENT-SIDE InsForge (anon key — safe for browser)
// Use in React components, client components
// ─────────────────────────────────────────────
let _client: SupabaseClient | null = null;

export function getInsforgeClient(): SupabaseClient | null {
  if (_client) return _client;
  if (!validateEnv(insforgeUrl, insforgeAnonKey)) return null;
  _client = createClient(insforgeUrl!, insforgeAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    // Point to InsForge endpoint (Supabase-compatible)
    global: {
      headers: {
        'x-client-info': 'bell24h-b2b/1.0',
      },
    },
  });
  return _client;
}

// Shorthand export for client-side use
export const insforge = {
  get client() {
    return getInsforgeClient();
  },

  // ── Auth ──────────────────────────────────
  auth: {
    signUp: async (email: string, password: string, metadata?: Record<string, unknown>) => {
      const c = getInsforgeClient();
      if (!c) throw new Error('InsForge not configured');
      return c.auth.signUp({ email, password, options: { data: metadata } });
    },
    signIn: async (email: string, password: string) => {
      const c = getInsforgeClient();
      if (!c) throw new Error('InsForge not configured');
      return c.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      const c = getInsforgeClient();
      if (!c) throw new Error('InsForge not configured');
      return c.auth.signOut();
    },
    getUser: async () => {
      const c = getInsforgeClient();
      if (!c) return null;
      const { data } = await c.auth.getUser();
      return data.user;
    },
    getSession: async () => {
      const c = getInsforgeClient();
      if (!c) return null;
      const { data } = await c.auth.getSession();
      return data.session;
    },
  },

  // ── Storage ───────────────────────────────
  storage: {
    upload: async (bucket: string, path: string, file: File | Blob) => {
      const c = getInsforgeClient();
      if (!c) throw new Error('InsForge not configured');
      return c.storage.from(bucket).upload(path, file, { upsert: true });
    },
    getPublicUrl: (bucket: string, path: string) => {
      const c = getInsforgeClient();
      if (!c) return null;
      return c.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
    remove: async (bucket: string, paths: string[]) => {
      const c = getInsforgeClient();
      if (!c) throw new Error('InsForge not configured');
      return c.storage.from(bucket).remove(paths);
    },
  },

  // ── Database (realtime / simple queries) ──
  from: (table: string) => {
    const c = getInsforgeClient();
    if (!c) throw new Error('InsForge not configured');
    return c.from(table);
  },

  // ── Realtime ──────────────────────────────
  channel: (name: string) => {
    const c = getInsforgeClient();
    if (!c) throw new Error('InsForge not configured');
    return c.channel(name);
  },
};

// ─────────────────────────────────────────────
// SERVER-SIDE InsForge (service_role key — NEVER expose to browser)
// Use in API routes, server actions only
// ─────────────────────────────────────────────
let _adminClient: SupabaseClient | null = null;

export function getInsforgeAdmin(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    console.error('[InsForge] getInsforgeAdmin() must only be called server-side!');
    return null;
  }
  if (_adminClient) return _adminClient;
  if (!validateEnv(insforgeUrl, insforgeServiceKey, 'InsForge Admin')) return null;
  _adminClient = createClient(insforgeUrl!, insforgeServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return _adminClient;
}

export default insforge;
