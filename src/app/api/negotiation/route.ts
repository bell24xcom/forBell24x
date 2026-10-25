import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { generateAiText } from '@/src/lib/bell24h-os/client';
import { resolveNegotiationAiSuggestion } from '@/lib/negotiation-ai-suggestion';
import { isNegotiationActionAuthorized } from '@/lib/negotiation-authorization';
import { acceptQuote } from '@/lib/quote-acceptance';
import { onQuoteRejected, onCounterOffer } from '@/lib/orchestration';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { quoteId, action, counterPrice, counterTerms, message } = body;

    if (!quoteId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['accept', 'counter', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // 'accept' bypasses the shared buyer/supplier gate below and the shared
    // quote fetch entirely: acceptQuote() (lib/quote-acceptance.ts) does its
    // own, stricter authorization (self-accept forbidden, non-owner forbidden,
    // ADMIN override allowed — none of which `isNegotiationActionAuthorized`
    // can express) plus the atomic Deal creation, competing-quote rejection,
    // and post-commit notification that a plain `quote.update` never did.
    if (action === 'accept') {
      const result = await acceptQuote({
        quoteId,
        actor: { id: user.userId, role: user.role },
        source: 'negotiation',
      });

      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error, code: result.code },
          { status: result.status }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'accept',
        deal: {
          id: result.deal.id,
          price: result.deal.price,
          status: result.deal.status,
        },
        quote: result.quote,
      });
    }

    // Fetch quote and RFQ (reject / counter only — accept returned above)
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: true,
        supplier: { select: { name: true, company: true, email: true } },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized for this action (buyer or supplier — see
    // lib/negotiation-authorization.ts)
    const isBuyer = quote.rfq.createdBy === user.userId;
    const isSupplier = quote.supplierId === user.userId;

    if (!isNegotiationActionAuthorized(action, { isBuyer, isSupplier })) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (action === 'reject') {
      // Compare-and-set: only the first reject transitions the quote and
      // fires the notification. A retry against an already-REJECTED quote
      // is a no-op response, not a second notification.
      const { count } = await prisma.quote.updateMany({
        where: { id: quoteId, status: { not: 'REJECTED' } },
        data: { status: 'REJECTED' },
      });

      if (count === 1 && quote.supplierId) {
        try {
          await onQuoteRejected(
            { id: quote.id, price: quote.price },
            { id: quote.rfq.id, title: quote.rfq.title },
            { id: quote.supplierId, name: quote.supplier.name ?? null, email: quote.supplier.email ?? null }
          );
        } catch (e) {
          console.error('[Negotiation] onQuoteRejected failed:', e instanceof Error ? e.message : e);
        }
      }

      return NextResponse.json({
        success: true,
        action: 'reject',
      });
    } else if (action === 'counter') {
      if (counterPrice === undefined) {
        return NextResponse.json(
          { error: 'Counter price is required for counter action' },
          { status: 400 }
        );
      }

      // Use Bell24h-OS's shared AI service to generate a counteroffer
      // suggestion. Provider credentials, routing and provider execution
      // all live in Bell24h-OS; this route only sends a prompt and
      // interprets the result.
      const rfq = quote.rfq;
      const supplier = quote.supplier;

      const prompt = `Given an RFQ for "${rfq.title}" with budget ₹${rfq.maxBudget}, supplier quoted ₹${quote.price}, buyer counter-offers ₹${counterPrice}. Generate a professional negotiation response in 2 sentences. Be concise and suggest a middle ground.`;
      // No provider override: this replaces a broken direct SDK call
      // (`new Bell24hAIClient().generateText(...)`, which throws -
      // `generateText` does not exist on that client) with the real
      // Bell24h-OS integration. Bell24h-OS's currently supported providers
      // are 'nvidia' | 'gemini' (src/lib/bell24h-os/client.ts); omitting the
      // argument uses its own default (Gemini) rather than guessing a
      // provider choice as part of this fix.
      const aiOutcome = await generateAiText(prompt);
      const aiSuggestionResult = resolveNegotiationAiSuggestion(aiOutcome);

      // Preserves today's existing behavior: an AI failure halts the whole
      // request before the counter-offer is persisted below. This is the
      // same persistence timing as before this change (previously via an
      // uncaught TypeError into the outer catch; now via this explicit,
      // safely-typed check) - intentionally not changed as part of this fix.
      if (!aiSuggestionResult.proceed) {
        console.error('[Negotiation] AI suggestion unavailable:', aiOutcome.status, 'requestId' in aiOutcome ? aiOutcome.requestId : undefined);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      const aiSuggestion = aiSuggestionResult.suggestion;

      // Store negotiation event in quote metadata
      const negotiationLog = {
        action: 'counter',
        counterPrice,
        counterTerms,
        message,
        aiSuggestion,
        createdAt: new Date().toISOString(),
        userId: user.userId,
      };

      // Update quote notes with negotiation history
      const existingNotes = quote.notes ? JSON.parse(quote.notes) : [];
      existingNotes.push(negotiationLog);

      const updatedQuote = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          notes: JSON.stringify(existingNotes),
        },
      });

      // onCounterOffer only notifies the buyer (lib/orchestration.ts) — a
      // pre-existing, buyer-only notification design. When the supplier is
      // the one countering, this still notifies the buyer (correct); when
      // the buyer counters a supplier's quote, the supplier receives no
      // notification here. Known directional gap, not introduced by this
      // change — flagged rather than silently rebuilt into a two-way design.
      const buyerId = quote.rfq.createdBy;
      if (buyerId) {
        try {
          const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { name: true, email: true } });
          await onCounterOffer(
            { id: updatedQuote.id, price: counterPrice, timeline: updatedQuote.timeline ?? quote.timeline ?? '' },
            { id: quote.rfq.id, title: quote.rfq.title, createdBy: buyerId },
            { id: buyerId, name: buyer?.name ?? null, email: buyer?.email ?? null }
          );
        } catch (e) {
          console.error('[Negotiation] onCounterOffer failed:', e instanceof Error ? e.message : e);
        }
      }

      return NextResponse.json({
        success: true,
        action: 'counter',
        aiSuggestion,
        counterPrice,
        message,
        quote: {
          id: updatedQuote.id,
          rfqId: updatedQuote.rfqId,
          supplierId: updatedQuote.supplierId,
          price: updatedQuote.price,
          quantity: updatedQuote.quantity,
          timeline: updatedQuote.timeline,
          description: updatedQuote.description,
          terms: updatedQuote.terms,
          status: updatedQuote.status,
          createdAt: updatedQuote.createdAt,
        },
      });
    }
  } catch (error) {
    console.error('Error in negotiation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get quote ID from query params
    const quoteId = request.nextUrl.searchParams.get('quoteId');

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    // Fetch quote with negotiation history
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: true,
        supplier: { select: { name: true, company: true } },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Parse negotiation history from notes
    const negotiationHistory = quote.notes ? JSON.parse(quote.notes) : [];

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        rfqId: quote.rfqId,
        rfq: {
          id: quote.rfq.id,
          title: quote.rfq.title,
          category: quote.rfq.category,
          description: quote.rfq.description,
          quantity: quote.rfq.quantity,
          budget: quote.rfq.maxBudget,
          timeline: quote.rfq.timeline,
          urgency: quote.rfq.urgency,
          location: quote.rfq.location,
          user: {
            id: quote.rfq.createdBy,
            name: quote.rfq.user.name,
            company: quote.rfq.user.company,
          },
        },
        supplierId: quote.supplierId,
        supplier: {
          id: quote.supplierId,
          name: quote.supplier.name,
          company: quote.supplier.company,
        },
        price: quote.price,
        quantity: quote.quantity,
        timeline: quote.timeline,
        description: quote.description,
        terms: quote.terms,
        status: quote.status,
        createdAt: quote.createdAt,
        negotiationHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching negotiation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}