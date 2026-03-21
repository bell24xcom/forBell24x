import { NextRequest, NextResponse } from 'next/server';
import { resendService } from '@/lib/resend';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/test-email?to=you@example.com
 * Sends a test email to verify Brevo delivery end-to-end.
 * Protected by CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const to = request.nextUrl.searchParams.get('to');
  if (!to || !to.includes('@')) {
    return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 });
  }

  const result = await resendService.sendEmail({
    to,
    subject: 'Bell24h — Email Delivery Test',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#3B82F6,#1D4ED8);padding:24px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:white;margin:0;font-size:24px">🔔 Bell24h</h1>
        </div>
        <div style="padding:32px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:0 0 8px 8px">
          <h2 style="color:#1f2937;margin-top:0">Email delivery is working ✅</h2>
          <p style="color:#6b7280;line-height:1.6">This test email confirms that Brevo is correctly configured and transactional emails from Bell24h will be delivered.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tr><td style="color:#9ca3af;padding:6px 0;font-size:14px">Service</td><td style="color:#1f2937;font-size:14px">Brevo REST API v3</td></tr>
            <tr><td style="color:#9ca3af;padding:6px 0;font-size:14px">Sent at</td><td style="color:#1f2937;font-size:14px">${new Date().toISOString()}</td></tr>
            <tr><td style="color:#9ca3af;padding:6px 0;font-size:14px">Recipient</td><td style="color:#1f2937;font-size:14px">${to}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:6px">
            <p style="margin:0;color:#065f46;font-size:14px">All transactional emails (quote notifications, welcome emails, weekly digest, churn re-engagement) will now deliver successfully.</p>
          </div>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">© 2026 Bell24h Technologies Pvt Ltd</p>
      </div>`,
  });

  console.log('[Email/test]', result);
  return NextResponse.json({ ...result, to, timestamp: new Date().toISOString() });
}
