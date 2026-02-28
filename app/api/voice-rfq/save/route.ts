import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Save voice-generated RFQ to database
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const rfqData = await request.json();

    if (!rfqData || !rfqData.title) {
      return NextResponse.json(
        { success: false, error: 'Invalid RFQ data' },
        { status: 400 }
      );
    }

    // Parse quantity from string like "1000 units" -> number
    const quantityMatch = rfqData.quantity?.match(/(\d+)/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

    // Parse budget from string like "₹2.5L - ₹3.5L" -> numbers
    const budgetMatch = rfqData.budget?.match(/₹([\d.]+)L?\s*-?\s*₹?([\d.]+)?L?/);
    const minBudget = budgetMatch ? parseFloat(budgetMatch[1]) * (budgetMatch[1].includes('L') ? 100000 : 1) : null;
    const maxBudget = budgetMatch && budgetMatch[2] ? parseFloat(budgetMatch[2]) * 100000 : null;

    // Save to database with status OPEN
    const savedRFQ = await prisma.rFQ.create({
      data: {
        title: rfqData.title,
        description: rfqData.description || '',
        category: rfqData.category || 'Other',
        quantity: quantity,
        unit: rfqData.quantity?.replace(/\d+/g, '').trim() || 'units',
        minBudget: minBudget,
        maxBudget: maxBudget,
        timeline: rfqData.timeline || 'flexible',
        urgency: rfqData.timeline === 'urgent' ? 'URGENT' : 'NORMAL',
        status: 'OPEN',
        createdBy: payload.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json({
      success: true,
      rfq: {
        id: savedRFQ.id,
        title: savedRFQ.title,
        category: savedRFQ.category,
        status: savedRFQ.status,
        createdAt: savedRFQ.createdAt.toISOString(),
      },
      message: 'RFQ saved successfully',
    });
  } catch (error) {
    console.error('Error saving voice RFQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save RFQ' },
      { status: 500 }
    );
  }
}
