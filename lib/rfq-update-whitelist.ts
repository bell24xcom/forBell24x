/**
 * Whitelist for PUT /api/admin/rfqs's `updates` payload (PR63). That route
 * previously wrote `updates` straight into prisma.rFQ.update with no field
 * restriction — any admin-authenticated caller could set any column, not
 * just the two fields src/app/admin/rfqs/page.tsx's UI actually sends
 * (`status` on close, `expiresAt` on extend — confirmed by reading that
 * page's only call site, patchRFQ, before writing this list).
 *
 * No Prisma import here on purpose: the caller passes in the set of valid
 * status values, so this module stays a trivially unit-testable pure
 * function with zero framework/DB dependency.
 */
export const ALLOWED_RFQ_UPDATE_FIELDS = ['status', 'expiresAt'] as const;
export type AllowedRfqUpdateField = (typeof ALLOWED_RFQ_UPDATE_FIELDS)[number];

export interface RfqUpdatePayload {
  status?: string;
  expiresAt?: string | Date;
}

export type RfqUpdateValidation =
  | { ok: true; safeUpdates: { status?: string; expiresAt?: Date } }
  | { ok: false; status: 400; error: string };

export function validateRfqUpdate(
  updates: unknown,
  validStatuses: readonly string[]
): RfqUpdateValidation {
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return { ok: false, status: 400, error: 'updates must be an object' };
  }

  const keys = Object.keys(updates as Record<string, unknown>);
  const unknownFields = keys.filter(
    (key) => !ALLOWED_RFQ_UPDATE_FIELDS.includes(key as AllowedRfqUpdateField)
  );
  if (unknownFields.length > 0) {
    return {
      ok: false,
      status: 400,
      error: `Unsupported update field(s): ${unknownFields.join(', ')}. Allowed: ${ALLOWED_RFQ_UPDATE_FIELDS.join(', ')}.`,
    };
  }

  const body = updates as RfqUpdatePayload;

  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    return {
      ok: false,
      status: 400,
      error: `Invalid status "${body.status}". Allowed: ${validStatuses.join(', ')}.`,
    };
  }

  const safeUpdates: { status?: string; expiresAt?: Date } = {};
  if (body.status !== undefined) safeUpdates.status = body.status;
  if (body.expiresAt !== undefined) safeUpdates.expiresAt = new Date(body.expiresAt);

  return { ok: true, safeUpdates };
}
