/**
 * VyaparSethu — Meta WhatsApp Cloud API configuration
 *
 * Reads server-side environment variables only. Never exposes actual
 * secret values — callers get booleans and safe display strings only.
 *
 * Required for LIVE_SEND:
 *   META_WHATSAPP_ACCESS_TOKEN        (permanent System User token)
 *   META_WHATSAPP_PHONE_NUMBER_ID     (Meta-assigned Phone Number ID — NOT the phone number itself)
 *   META_WHATSAPP_BUSINESS_ACCOUNT_ID (WABA ID)
 *
 * Optional (webhook readiness):
 *   META_WHATSAPP_APP_SECRET          (Meta App Secret — for X-Hub-Signature-256 verification)
 *   META_WHATSAPP_WEBHOOK_VERIFY_TOKEN (arbitrary string you choose, entered in Meta App dashboard)
 *
 * As of H6-12, none of these are set in this repository. This module
 * must never fabricate a value or fall back to a hardcoded default.
 */

export interface WhatsAppConfig {
  accessToken: string | undefined;
  phoneNumberId: string | undefined;
  businessAccountId: string | undefined;
  appSecret: string | undefined;
  webhookVerifyToken: string | undefined;
}

function readConfig(): WhatsAppConfig {
  return {
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || undefined,
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || undefined,
    businessAccountId: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || undefined,
    appSecret: process.env.META_WHATSAPP_APP_SECRET || undefined,
    webhookVerifyToken: process.env.META_WHATSAPP_WEBHOOK_VERIFY_TOKEN || undefined,
  };
}

/** Vars required to actually call the Meta Graph API (send messages). */
export function getSendReadiness(): { ready: boolean; missing: string[] } {
  const cfg = readConfig();
  const missing: string[] = [];
  if (!cfg.accessToken) missing.push('META_WHATSAPP_ACCESS_TOKEN');
  if (!cfg.phoneNumberId) missing.push('META_WHATSAPP_PHONE_NUMBER_ID');
  if (!cfg.businessAccountId) missing.push('META_WHATSAPP_BUSINESS_ACCOUNT_ID');
  return { ready: missing.length === 0, missing };
}

/** Vars required to safely verify inbound Meta webhooks. */
export function getWebhookReadiness(): { ready: boolean; missing: string[] } {
  const cfg = readConfig();
  const missing: string[] = [];
  if (!cfg.appSecret) missing.push('META_WHATSAPP_APP_SECRET');
  if (!cfg.webhookVerifyToken) missing.push('META_WHATSAPP_WEBHOOK_VERIFY_TOKEN');
  return { ready: missing.length === 0, missing };
}

/**
 * Safe status snapshot for the Admin UI — booleans and non-secret
 * identifiers only. Never returns accessToken or appSecret values.
 */
export function getSafeStatus() {
  const cfg = readConfig();
  const send = getSendReadiness();
  const webhook = getWebhookReadiness();

  return {
    provider: 'Meta WhatsApp Cloud API' as const,
    status: send.ready ? ('READY' as const) : ('NOT_CONFIGURED' as const),
    phoneConfigured: !!cfg.phoneNumberId,
    wabaConfigured: !!cfg.businessAccountId,
    tokenConfigured: !!cfg.accessToken,
    webhookConfigured: webhook.ready,
    capabilities: {
      textMessage: send.ready,
      templateMessage: send.ready,
      webhook: webhook.ready,
      deliveryStatus: webhook.ready,
    },
    missingSendVars: send.missing,
    missingWebhookVars: webhook.missing,
  };
}

/**
 * Internal accessor — only for use inside the provider/service layer. Never log the return value.
 *
 * Return type is an explicit `{ field: string }` object, not
 * `Required<Pick<WhatsAppConfig, ...>>`. WhatsAppConfig's fields are typed
 * `string | undefined` directly (not `field?: string`), so `Required<>` has
 * nothing to do — it only strips an optional `?` modifier, not an explicit
 * `| undefined` already present in the type. The function body already
 * guarantees real strings at runtime (the `if (!ready) throw` guard below,
 * plus the `!` assertions) — this only fixes the type annotation to match
 * what was already true, so tsc stops flagging every caller.
 */
export function getConfigOrThrow(): { accessToken: string; phoneNumberId: string; businessAccountId: string } {
  const cfg = readConfig();
  const { ready, missing } = getSendReadiness();
  if (!ready) {
    throw new WhatsAppConfigError(`WhatsApp (Meta) not configured — missing: ${missing.join(', ')}`);
  }
  return {
    accessToken: cfg.accessToken!,
    phoneNumberId: cfg.phoneNumberId!,
    businessAccountId: cfg.businessAccountId!,
  };
}

export function getAppSecretOrUndefined(): string | undefined {
  return readConfig().appSecret;
}

export function getWebhookVerifyTokenOrUndefined(): string | undefined {
  return readConfig().webhookVerifyToken;
}

/** Thrown when required env vars are absent — distinct from a Meta API error. */
export class WhatsAppConfigError extends Error {
  readonly code = 'WHATSAPP_NOT_CONFIGURED' as const;
}
