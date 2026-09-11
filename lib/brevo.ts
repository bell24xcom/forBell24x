/**
 * Minimal Brevo transactional email client.
 *
 * New — no working Brevo integration existed before this. `lib/email.ts`'s
 * `sendEmail()` is mislabeled: despite /api/admin/test-email's comment
 * claiming it verifies "Brevo delivery," it actually calls MSG91's email
 * API, and the domain's DNS (checked by /api/admin/email-health) is set up
 * for Brevo's SPF/DKIM records with nothing in code ever calling Brevo.
 * That inconsistency is pre-existing and out of scope here — this file adds
 * a real Brevo call for provider-failure alerts only; it does not touch or
 * replace lib/email.ts.
 *
 * Requires BREVO_API_KEY. Fails soft (returns { success: false }) if unset
 * or the call errors — callers must never let this block a user-facing
 * request; see lib/providerFailure.ts for the fire-and-forget wrapper.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function sendBrevoEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[Brevo] BREVO_API_KEY not set — skipping:', subject);
    return { success: false, error: 'BREVO_API_KEY not configured' };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@vyaparsethu.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'VyaparSethu Alerts';

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      console.error('[Brevo] send failed:', res.status, err);
      return { success: false, error: `Brevo ${res.status}: ${err}` };
    }

    return { success: true };
  } catch (error) {
    console.error('[Brevo] network error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}
