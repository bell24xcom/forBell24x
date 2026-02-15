import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        suppliers: true,
        transactions: true
      }
    });
    
    return NextResponse.json({ leads });
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch leads' 
    }, { status: 500 });
  }
}
