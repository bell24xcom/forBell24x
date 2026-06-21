import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Bell24hAIClient } from '@/lib/ai-client';

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
    let { rfqId, category, budget, location, requirements } = body;

    if (!rfqId && (!category || !budget)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch RFQ if rfqId is provided
    let rfq;
    if (rfqId) {
      rfq = await prisma.rFQ.findUnique({
        where: { id: rfqId },
        include: {
          user: { select: { name: true, company: true, location: true } },
        },
      });

      if (!rfq) {
        return NextResponse.json(
          { error: 'RFQ not found' },
          { status: 404 }
        );
      }

      category = rfq.category;
      budget = rfq.maxBudget;
      location = rfq.location;
      requirements = rfq.description;
    }

    // Find matching suppliers
    const suppliers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        isActive: true,
        isVerified: true,
        OR: [
          { company: { contains: category, mode: 'insensitive' } },
          {
            quotes: {
              some: {
                rfq: { category: { contains: category, mode: 'insensitive' } },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        company: true,
        location: true,
        gstNumber: true,
        isVerified: true,
        quotes: {
          select: {
            rfq: {
              select: {
                category: true,
                maxBudget: true,
              },
            },
          },
        },
      },
      take: 20,
    });

    if (suppliers.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
      });
    }

    // Use AI to rank and score suppliers
    const aiClient = new Bell24hAIClient();
const supplierList = suppliers.map((supplier) => ({
      supplierId: supplier.id,
      name: supplier.name,
      company: supplier.company,
      location: supplier.location,
      gstNumber: supplier.gstNumber,
      isVerified: supplier.isVerified,
      quoteCount: supplier.quotes.length,
    }));

    const prompt = `Score these suppliers from 1-10 for an RFQ about "${rfq?.title || category}" in category "${category}" with budget ₹${budget}. Suppliers: ${JSON.stringify(supplierList, null, 2)}. Return JSON array with supplierId and score and reason. Be concise.`;
    const aiResponse = await aiClient.generateText({
      model: 'deepseek-ai/deepseek-v3',
      prompt,
      maxTokens: 200,
    });

    let aiScores;
    try {
      aiScores = JSON.parse(aiResponse.text || '[]');
    } catch (e) {
      aiScores = [];
    }

    // Combine AI scores with supplier data
    const categoryLower = (category || '').toLowerCase();
    const locationLower = (location || '').toLowerCase();

    const matches = supplierList.map((supplier) => {
      const aiScore = aiScores.find((s: any) => s.supplierId === supplier.supplierId);
      const rawScore = Math.min(10, Math.max(0, aiScore?.score || 0));
      const matchScore = rawScore / 10;

      const featureImportance = [
        {
          feature: 'category',
          label: 'Category Match',
          score: supplier.company?.toLowerCase().includes(categoryLower) ? 0.9 : Math.min(0.85, matchScore + 0.1),
        },
        {
          feature: 'location',
          label: 'Location',
          score: locationLower && supplier.location?.toLowerCase().includes(locationLower) ? 0.88 : 0.5,
        },
        {
          feature: 'verified',
          label: 'Verified Status',
          score: supplier.isVerified ? 1.0 : 0.2,
        },
        {
          feature: 'activity',
          label: 'Quote Activity',
          score: Math.min(1, (supplier.quoteCount || 0) / 10),
        },
      ];

      return {
        id: supplier.supplierId,
        name: supplier.name,
        company: supplier.company,
        location: supplier.location,
        isVerified: supplier.isVerified,
        trustScore: 0,
        matchScore,
        reasons: aiScore?.reason ? [aiScore.reason] : ['Matched by category'],
        featureImportance,
      };
    });

    // Sort by matchScore and take top 5
    const topMatches = matches
      .filter((match) => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      matches: topMatches,
    });
  } catch (error) {
    console.error('Error in smart matching API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}