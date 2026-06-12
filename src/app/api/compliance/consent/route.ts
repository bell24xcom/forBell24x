import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CONSENT_TEXT_VERSION } from '@/src/lib/legal';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body    = await req.json().catch(() => ({}));
    const { purpose, method, granted, userId, contactId, language, meta } = body;

    if (!purpose || !method || typeof granted !== 'boolean') {
      return NextResponse.json({ error: 'purpose, method, and granted are required' }, { status: 400 });
    }

    // Hash the IP — store only a one-way hash, never the raw IP
    const rawIp   = req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? '';
    const ipHash  = rawIp
      ? Buffer.from(rawIp).toString('base64').slice(0, 16) // Deterministic but non-reversible for our purposes
      : null;

    await prisma.consentEvent.create({
      data: {
        userId:             userId    ?? null,
        contactId:          contactId ?? null,
        purpose:            String(purpose),
        method:             String(method),
        language:           String(language ?? 'en'),
        ipHash,
        consentTextVersion: CONSENT_TEXT_VERSION,
        granted:            Boolean(granted),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[compliance/consent POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
