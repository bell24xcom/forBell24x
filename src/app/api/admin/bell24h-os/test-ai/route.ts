/**
 * POST /api/admin/bell24h-os/test-ai
 *
 * OS-INTEGRATION-IMPLEMENTATION-01 — the ONE admin-gated integration test
 * route for the VyaparSethu -> Bell24h-OS -> /api/v1/ai/text -> NVIDIA path.
 *
 * This is strictly an integration-verification endpoint, not a public or
 * general-purpose AI API:
 *   - the prompt is fixed server-side, never caller-supplied
 *   - the provider is fixed server-side ('nvidia' — the one Gate A/Gate B
 *     proved end-to-end), never caller-selectable
 *   - the Bell24h-OS base URL is never caller-supplied (env var only)
 *   - no header, provider name, or URL from the request body is ever
 *     forwarded to Bell24h-OS - this is not a proxy
 *   - requires explicit { confirm: true } in the body, mirroring the H6-12
 *     WhatsApp test-send pattern - never fires automatically
 *
 * If Bell24h-OS is not configured (BELL24H_OS_BASE_URL /
 * BELL24H_VYAPARSETHU_SERVICE_TOKEN unset), returns
 * { testResult: 'NOT_AVAILABLE' } - never fabricates a success response.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { generateAiText, getSafeStatus } from '@/src/lib/bell24h-os/client';

export const dynamic = 'force-dynamic';

const FIXED_TEST_PROMPT = 'Return exactly: BELL24H-OS-INTEGRATION-OK';
const FIXED_TEST_PROVIDER = 'nvidia' as const;

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const status = getSafeStatus();
  if (status.status !== 'READY') {
    return NextResponse.json({
      success: true,
      testResult: 'NOT_AVAILABLE',
      reason: 'Bell24h-OS integration is not configured on this deployment.',
      missing: status.missing,
    });
  }

  const body = await req.json().catch(() => ({}));
  const confirm = body?.confirm === true;
  if (!confirm) {
    return NextResponse.json(
      {
        success: false,
        error: 'confirm:true is required - this calls Bell24h-OS\'s live /api/v1/ai/text endpoint, which reaches NVIDIA\'s real production API.',
      },
      { status: 400 }
    );
  }

  const startedAt = Date.now();
  const outcome = await generateAiText(FIXED_TEST_PROMPT, FIXED_TEST_PROVIDER);
  const durationMs = Date.now() - startedAt;

  // Safe logging only - operation name, outcome, status, duration, request
  // ID. Never the service token, never the full prompt/response text.
  logger.info('[bell24h-os test-ai]', {
    outcome: outcome.status,
    durationMs,
    requestId: 'requestId' in outcome ? outcome.requestId : undefined,
  });

  if (outcome.status === 'NOT_CONFIGURED') {
    return NextResponse.json({ success: true, testResult: 'NOT_AVAILABLE', missing: outcome.missing });
  }

  if (outcome.status === 'ERROR') {
    return NextResponse.json({
      success: false,
      testResult: 'FAILED',
      httpStatus: outcome.httpStatus,
      errorCode: outcome.errorCode,
      // outcome.message originates from Bell24h-OS's own canonical error
      // envelope (never a raw stack trace or filesystem path) or from this
      // client's own typed network/timeout branches - safe to return as-is.
      errorMessage: outcome.message,
      retryable: outcome.retryable,
      requestId: outcome.requestId,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    testResult: 'OK',
    // The response text is the deterministic proof marker requested, safe
    // to return in full - this route never sends a caller-supplied or
    // business-sensitive prompt.
    text: outcome.text,
    requestId: outcome.requestId,
    durationMs,
    timestamp: new Date().toISOString(),
  });
}

/** GET - status only, no call made. Mirrors /api/admin/whatsapp-meta/status. */
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  return NextResponse.json({ success: true, ...getSafeStatus() });
}
