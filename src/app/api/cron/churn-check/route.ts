import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronSecret } from '@/lib/cronAuth';
import { sendEmail as _sendEmail } from '@/lib/email';
const resendService = { sendEmail: ({ to, subject, html }: { to: string; subject: string; html: string }) => _sendEmail(to, subject, html) };

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 14 * 86400000); // 14 days ago

    const inactiveUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        email: { not: null },
        OR: [
          { lastLoginAt: { lt: cutoff } },
          { lastLoginAt: null, createdAt: { lt: cutoff } },
        ],
      },
      select: { id: true, name: true, email: true, role: true },
      take: 50,
    });

    let emailed = 0;
    for (const u of inactiveUsers) {
      if (!u.email) continue;
      try {
        await resendService.sendEmail({
          to: u.email,
          subject: 'Miss you on Bell24h — new RFQs waiting',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1E40AF;padding:20px 24px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;">Bell24h</h1>
              </div>
              <div style="padding:28px 24px;background:#f8fafc;">
                <p>Namaste ${u.name || 'there'},</p>
                <p>It's been a while! ${u.role === 'SUPPLIER' ? 'New RFQs are waiting for your quotes.' : 'Suppliers are ready to quote your requirements.'}</p>
                <p style="text-align:center;">
                  <a href="https://bell24h.com/dashboard" style="display:inline-block;background:#2563EB;color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
                    Back to Bell24h →
                  </a>
                </p>
              </div>
              <div style="background:#f1f5f9;padding:16px 24px;text-align:center;color:#64748b;font-size:12px;">
                Bell24h · Digitex Studio · bell24h.com
              </div>
            </div>
          `,
        });
        emailed++;
      } catch { /* fire-and-forget */ }
    }

    return NextResponse.json({ success: true, flagged: inactiveUsers.length, emailed });
  } catch (error) {
    console.error('Churn check cron error:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}
