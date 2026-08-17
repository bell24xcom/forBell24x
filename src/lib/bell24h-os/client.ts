/**
 * VyaparSethu -> Bell24h-OS AI v1 client
 *
 * OS-INTEGRATION-IMPLEMENTATION-01 — the first controlled Gate B
 * implementation, scoped to exactly one capability:
 *
 *   VyaparSethu -> this client -> Bell24h-OS requireServiceAuth
 *                -> POST /api/v1/ai/text -> AI Provider Manager -> NVIDIA/Gemini
 *
 * This is the ONLY module in the codebase that should construct requests to
 * a Bell24h-OS URL. VyaparSethu business logic must never call NVIDIA,
 * Gemini, or any other AI provider SDK directly to reach this capability -
 * it goes through this client, which goes through Bell24h-OS, which owns
 * provider selection entirely. Mirrors the H6-12
 * src/lib/whatsapp/MetaWhatsAppProvider.ts boundary pattern, kept as a
 * single file (rather than the WhatsApp module's 3-file split) per this
 * sprint's explicit "intentionally minimal client" instruction and because
 * this module has exactly one operation.
 *
 * Server-side only. Never import this from a client component.
 *
 * Contract verified against current Bell24h-OS source this sprint:
 *   - server/middleware/requireServiceAuth.ts (header, failure codes)
 *   - server.ts, POST /api/v1/ai/text (request/response shape)
 *   - server/lib/errors.ts (canonical error envelope)
 *   - server/lib/requestContext.ts (X-Request-Id contract)
 * No discrepancy was found against docs/project/BELL24H-OS-VYAPARSETHU-SDK-API-CONTRACT-v1.0.md
 * or docs/project/OS-INTEGRATION-GATE-B-01-READINESS-AUDIT.md.
 */

// ─── Configuration ───────────────────────────────────────────────────────
//
// Reads server-side environment variables only. Never exposes the service
// token value to a caller - callers get booleans and safe display strings
// only, matching the H6-12 src/lib/whatsapp/config.ts convention.
//
// Required for a live call:
//   BELL24H_OS_BASE_URL                 (Bell24h-OS deployment base URL, e.g.
//                                        https://digitex-erp-bell24h-os.vercel.app)
//   BELL24H_VYAPARSETHU_SERVICE_TOKEN   (shared secret - must equal the exact
//                                        value configured under the same name
//                                        on the Bell24h-OS side; see
//                                        server/middleware/requireServiceAuth.ts
//                                        in the Bell24h-OS repository)
//
// Neither is configured in this repository as of this sprint. This module
// must never fabricate a value, never fall back to a hardcoded/default URL
// (localhost or otherwise), and never fall back to a default secret.

interface Bell24hOsConfig {
  baseUrl: string | undefined;
  serviceToken: string | undefined;
}

function readConfig(): Bell24hOsConfig {
  return {
    baseUrl: process.env.BELL24H_OS_BASE_URL || undefined,
    serviceToken: process.env.BELL24H_VYAPARSETHU_SERVICE_TOKEN || undefined,
  };
}

/** Vars required to actually call Bell24h-OS. */
export function getReadiness(): { ready: boolean; missing: string[] } {
  const cfg = readConfig();
  const missing: string[] = [];
  if (!cfg.baseUrl) missing.push('BELL24H_OS_BASE_URL');
  if (!cfg.serviceToken) missing.push('BELL24H_VYAPARSETHU_SERVICE_TOKEN');
  return { ready: missing.length === 0, missing };
}

/**
 * Safe status snapshot for an Admin UI or diagnostic route - booleans and a
 * non-secret base URL only. Never returns the service token value.
 */
export function getSafeStatus() {
  const cfg = readConfig();
  const readiness = getReadiness();
  return {
    provider: 'Bell24h-OS' as const,
    status: readiness.ready ? ('READY' as const) : ('NOT_CONFIGURED' as const),
    baseUrlConfigured: !!cfg.baseUrl,
    // The base URL itself is not a secret (it's a deployment URL, not a
    // credential) - safe to surface for operator diagnostics.
    baseUrl: cfg.baseUrl,
    tokenConfigured: !!cfg.serviceToken,
    missing: readiness.missing,
  };
}

// ─── Client ───────────────────────────────────────────────────────────────

const SERVICE_TOKEN_HEADER = 'X-Bell24h-Service-Token';
const REQUEST_ID_HEADER = 'X-Request-Id';
const REQUEST_TIMEOUT_MS = 15000;

