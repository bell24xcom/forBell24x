/**
 * H6-13 — Campaign state machine (pure logic, no I/O)
 *
 * A new campaign MUST start DRAFT. LIVE is reachable only via explicit,
 * sequential promotion (DRAFT → DRY_RUN → READY → LIVE) — never skipped,
 * never automatic. `canInvokeTransport` is the single source of truth for
 * "is this status allowed to call a transport provider" — every send path
 * must consult it rather than re-deriving the rule.
 */

export type CampaignStatus = 'DRAFT' | 'DRY_RUN' | 'READY' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export const INITIAL_STATUS: CampaignStatus = 'DRAFT';

/** Allowed forward/side transitions. Terminal states (COMPLETED, CANCELLED) have none. */
const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ['DRY_RUN', 'CANCELLED'],
  DRY_RUN: ['DRAFT', 'READY', 'CANCELLED'], // DRY_RUN may be re-run from DRAFT any number of times
  READY: ['DRY_RUN', 'LIVE', 'CANCELLED'], // allow re-validating with another dry-run before going live
  LIVE: ['PAUSED', 'COMPLETED', 'CANCELLED'],
  PAUSED: ['LIVE', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: CampaignStatus, to: CampaignStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextAllowedStatuses(from: CampaignStatus): CampaignStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

/**
 * The single gate every send path must check before calling WhatsAppService
 * (or any future channel provider). Only LIVE may invoke transport.
 */
export function canInvokeTransport(status: CampaignStatus): boolean {
  return status === 'LIVE';
}

export function isTerminal(status: CampaignStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
