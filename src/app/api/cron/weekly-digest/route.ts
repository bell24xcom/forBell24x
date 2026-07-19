import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronSecret } from '@/lib/cronAuth';
import { sendEmail as _sendEmail } from '@/lib/email';
import { SITE_URL, SITE_HOST } from '@/lib/site-url';
const resendService = { sendEmail: ({ to, subject, html }: { to: string; subject: string; html: string }) => _sendEmail(to, subject, html) };

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const since = new Date(Date.now() - 7 * 86400000);

    // Get active suppliers with email
    const suppliers = await prisma.user.findMany({
      where: { role: 'SUPPLIER', isActive: true, email: { not: null } },
      select: { id: true, name: true, email: true, preferences: true },
      take: 200,
    });

    let sent = 0;

    for (const supplier of suppliers) {
      if (!supplier.email) continue;

      const prefs = supplier.preferences as Record<string, unknown> | null;
      const categories: string[] = Array.isArray(prefs?.categories) ? (prefs.categories as string[]) : [];

      // Count new RFQs in their categories this week
      const newRFQs = await prisma.rFQ.count({
        where: {
          status: { in: ['ACTIVE', 'OPEN'] },
          createdAt: { gte: since },
          ...(categories.length > 0 ? { category: { in: categories } } : {}),
        },
      });

      if (newRFQs === 0) continue;

      try {
        await resendService.sendEmail({
          to: supplier.email,
          subject: `${newRFQs} new RFQ${newRFQs > 1 ? 's' : ''} in your categories this week`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1E40AF;padding:20px 24px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;">VyaparSethu Weekly Digest</h1>
              </div>
              <div style="padding:28px 24px;background:#f8fafc;">
                <p>Namaste ${supplier.name || 'Supplier'},</p>
                <p>This week, <strong>${newRFQs} new RFQ${newRFQs > 1 ? 's' : ''}</strong> were posted${categories.length > 0 ? ` in: ${categories.join(', ')}` : ''}.</p>
                <p>Browse and submit quotes to grow your business.</p>
                <p style="text-align:center;">
                  <a href="${SITE_URL}/supplier/browse-rfqs" style="display:inline-block;background:#2563EB;color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
                    Browse RFQs →
                  </a>
                </p>
              </div>
              <div style="background:#f1f5f9;padding:16px 24px;text-align:center;color:#64748b;font-size:12px;">
                VyaparSethu · Digitex Studio · ${SITE_HOST}
              </div>
            </div>
          `,
        });
        sent++;
      } catch { /* fire-and-forget */ }
    }

    return NextResponse.json({ success: true, suppliersChecked: suppliers.length, sent });
  } catch (error) {
    console.error('Weekly digest cron error:', error);
    return NextResponse.json({ success: false, error: 'Cron failed' }, { status: 500 });
  }
}
