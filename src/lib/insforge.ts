import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Accepts either the server-side keys (INSFORGE_URL / INSFORGE_API_KEY)
// or the public keys (NEXT_PUBLIC_INSFORGE_BASE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY).
// Server-side keys take precedence and should be used for admin/marketing routes.
const INSFORGE_URL =
  process.env.INSFORGE_URL ||
  process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
  '';

const INSFORGE_KEY =
  process.env.INSFORGE_API_KEY ||
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  '';

export function isInsforgeConfigured(): boolean {
  return Boolean(INSFORGE_URL && INSFORGE_KEY);
}

let _client: SupabaseClient | null = null;

export function getInsforge(): SupabaseClient | null {
  if (!isInsforgeConfigured()) return null;
  if (!_client) {
    _client = createClient(INSFORGE_URL, INSFORGE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

// Named singleton used by marketing/rules/route.ts via `insforge.client!`
export const insforge = {
  get client(): SupabaseClient | null {
    return getInsforge();
  },
};
