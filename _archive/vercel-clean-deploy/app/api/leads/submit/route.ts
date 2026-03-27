import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.product || !data.buyerName || !data.category) {
      return NextResponse.json({
        error: 'Missing required fields: product, buyerName, category are required'
      }, { status: 400 });
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        category: data.category,
        product: data.product,
        quantity: data.quantity || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        buyerName: data.buyerName,
        buyerCompany: data.buyerCompany || null,
        buyerEmail: data.buyerEmail || null,
        buyerPhone: data.buyerPhone || null,
        description: data.description || null,
        urgency: data.urgency || 'immediate',
        location: data.location || null,
        source: 'website'
      }
    });

    // Trigger n8n webhook (if configured)
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/webhook/bell24h-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        });
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'RFQ submitted successfully! Suppliers will contact you soon.'
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({
      error: 'Failed to submit RFQ. Please try again.'
    }, { status: 500 });
  }
}
