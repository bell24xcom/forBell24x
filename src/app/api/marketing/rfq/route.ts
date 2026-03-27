import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { RfqCreateSchema } from '@/lib/validations';
import { validateExternalUrl, generateSecureId, createSafeObject } from '@/lib/security';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const requestId = generateSecureId('req');
  
  try {
    // 1. AUTHENTICATION CHECK (CRITICAL FIX)
    const session = await getServerSession();
    if (!session) {
      logger.security('Unauthorized RFQ submission attempt', { requestId });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    
    // 2. Input Validation
    const validation = RfqCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const data = createSafeObject(validation.data);
    const INSFORGE_URL = process.env.INSFORGE_URL;
    const INSFORGE_API_KEY = process.env.INSFORGE_API_KEY;
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    const N8N_SECRET = process.env.N8N_SECRET; // SHARED SECRET

    // 3. Transform
    const rfqPayload = {
      id: generateSecureId('rfq'),
      user_id: (session.user as any)?.id || 'unknown',
      ...data,
      status: 'new',
      created_at: new Date().toISOString()
    };

    // 4. Secure REST call
    const insforgeRes = await fetch(`${INSFORGE_URL}/rest/v1/rfqs`, {
      method: 'POST',
      headers: {
        'apikey': INSFORGE_API_KEY!,
        'Authorization': `Bearer ${INSFORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([rfqPayload])
    });

    // 5. SECURE WEBHOOK (SHARED SECRET)
    if (N8N_WEBHOOK_URL && validateExternalUrl(N8N_WEBHOOK_URL)) {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-webhook-secret': N8N_SECRET || '' // Verify in n8n
        },
        body: JSON.stringify({ event: 'rfq_created', rfq: rfqPayload })
      }).catch(err => logger.error('n8n trigger failed', { requestId, error: err.message }));
    }

    return NextResponse.json({ success: true, rfq_id: rfqPayload.id });

  } catch (error: any) {
    logger.error('API Request failed', { requestId, error: error.message });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
