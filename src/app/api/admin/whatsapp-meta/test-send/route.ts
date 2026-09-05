/**
 * POST /api/admin/whatsapp-meta/test-send
 * Explicit, admin-triggered test send via the Meta WhatsApp Cloud API.
 *
 * Requires { to: string, confirm: true } in the body — never sends
 * automatically, never fires without both fields, never uses a stored
 * contact without the caller passing that exact number.
 *
 * If META_WHATSAPP_ACCESS_TOKEN / PHONE_NUMBER_ID / BUSINESS_ACCOUNT_ID
 * are not set, returns { sendResult: 'NOT_AVAILABLE' } — never fabricates
 * a success response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { sendTextMessage, getStatus } from '@/src/lib/whatsapp/WhatsAppService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const status = getStatus();
  if (status.status !== 'READY') {
    return NextResponse.json({
      success: true,
      sendResult: 'NOT_AVAILABLE',
      reason: 'Meta WhatsApp Cloud API is not configured on this deployment.',
      missing: status.missingSendVars,
    });
  }

  const body = await req.json().catch(() => ({}));
  const to = typeof body.to === 'string' ? body.to.trim() : '';
  const confirm = body.confirm === true;
  const message = typeof body.message === 'string' && body.message.trim()
    ? body.message.trim()
    : 'This is a VyaparSethu WhatsApp Cloud API test message.';

  if (!to) {
    return NextResponse.json({ success: false, error: 'to (recipient phone, E.164 digits) is required' }, { status: 400 });
  }
  if (!confirm) {
    return NextResponse.json(
      { success: false, error: 'confirm:true is required — this sends a real WhatsApp message to the given number.' },
      { status: 400 }
    );
  }

  const outcome = await sendTextMessage(to, message);

  if (outcome.status === 'NOT_CONFIGURED') {
    return NextResponse.json({ success: true, sendResult: 'NOT_AVAILABLE', missing: outcome.missing });
  }
  if (outcome.status === 'META_ERROR') {
    return NextResponse.json({
      success: false,
      sendResult: 'FAILED',
      httpStatus: outcome.httpStatus,
      errorCode: outcome.errorCode,
      errorMessage: outcome.errorMessage,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    sendResult: 'SENT',
    httpStatus: outcome.httpStatus,
    messageId: outcome.messageId,
    timestamp: new Date().toISOString(),
  });
}
