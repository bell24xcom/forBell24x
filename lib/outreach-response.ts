/**
 * Interprets the result of an outreach "mark as sent" POST call
 * (follow-up / drip). Never assumes success without checking the real
 * HTTP response — a thrown/network error, a non-2xx status, and a body
 * without `success: true` are all treated as failure.
 */
export interface OutreachActionResult {
  ok: boolean;
  message?: string;
}

export async function interpretOutreachResponse(res: Response | null): Promise<OutreachActionResult> {
  if (!res) {
    return { ok: false, message: 'Network error — please try again.' };
  }
  if (res.status === 401 || res.status === 403) {
    return { ok: false, message: 'Admin session required — please log in again.' };
  }
  if (!res.ok) {
    return { ok: false, message: 'Failed to mark as sent — please try again.' };
  }

  const data = await res.json().catch(() => null);
  if (!data || data.success !== true) {
    return { ok: false, message: (data && data.error) || 'Failed to mark as sent — please try again.' };
  }
  return { ok: true };
}
