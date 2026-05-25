export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    console.warn('[EMAIL] MSG91_AUTH_KEY not set — skipping:', subject);
    return { success: false };
  }

  const res = await fetch('https://control.msg91.com/api/v5/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authkey: authKey },
    body: JSON.stringify({
      recipients: [{ to: [{ email: to, name: to }] }],
      from: { email: 'no-reply@bell24h.com' },
      domain: 'bell24h.com',
      subject,
      body: { type: 'text/html', value: html },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    console.error('[EMAIL] MSG91 send failed:', res.status, err);
    return { success: false };
  }

  return { success: true };
}
