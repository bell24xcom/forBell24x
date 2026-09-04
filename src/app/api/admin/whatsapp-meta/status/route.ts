/**
 * GET /api/admin/whatsapp-meta/status
 * Returns non-secret configuration status for the Meta WhatsApp Cloud API
 * integration. Never returns access tokens or the app secret.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { getStatus } from '@/src/lib/whatsapp/WhatsAppService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  return NextResponse.json({ success: true, ...getStatus() });
}
