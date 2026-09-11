/**
 * Provider (SMS/OTP/etc.) send-failure logging + admin alert.
 *
 * Mirrors lib/errorLogger.ts's shape deliberately: log to DB, notify async,
 * never throw, never block the caller. Separate from ErrorLog/errorLogger —
 * this is for a third-party provider rejecting/failing a request, not our
 * own thrown exceptions. See prisma/schema.prisma's ProviderFailure model.
 *
 * Replaces the N8N_ERROR_WEBHOOK_URL path for this specific failure class —
 * that env var is dead (no n8n in production) and must not be referenced
 * here or anywhere new.
 */

import { prisma } from '@/lib/prisma';
import { sendBrevoEmail } from '@/lib/brevo';

interface ProviderFailureInput {
  provider: string;
  endpoint: string;
  errorCode?: string;
  errorMessage: string;
  /** Full phone/email — this function masks it before storing or emailing. Never pass a pre-masked value in expecting it to be re-masked. */
  recipient?: string;
}

/** Keeps only the last 4 characters; never the full value. */
function maskRecipient(recipient?: string): string | undefined {
  if (!recipient) return undefined;
  const digitsOrChars = recipient.replace(/\s/g, '');
  if (digitsOrChars.length <= 4) return `***${digitsOrChars}`;
  return `***${digitsOrChars.slice(-4)}`;
}

/**
 * Log a provider send failure to DB + email the admin. Never throws —
 * callers should call this without awaiting (or await it without letting
 * its rejection propagate) so a logging/alerting failure never turns into
 * a 500 for the end user's OTP request.
 */
export async function logProviderFailure(input: ProviderFailureInput): Promise<void> {
  const masked = maskRecipient(input.recipient);

  console.error(
    `[ProviderFailure] ${input.provider} ${input.endpoint}: ${input.errorCode ?? 'no-code'} — ${input.errorMessage}`
  );

  // Write to DB — fire-and-forget, matches errorLogger.ts's convention.
  prisma.providerFailure
    .create({
      data: {
        provider: input.provider,
        endpoint: input.endpoint,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        phoneOrRecipient: masked,
      },
    })
    .catch((dbErr) => {
      console.error('[ProviderFailure] Failed to write to DB:', dbErr);
    });

  // Email the admin — fire-and-forget, never blocks/slows the caller.
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  if (adminEmail) {
    const subject = `🔴 ${input.provider.toUpperCase()} send failed — ${input.errorCode ?? 'unknown'}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#b91c1c">Provider send failure</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="color:#6b7280;padding:4px 0">Provider</td><td>${input.provider}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Endpoint</td><td>${input.endpoint}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Error code</td><td>${input.errorCode ?? '—'}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Message</td><td>${input.errorMessage}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Recipient</td><td>${masked ?? '—'}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Time</td><td>${new Date().toISOString()}</td></tr>
        </table>
      </div>`;

    sendBrevoEmail(adminEmail, subject, html).catch((emailErr) => {
      console.error('[ProviderFailure] Failed to send Brevo alert:', emailErr);
    });
  } else {
    console.warn('[ProviderFailure] ADMIN_ALERT_EMAIL not set — skipping email alert');
  }
}
