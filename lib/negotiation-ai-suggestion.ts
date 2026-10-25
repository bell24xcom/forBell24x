/**
 * Interprets a Bell24h-OS `generateAiText()` outcome for /api/negotiation's
 * `counter` action.
 *
 * Extracted into a pure, framework-free function for the same reason as
 * `lib/smart-matching-ai-response.ts` - testable under plain `node --test`
 * without resolving `next/server`/`@/lib/prisma`.
 *
 * Deliberately preserves the route's existing behavior of letting an AI
 * failure halt the whole request (so the counter-offer is not persisted) -
 * that persistence-ordering question is out of scope for this change; this
 * function only replaces the broken client call, not when its result is
 * allowed to gate a database write.
 */
import type { Bell24hOsAiTextOutcome } from '@/src/lib/bell24h-os/client';

export type NegotiationAiOutcome =
  | { proceed: true; suggestion: string }
  | { proceed: false };

const FALLBACK_SUGGESTION = 'Let me think about this offer and get back to you.';

export function resolveNegotiationAiSuggestion(outcome: Bell24hOsAiTextOutcome): NegotiationAiOutcome {
  if (outcome.status !== 'OK') {
    return { proceed: false };
  }
  return { proceed: true, suggestion: outcome.text || FALLBACK_SUGGESTION };
}
