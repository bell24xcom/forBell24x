import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { requesterIdentifier, reason } = body;

    if (!requesterIdentifier?.trim()) {
      return NextResponse.json({ error: 'requesterIdentifier (phone or email) is required' }, { status: 400 });
    }

    // Try to resolve the userId from phone or email (best-effort; not required)
    const identifier = String(requesterIdentifier).trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
        ],
      },
      select: { id: true },
    }).catch(() => null);

    const request = await prisma.erasureRequest.create({
      data: {
        requesterIdentifier: identifier,
        status:  'RECEIVED',
        notes:   reason ? String(reason).slice(0, 1000) : null,
        userId:  user?.id ?? null,
      },
    });

    return NextResponse.json({ success: true, requestId: request.id });
  } catch (error: any) {
    console.error('[compliance/erasure-request POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
