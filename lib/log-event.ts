/**
 * lib/log-event.ts — Lightweight operator event logger.
 * Writes to console (Vercel logs). No DB, no external service.
 */

export type EventType = 'rfq_created' | 'whatsapp_click' | 'email_sent' | 'outreach_generated';

export interface LogEventParams {
  type: EventType;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

export function logEvent({ type, meta = {} }: LogEventParams): void {
  const ts = new Date().toISOString();
  const parts = Object.entries(meta)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');
  console.log(`[EVENT] ${type} ts=${ts}${parts ? ' ' + parts : ''}`);
}
