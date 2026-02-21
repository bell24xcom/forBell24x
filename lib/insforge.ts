/**
 * InsForge Client — Bell24h B2B Marketplace
 *
 * InsForge Free Tier gives you ONE API key (ik_xxx) with full access.
 * This key must NEVER go to the browser (it has full DB access).
 *
 * Architecture:
 *   Browser → our API routes (/api/insforge/*) → InsForge backend
 *   (frontend never touches InsForge directly — safe & secure)
 *
 * Env vars needed in .env.production:
 *   INSFORGE_URL=https://3hbtn5wm.ap-southeast.insforge.app
 *   INSFORGE_API_KEY=ik_your_key_here
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const INSFORGE_URL = process.env.INSFORGE_URL;
const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;

// ─────────────────────────────────────────────
// SERVER-SIDE ONLY — never import this in client components!
// ─────────────────────────────────────────────
let _client: SupabaseClient | null = null;

export function getInsforge(): SupabaseClient | null {
  // Block client-side usage
  if (typeof window !== 'undefined') {
    console.error('[InsForge] Cannot use InsForge client in the browser. Use API routes instead.');
    return null;
  }

  if (_client) return _client;

  if (!INSFORGE_URL || !INSFORGE_API_KEY || INSFORGE_API_KEY.includes('PASTE_YOUR')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[InsForge] Not configured. Paste your ik_ API key in .env.production → INSFORGE_API_KEY'
      );
    }
    return null;
  }

  _client = createClient(INSFORGE_URL, INSFORGE_API_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'bell24h-b2b/1.0',
      },
    },
  });

  return _client;
}

// ─────────────────────────────────────────────
// Helper: Check if InsForge is configured
// ─────────────────────────────────────────────
export function isInsforgeConfigured(): boolean {
  return !!(
    INSFORGE_URL &&
    INSFORGE_API_KEY &&
    !INSFORGE_API_KEY.includes('PASTE_YOUR')
  );
}

// ─────────────────────────────────────────────
// Convenience helpers (all server-side only)
// ─────────────────────────────────────────────
export const insforge = {
  // ── Auth (admin operations) ───────────────
  auth: {
    createUser: async (email: string, password: string, metadata?: Record<string, unknown>) => {
      const c = getInsforge();
      if (!c) throw new Error('InsForge not configured');
      return c.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { ...metadata, platform: 'bell24h' },
      });
    },
    getUserById: async (id: string) => {
      const c = getInsforge();
      if (!c) return null;
      const { data } = await c.auth.admin.getUserById(id);
      return data.user;
    },
    listUsers: async (page = 1, perPage = 50) => {
      const c = getInsforge();
      if (!c) return { users: [], count: 0 };
      const { data } = await c.auth.admin.listUsers({ page, perPage });
      return { users: data.users, count: data.users.length };
    },
    deleteUser: async (id: string) => {
      const c = getInsforge();
      if (!c) throw new Error('InsForge not configured');
      return c.auth.admin.deleteUser(id);
    },
  },

  // ── Database ──────────────────────────────
  from: (table: string) => {
    const c = getInsforge();
    if (!c) throw new Error('InsForge not configured');
    return c.from(table);
  },

  // ── Storage ───────────────────────────────
  storage: {
    upload: async (bucket: string, path: string, file: Buffer | Blob) => {
      const c = getInsforge();
      if (!c) throw new Error('InsForge not configured');
      return c.storage.from(bucket).upload(path, file, { upsert: true });
    },
    getPublicUrl: (bucket: string, path: string) => {
      const c = getInsforge();
      if (!c) return null;
      return c.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
    list: async (bucket: string, folder?: string) => {
      const c = getInsforge();
      if (!c) return [];
      const { data } = await c.storage.from(bucket).list(folder);
      return data ?? [];
    },
    remove: async (bucket: string, paths: string[]) => {
      const c = getInsforge();
      if (!c) throw new Error('InsForge not configured');
      return c.storage.from(bucket).remove(paths);
    },
  },

  // ── Realtime ──────────────────────────────
  channel: (name: string) => {
    const c = getInsforge();
    if (!c) throw new Error('InsForge not configured');
    return c.channel(name);
  },

  // ── Raw client (for advanced queries) ─────
  get client() {
    return getInsforge();
  },
};

export default insforge;
