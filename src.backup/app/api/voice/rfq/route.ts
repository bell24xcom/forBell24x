import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const rfqs = await prisma.voiceRFQ.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ rfqs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch voice RFQs' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';