import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = (body?.title ?? '').trim();
    const description = (body?.description ?? '').trim();
    const quantityRaw = (body?.quantity ?? '').toString();
    const deadlineRaw = (body?.deadline ?? '').toString();
    const category = (body?.category ?? '').trim();
    const budgetRaw = (body?.budget ?? '').toString();
    const type = (body?.type ?? 'text').toString();
    const location = (body?.location ?? '').trim();

    if (!title || !description || !quantityRaw || !deadlineRaw) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quantity = parseInt(quantityRaw, 10);
    const deadline = new Date(deadlineRaw);
    const budgetNumber = budgetRaw ? Number(String(budgetRaw).replace(/[^0-9.]/g, '')) : undefined;

    const demoEmail = 'demo-buyer@bell24h.com';
    const demoUser = await prisma.user.upsert({
      where: { email: demoEmail },
      update: {},
      create: { email: demoEmail, role: 'BUYER', name: 'Demo Buyer', phone: '9999999999', isActive: true },
    });

    const created = await prisma.rFQ.create({
      data: {
        title,
        description,
        category: category || 'General',
        quantity,
        currency: 'INR',
        deadline,
        buyerId: demoUser.id,
        audioFile: type === 'voice' ? '' : null,
        videoFile: type === 'video' ? '' : null,
        transcript: null,
        specifications: location ? { location } : undefined,
        budget: budgetNumber !== undefined ? new Prisma.Decimal(budgetNumber) : undefined,
      },
    });

    return NextResponse.json({ success: true, message: 'RFQ created successfully', rfqId: created.id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// TODO: Implement these functions for production
async function processVideoForAnalysis(video: File) {
  // 1. Upload to cloud storage
  // 2. Extract audio for transcription
  // 3. Run AI analysis for requirements extraction
  // 4. Generate tags and keywords
  console.log('Processing video for analysis:', video.name);
}

async function triggerAIMatching(rfqData: any) {
  // 1. Analyze RFQ requirements
  // 2. Find matching suppliers
  // 3. Calculate match scores
  // 4. Send notifications
  console.log('Triggering AI matching for RFQ:', rfqData.id);
}

async function notifySuppliers(rfqData: any) {
  // 1. Get relevant suppliers based on category and requirements
  // 2. Send email/SMS notifications
  // 3. Update supplier dashboards
  console.log('Notifying suppliers for RFQ:', rfqData.id);
}
