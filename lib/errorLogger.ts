/**
 * Bell24h Error Logger
 * ─────────────────────
 * Lightweight error tracking — no Sentry needed.
 *
 * Logs every error to:
 *   1. Database  → ErrorLog table (queryable from /admin/errors)
 *   2. n8n       → webhook → Telegram/WhatsApp/Email alert (critical errors)
 *   3. Console   → always (Vercel built-in function logs)
 */

import { prisma } from '@/lib/prisma';

interface ErrorContext {
  route: string;
  method?: string;
  userId?: string;
  severity?: 'warn' | 'error' | 'critical';
  meta?: Record<string, unknown>;
}

const N8N_ERROR_WEBHOOK = process.env.N8N_ERROR_WEBHOOK_URL;

/**
 * Log an error to DB + n8n (for critical routes).
 * Never throws — error logging must never crash the app.
 */
export async function logError(
  error: unknown,
  ctx: ErrorContext
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const stack   = error instanceof Error ? error.stack   : undefined;
  const severity = ctx.severity ?? 'error';

  // 1. Always log to console (Vercel Function Logs picks this up)
  console.error(`[ErrorLog] [${severity.toUpperCase()}] ${ctx.route}: ${message}`);

  // 2. Write to database asynchronously (don't await in hot paths)
  prisma.errorLog.create({
    data: {
      route:    ctx.route,
      method:   ctx.method ?? 'POST',
      message,
      stack,
      userId:   ctx.userId,
      severity,
      meta:     (ctx.meta as any) ?? null,
    },
  }).catch((dbErr) => {
    console.error('[ErrorLog] Failed to write to DB:', dbErr);
  });

  // 3. Fire n8n webhook for critical/error severity (non-blocking)
  if (N8N_ERROR_WEBHOOK && severity !== 'warn') {
    fetch(N8N_ERROR_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        severity,
        route:   ctx.route,
        message,
        userId:  ctx.userId ?? null,
        meta:    ctx.meta   ?? null,
        time:    new Date().toISOString(),
        env:     process.env.NODE_ENV,
      }),
    }).catch(() => {
      // Silently ignore — n8n may be unavailable
    });
  }
}

/**
 * Convenience wrappers
 */
export const errorLogger = {
  warn:     (error: unknown, ctx: ErrorContext) => logError(error, { ...ctx, severity: 'warn' }),
  error:    (error: unknown, ctx: ErrorContext) => logError(error, { ...ctx, severity: 'error' }),
  critical: (error: unknown, ctx: ErrorContext) => logError(error, { ...ctx, severity: 'critical' }),
};
