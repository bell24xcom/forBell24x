/**
 * Discovery Engine — standardized InteractionMemory event types.
 */

import { prisma } from '@/lib/prisma';

export const DISCOVERY_EVENT_TYPES = [
  'discovery_ingested',
  'discovery_enriched',
  'outreach_queued',
  'invitation_sent',
  'profile_claimed',
] as const;

export type DiscoveryEventType = (typeof DISCOVERY_EVENT_TYPES)[number];

export interface DiscoveryEventPayload {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

/** Fire-and-forget discovery event — never blocks caller. */
export function logDiscoveryEvent(
  actionType: DiscoveryEventType,
  payload: DiscoveryEventPayload = {},
): void {
  prisma.interactionMemory
    .create({
      data: {
        actionType,
        userId: payload.userId ?? null,
        sessionId: payload.sessionId ?? null,
        source: 'discovery',
        metadata: payload.metadata ?? undefined,
      },
    })
    .catch((err) => console.error(`[Discovery] logDiscoveryEvent(${actionType}) failed:`, err));
}
