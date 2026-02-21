import { NextRequest, NextResponse } from 'next/server';
import { jwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Bell24hAIClient } from '@/lib/ai-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await jwt.authenticate(request);
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

    // Fetch quote and RFQ
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

    // Check if user is authorized (buyer or supplier)
    const isBuyer = quote.rfq.createdBy === user.userId;
    const isSupplier = quote.supplierId === user.userId;

    if (!isBuyer && !isSupplier) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Handle different actions
    if (action === 'accept') {
      // Update quote status to ACCEPTED
      const updatedQuote = await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'ACCEPTED' },
      });

      return NextResponse.json({
        success: true,
        action: 'accept',
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
    } else if (action === 'reject') {
      // Update quote status to REJECTED
      const updatedQuote = await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'REJECTED' },
      });

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

      // Use AI to generate counteroffer suggestion
      const aiClient = new Bell24hAIClient();
      const rfq = quote.rfq;
      const supplier = quote.supplier;

      const prompt = `Given an RFQ for "${rfq.title}" with budget ₹${rfq.maxBudget}, supplier quoted ₹${quote.price}, buyer counter-offers ₹${counterPrice}. Generate a professional negotiation response in 2 sentences. Be concise and suggest a middle ground.`;
const aiResponse = await aiClient.generateText({
        model: 'deepseek-ai/deepseek-v3',
        prompt,
        maxTokens: 100,
      });

const aiSuggestion = aiResponse.text || 'Let me think about this offer and get back to you.';

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
    const user = await jwt.authenticate(request);
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