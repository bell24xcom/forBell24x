/**
 * lib/resend.ts — Email Service via Brevo REST API
 * Drop-in replacement for Resend. Same interface, no new packages.
 *
 * Brevo API key → BREVO_API_KEY env var
 * Falls back gracefully if key is not set (logs, never throws).
 */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

class EmailService {
  private get apiKey(): string {
    return process.env.BREVO_API_KEY || '';
  }

  private get fromEmail(): string {
    return process.env.FROM_EMAIL || 'noreply@bell24h.com';
  }

  async sendEmail({
    to,
    subject,
    html,
    text,
    from,
  }: SendEmailParams): Promise<{ success: boolean; message: string; error?: string }> {
    if (!this.apiKey) {
      console.warn('[Email] BREVO_API_KEY not set — email skipped:', subject);
      return { success: false, message: 'Email service not configured', error: 'BREVO_API_KEY missing' };
    }

    const recipients = (Array.isArray(to) ? to : [to]).map(email => ({ email }));

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          sender: { name: 'Bell24h', email: from || this.fromEmail },
          to: recipients,
          subject,
          htmlContent: html,
          textContent: text || html.replace(/<[^>]*>/g, ''),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[Email] Brevo send failed:', res.status, err);
        return { success: false, message: 'Email send failed', error: JSON.stringify(err) };
      }

      const toList = Array.isArray(to) ? to.join(', ') : to;
      console.log('[Email] Sent to:', toList, '| Subject:', subject);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('[Email] Brevo error:', error);
      return {
        success: false,
        message: 'Email service error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendOTPEmail({ to, otp, phone }: { to: string; otp: string; phone: string }) {
    return this.sendEmail({
      to,
      subject: 'Bell24h OTP Verification',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#3B82F6,#1D4ED8);padding:20px;text-align:center">
            <h1 style="color:white;margin:0">🔔 Bell24h</h1>
          </div>
          <div style="padding:30px;background:#f8fafc">
            <h2 style="color:#1f2937">OTP Verification</h2>
            <p style="color:#6b7280">Your OTP for <strong>${phone}</strong> is:</p>
            <div style="background:#1f2937;color:white;font-size:32px;font-weight:bold;text-align:center;padding:20px;margin:20px 0;border-radius:8px;letter-spacing:8px">${otp}</div>
            <p style="color:#6b7280;font-size:14px">Valid for 5 minutes. Do not share this OTP.</p>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#9ca3af;font-size:12px">© 2026 Bell24h Technologies Pvt Ltd</div>
        </div>`,
    });
  }

  async sendWelcomeEmail({ to, name, phone }: { to: string; name?: string; phone: string }) {
    return this.sendEmail({
      to,
      subject: 'Welcome to Bell24h — Find Verified Suppliers in 24 Hours',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#3B82F6,#1D4ED8);padding:20px;text-align:center">
            <h1 style="color:white;margin:0">🚀 Welcome to Bell24h!</h1>
          </div>
          <div style="padding:30px;background:#f8fafc">
            <h2 style="color:#1f2937">Hi ${name || 'there'} 👋</h2>
            <p style="color:#6b7280;line-height:1.6">Your account is live with phone <strong>${phone}</strong>. Start posting RFQs and get quotes from verified suppliers — free during beta.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="https://www.bell24h.com/dashboard" style="background:#3B82F6;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block">Go to Dashboard →</a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#9ca3af;font-size:12px">© 2026 Bell24h Technologies Pvt Ltd</div>
        </div>`,
    });
  }

  async sendTransactionEmail({ to, type, amount, transactionId, status }: {
    to: string; type: string; amount: number; transactionId: string; status: string;
  }) {
    return this.sendEmail({
      to,
      subject: `Transaction ${status} — ₹${amount.toLocaleString()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#3B82F6,#1D4ED8);padding:20px;text-align:center">
            <h1 style="color:white;margin:0">💳 Transaction Update</h1>
          </div>
          <div style="padding:30px;background:#f8fafc">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:8px 0">Transaction ID</td><td style="font-weight:bold;color:#1f2937">${transactionId}</td></tr>
              <tr><td style="color:#6b7280;padding:8px 0">Type</td><td style="color:#1f2937">${type}</td></tr>
              <tr><td style="color:#6b7280;padding:8px 0">Amount</td><td style="font-weight:bold;color:#1f2937;font-size:18px">₹${amount.toLocaleString()}</td></tr>
              <tr><td style="color:#6b7280;padding:8px 0">Status</td><td style="font-weight:bold;color:${status === 'completed' ? '#10b981' : '#f59e0b'}">${status.toUpperCase()}</td></tr>
            </table>
            <div style="text-align:center;margin:24px 0">
              <a href="https://www.bell24h.com/transactions" style="background:#3B82F6;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block">View Transaction</a>
            </div>
          </div>
          <div style="background:#f3f4f6;padding:16px;text-align:center;color:#9ca3af;font-size:12px">© 2026 Bell24h Technologies Pvt Ltd</div>
        </div>`,
    });
  }
}

// Singleton — same export name so all existing imports work unchanged
export const resendService = new EmailService();

export type { SendEmailParams };
