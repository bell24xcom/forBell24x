import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // EscrowTransaction model not yet in Prisma schema — return empty until migration
    // TODO: Add EscrowTransaction model to schema.prisma and run migration
    return NextResponse.json({
      success: true,
      escrows: [],
      message: 'Escrow service coming soon. Complete a deal to use escrow payments.',
    });
  } catch (error) {
    console.error('Error fetching escrow transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // EscrowTransaction model not yet in Prisma schema
  return NextResponse.json(
    { success: false, error: 'Escrow service coming soon' },
    { status: 501 }
  );
}

export async function PUT(request: NextRequest) {
  // EscrowTransaction model not yet in Prisma schema
  return NextResponse.json(
    { success: false, error: 'Escrow service coming soon' },
    { status: 501 }
  );
}