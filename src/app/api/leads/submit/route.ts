import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/submit
 * Public buyer lead capture. Maps client payload onto the Prisma `Lead` model
 * (name/phone/email/company/message/source/status) — no schema expansion.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const name = String(data.buyerName || data.name || '').trim();
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: buyerName (or name) is required' },
        { status: 400 },
      );
    }

    // Preserve RFQ-intent fields that are not Lead columns inside `message`
    // so CRM operators still see product/category/quantity without a migration.
    const messageParts = [
      data.category ? `Category: ${data.category}` : null,
      data.product ? `Product: ${data.product}` : null,
      data.quantity ? `Quantity: ${data.quantity}` : null,
      data.budget != null && data.budget !== '' ? `Budget: ${data.budget}` : null,
      data.urgency ? `Urgency: ${data.urgency}` : null,
      data.location ? `Location: ${data.location}` : null,
      data.description ? String(data.description) : null,
      data.message ? String(data.message) : null,
    ].filter(Boolean);

    const lead = await prisma.lead.create({
      data: {
        name,
        phone: data.buyerPhone || data.phone || null,
        email: data.buyerEmail || data.email || null,
        company: data.buyerCompany || data.company || null,
        message: messageParts.length > 0 ? messageParts.join('\n') : null,
        source: data.source || 'website',
        status: 'NEW',
      },
    });

    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/bell24h-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
      }
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Requirement submitted successfully! Verified suppliers will contact you soon.',
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit requirement. Please try again.' },
      { status: 500 },
    );
  }
}
