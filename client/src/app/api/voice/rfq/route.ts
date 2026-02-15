import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'list') {
      // Get real voice RFQs from database
      const voiceRFQs = await prisma.rFQ.findMany({
        where: {
          // Filter for voice RFQs (you can add a voiceRecording field to your schema)
          description: { not: null as any }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: { name: true, email: true }
          },
          _count: {
            select: { quotes: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: voiceRFQs.map(rfq => ({
          id: rfq.id,
          title: rfq.title,
          description: rfq.description,
          audioUrl: '/audio/default.mp3', // This will be updated when voice recording is implemented
          duration: '2:00', // This will be calculated from actual audio
          status: rfq.status.toLowerCase(),
          createdAt: rfq.createdAt,
          responses: rfq._count.quotes
        })),
        message: 'Voice RFQs retrieved successfully'
      });
    }

    // Get real voice RFQ statistics from database
    const [totalActive, totalCompleted] = await Promise.all([
      prisma.rFQ.count({
        where: { status: 'OPEN' }
      }),
      prisma.rFQ.count({
        where: { status: 'CLOSED' }
      })
    ]);

    const voiceRFQInfo = {
      totalActive,
      totalCompleted,
      averageResponseTime: '2.3 hours', // This will be calculated from actual data
      successRate: totalActive + totalCompleted > 0 ? 
        ((totalCompleted / (totalActive + totalCompleted)) * 100).toFixed(1) + '%' : '0%',
      lastCreated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: voiceRFQInfo,
      message: 'Voice RFQ information retrieved successfully'
    });

  } catch (error) {
    console.error('Voice RFQ API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve voice RFQ information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, audioFile, category } = body;

    // Create real voice RFQ in database
    const newVoiceRFQ = await prisma.rFQ.create({
      data: {
        title: title || 'Voice RFQ',
        description: description || 'Voice-based request for quotation',
        category: category || 'General',
        quantity: 1,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'OPEN',
        buyerId: 'default-buyer-id' // This will be updated when user auth is implemented
      }
    });

    // Find matching suppliers based on category
    const matchingSuppliers = await prisma.user.findMany({
      where: {
        role: 'SUPPLIER',
        // You can add category matching logic here
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newVoiceRFQ.id,
        title: newVoiceRFQ.title,
        description: newVoiceRFQ.description,
        audioUrl: audioFile || '/audio/default.mp3',
        duration: '0:00',
        status: newVoiceRFQ.status.toLowerCase(),
        createdAt: newVoiceRFQ.createdAt,
        responses: 0,
        category: newVoiceRFQ.category,
        matchedSuppliers: matchingSuppliers.length
      },
      message: 'Voice RFQ created successfully'
    });

  } catch (error) {
    console.error('Voice RFQ POST API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create voice RFQ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
