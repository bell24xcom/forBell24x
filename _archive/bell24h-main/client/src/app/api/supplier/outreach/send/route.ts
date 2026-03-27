import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Send Supplier Outreach
 * Item 21: Recruit Early Adopters
 * 
 * Sends email/SMS outreach to selected suppliers
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierIds, type, template } = body;

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json(
        { error: 'Supplier IDs array is required' },
        { status: 400 }
      );
    }

    // Get supplier data
    const suppliers = await prisma.scrapedCompany.findMany({
      where: {
        id: { in: supplierIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        category: true
      }
    });

    if (suppliers.length === 0) {
      return NextResponse.json(
        { error: 'No suppliers found' },
        { status: 404 }
      );
    }

    let sent = 0;
    const results = [];

    for (const supplier of suppliers) {
      try {
        // Send email if requested
        if (type === 'email' || type === 'both') {
          if (supplier.email) {
            await sendOutreachEmail(supplier, template);
            sent++;
          }
        }

        // Send SMS if requested
        if (type === 'sms' || type === 'both') {
          if (supplier.phone) {
            await sendOutreachSMS(supplier, template);
            sent++;
          }
        }

        results.push({
          supplierId: supplier.id,
          name: supplier.name,
          status: 'sent'
        });
      } catch (error) {
        console.error(`Error sending outreach to ${supplier.id}:`, error);
        results.push({
          supplierId: supplier.id,
          name: supplier.name,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      total: suppliers.length,
      results
    });

  } catch (error) {
    console.error('Send outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to send outreach' },
      { status: 500 }
    );
  }
}

async function sendOutreachEmail(supplier: any, template: string) {
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  // For now, trigger n8n webhook
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    await fetch(`${n8nWebhookUrl}/supplier-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: supplier.email,
        name: supplier.name,
        template,
        claimLink: `https://bell24h.com/claim/${supplier.id}`
      })
    });
  }
}

async function sendOutreachSMS(supplier: any, template: string) {
  // TODO: Integrate with MSG91 or similar SMS service
  // For now, trigger n8n webhook
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    await fetch(`${n8nWebhookUrl}/supplier-welcome-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: supplier.phone,
        name: supplier.name,
        template,
        claimLink: `https://bell24h.com/claim/${supplier.id}`
      })
    });
  }
}