export type Bell24hOsAiProvider = 'nvidia' | 'gemini';

/** Bell24h-OS's canonical error codes (server/lib/errors.ts, CanonicalErrorCode). */
export type Bell24hOsErrorCode =
  | 'AUTHENTICATION_FAILED'
  | 'AUTHORIZATION_DENIED'
  | 'TENANT_NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'TIMEOUT'
  | 'DUPLICATE_REQUEST'
  | 'POLICY_DENIED'
  | 'HUMAN_APPROVAL_REQUIRED'
  | 'RESOURCE_NOT_FOUND'
  | 'INTERNAL_ERROR';

export type Bell24hOsAiTextOutcome =
  | { status: 'OK'; text: string; requestId: string; httpStatus: 200 }
  | { status: 'NOT_CONFIGURED'; missing: string[] }
  | {
      status: 'ERROR';
      httpStatus: number;
      errorCode?: Bell24hOsErrorCode;
      message: string;
      retryable?: boolean;
      requestId?: string;
    };

function generateRequestId(): string {
  // Bell24h-OS's own X-Request-Id contract accepts ^[A-Za-z0-9_.-]{1,128}$ -
  // a UUID (hex digits + hyphens) satisfies this pattern.
  return `vyaparsethu_${crypto.randomUUID()}`;
}

/**
 * Calls Bell24h-OS's POST /api/v1/ai/text on behalf of VyaparSethu's fixed
 * service identity. `provider` is an optional caller preference between the
 * two providers Bell24h-OS currently supports - omitting it uses Bell24h-OS's
 * own default (Gemini). This function never selects a provider on its own
 * initiative and never constructs a request to any provider directly -
 * provider routing is entirely Bell24h-OS's responsibility.
 *
 * Never throws for a missing-configuration or upstream-error condition -
 * always returns a typed outcome.
 */
export async function generateAiText(
  prompt: string,
  provider?: Bell24hOsAiProvider
): Promise<Bell24hOsAiTextOutcome> {
  const readiness = getReadiness();
  if (!readiness.ready) {
    return { status: 'NOT_CONFIGURED', missing: readiness.missing };
  }

  const cfg = readConfig();
  const baseUrl = cfg.baseUrl!;
  const serviceToken = cfg.serviceToken!;

  const requestId = generateRequestId();
  const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/ai/text`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        [SERVICE_TOKEN_HEADER]: serviceToken,
        [REQUEST_ID_HEADER]: requestId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(provider ? { prompt, provider } : { prompt }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    // Network-level failure (unreachable, DNS, or our own timeout) - never
    // include the service token in the thrown/returned error.
    const isAbort = err instanceof Error && err.name === 'TimeoutError';
    return {
      status: 'ERROR',
      httpStatus: 0,
      errorCode: isAbort ? 'TIMEOUT' : undefined,
      message: isAbort
        ? `Bell24h-OS did not respond within ${REQUEST_TIMEOUT_MS}ms`
        : `Network error calling Bell24h-OS: ${err instanceof Error ? err.message : 'unknown'}`,
      retryable: isAbort,
      requestId,
    };
  }

  const data = await res.json().catch(() => ({}) as Record<string, unknown>);

  if (!res.ok) {
    // Bell24h-OS's canonical error envelope: { error_code, message, request_id, correlation_id, retryable, details? }
    return {
      status: 'ERROR',
      httpStatus: res.status,
      errorCode: typeof data.error_code === 'string' ? (data.error_code as Bell24hOsErrorCode) : undefined,
      message: typeof data.message === 'string' ? data.message : `Bell24h-OS returned HTTP ${res.status}`,
      retryable: typeof data.retryable === 'boolean' ? data.retryable : undefined,
      requestId: typeof data.request_id === 'string' ? data.request_id : requestId,
    };
  }

  // Success shape: { text: string, requestId: string }
  if (typeof data.text !== 'string') {
    return {
      status: 'ERROR',
      httpStatus: res.status,
      message: 'Bell24h-OS returned HTTP 200 with an unexpected response shape (missing text field)',
      requestId: typeof data.requestId === 'string' ? data.requestId : requestId,
    };
  }

  return {
    status: 'OK',
    text: data.text,
    requestId: typeof data.requestId === 'string' ? data.requestId : requestId,
    httpStatus: 200,
  };
}
