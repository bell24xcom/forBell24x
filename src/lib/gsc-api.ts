/**
 * Google Search Console API — service account JWT auth (no googleapis dependency).
 * Set GSC_SERVICE_ACCOUNT_JSON in Vercel (full JSON string) and GSC_SITE_URL.
 */

const GSC_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GSC_API = 'https://www.googleapis.com/webmasters/v3';

export interface GscServiceAccount {
  client_email: string;
  private_key: string;
}

export interface GscQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscSyncResult {
  success: boolean;
  source: 'live' | 'fallback';
  siteUrl: string;
  startDate: string;
  endDate: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: string;
    avgPosition: string;
  };
  queries: GscQueryRow[];
  error?: string;
  configured: boolean;
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseServiceAccount(): GscServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) return null;
  try {
    const json = JSON.parse(raw) as GscServiceAccount;
    if (json.client_email && json.private_key) return json;
  } catch {
    /* invalid json */
  }
  return null;
}

export function getGscSiteUrl(): string {
  return process.env.GSC_SITE_URL || 'sc-domain:vyaparsethu.com';
}

export function isGscConfigured(): boolean {
  return parseServiceAccount() !== null;
}

async function getAccessToken(sa: GscServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: GSC_SCOPE,
      aud: GSC_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = base64url(sign.sign(sa.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch(GSC_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GSC token error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function fetchGscSearchAnalytics(
  days = 28,
): Promise<GscSyncResult> {
  const sa = parseServiceAccount();
  const siteUrl = getGscSiteUrl();

  if (!sa) {
    return {
      success: false,
      source: 'fallback',
      siteUrl,
      startDate: '',
      endDate: '',
      totals: { clicks: 0, impressions: 0, ctr: '0%', avgPosition: '—' },
      queries: [],
      configured: false,
      error: 'GSC_SERVICE_ACCOUNT_JSON not set in Vercel env',
    };
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const startDate = fmt(start);
  const endDate = fmt(end);

  try {
    const token = await getAccessToken(sa);
    const encodedSite = encodeURIComponent(siteUrl);
    const res = await fetch(`${GSC_API}/sites/${encodedSite}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 100,
        dataState: 'all',
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GSC API ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = await res.json();
    const rows: GscQueryRow[] = (data.rows ?? []).map(
      (r: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
        query: r.keys[0],
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      }),
    );

    const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
    const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
    const weightedPos = rows.reduce((s, r) => s + r.position * r.impressions, 0);
    const avgPosition = totalImpressions > 0 ? weightedPos / totalImpressions : 0;

    return {
      success: true,
      source: 'live',
      siteUrl,
      startDate,
      endDate,
      totals: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(1)}%` : '0%',
        avgPosition: avgPosition > 0 ? avgPosition.toFixed(1) : '—',
      },
      queries: rows.sort((a, b) => b.impressions - a.impressions),
      configured: true,
    };
  } catch (err) {
    return {
      success: false,
      source: 'fallback',
      siteUrl,
      startDate,
      endDate,
      totals: { clicks: 0, impressions: 0, ctr: '0%', avgPosition: '—' },
      queries: [],
      configured: true,
      error: err instanceof Error ? err.message : 'GSC sync failed',
    };
  }
}
