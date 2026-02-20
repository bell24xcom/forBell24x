import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { aiClient } from '@/lib/ai-client';
import { onQuoteAccepted, onQuoteRejected, onCounterOffer } from '@/lib/orchestration';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await request.json();
    const { quoteId, action, counterPrice, counterTimeline, counterNote } = body;

    if (!quoteId || !action) {
      return NextResponse.json(
        { success: false, error: 'quoteId and action are required' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject', 'counter'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'action must be accept, reject, or counter' },
        { status: 400 }
      );
    }

    // Load quote with RFQ owner info
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: { select: { id: true, title: true, createdBy: true, category: true } },
        supplier: { select: { id: true, name: true, company: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    const isBuyer = quote.rfq.createdBy === userId;
    const isSupplier = quote.supplierId === userId;

    if (!isBuyer && !isSupplier) {
      return NextResponse.json({ success: false, error: 'Not authorised' }, { status: 403 });
    }

    if (quote.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Quote is already ${quote.status.toLowerCase()}` },
        { status: 409 }
      );
    }

    let updated;

    if (action === 'accept' && isBuyer) {
      updated = await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED', isAccepted: true },
      });
      // Fetch both buyer + supplier for orchestration
      Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }),
        prisma.user.findUnique({ where: { id: quote.supplierId }, select: { id: true, name: true, email: true } }),
      ]).then(([buyer, supplier]) => {
        if (!buyer || !supplier) return;
        onQuoteAccepted(
          { id: quote.id, price: quote.price },
          { id: quote.rfq.id, title: quote.rfq.title },
          supplier,
          { id: buyer.id, name: buyer.name }
        );
      }).catch(err => console.error('[Orchestration] onQuoteAccepted:', err));

    } else if (action === 'reject' && isBuyer) {
      updated = await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'REJECTED' },
      });
      prisma.user.findUnique({ where: { id: quote.supplierId }, select: { id: true, name: true, email: true } })
        .then(supplier => {
          if (!supplier) return;
          onQuoteRejected(
            { id: quote.id, price: quote.price },
            { id: quote.rfq.id, title: quote.rfq.title },
            supplier
          );
        }).catch(err => console.error('[Orchestration] onQuoteRejected:', err));

    } else if (action === 'counter' && isSupplier) {
      if (!counterPrice) {
        return NextResponse.json(
          { success: false, error: 'counterPrice is required for a counter offer' },
          { status: 400 }
        );
      }

      // Build AI suggestion for counter note
      let aiSuggestion = '';
      try {
        const aiResponse = await aiClient.createChatCompletion('text', [
          {
            role: 'system',
            content:
              'You are a professional B2B negotiation assistant. Write a concise, polite 1-sentence counter-offer message.',
          },
          {
            role: 'user',
            content: `RFQ: "${quote.rfq.title}" (${quote.rfq.category}). Original price: ₹${quote.price}. New counter offer: ₹${counterPrice}, timeline: ${counterTimeline || quote.timeline}. Reason/note: ${counterNote || 'competitive market rates'}.`,
          },
        ], { maxTokens: 120, temperature: 0.7 });

        aiSuggestion = aiResponse.choices?.[0]?.message?.content?.trim() || '';
      } catch (aiErr) {
        console.warn('AI suggestion unavailable:', aiErr);
      }

      const noteText = aiSuggestion
        ? `Counter offer: ₹${counterPrice} | ${counterTimeline || quote.timeline}. ${aiSuggestion}`
        : `Counter offer: ₹${counterPrice} | ${counterTimeline || quote.timeline}. ${counterNote || ''}`;

      updated = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          price: parseFloat(counterPrice),
          timeline: counterTimeline || quote.timeline,
          terms: noteText,
        },
      });
      // Notify buyer of counter offer
      prisma.user.findUnique({ where: { id: quote.rfq.createdBy }, select: { id: true, name: true, email: true } })
        .then(buyer => {
          if (!buyer) return;
          onCounterOffer(
            { id: updated!.id, price: updated!.price, timeline: updated!.timeline },
            { id: quote.rfq.id, title: quote.rfq.title, createdBy: quote.rfq.createdBy },
            buyer
          );
        }).catch(err => console.error('[Orchestration] onCounterOffer:', err));

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action for your role' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, quote: updated });
  } catch (error) {
    console.error('Negotiation error:', error);
    return NextResponse.json({ success: false, error: 'Negotiation action failed' }, { status: 500 });
  }
}
