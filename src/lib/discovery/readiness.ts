/**
 * Discovery Engine readiness board — static classification from architecture audit.
 */

import type { ReadinessItem } from './types';

export const DISCOVERY_READINESS_BOARD: ReadinessItem[] = [
  {
    id: 'search',
    label: 'Search',
    status: 'PARTIAL',
    note: 'ScrapeGraph + Google search wired; no federated search API or OS job queue yet.',
  },
  {
    id: 'ingestion',
    label: 'Ingestion',
    status: 'PARTIAL',
    note: 'import-suppliers shape standardized; discovery pipeline creates unclaimed Users.',
  },
  {
    id: 'enrichment',
    label: 'Enrichment',
    status: 'PARTIAL',
    note: 'Metadata stored in preferences.discovery Json; no automated GST/website enrichment API.',
  },
  {
    id: 'trust',
    label: 'Trust Score',
    status: 'PARTIAL',
    note: 'User.trustScore + event bumps; daily formula cron not implemented.',
  },
  {
    id: 'invitation',
    label: 'Invitation Engine',
    status: 'PARTIAL',
    note: 'H6-13 campaigns + claim flow exist; production template env must be configured.',
  },
  {
    id: 'crm',
    label: 'CRM Journey',
    status: 'PARTIAL',
    note: 'InteractionMemory events + CRM user data; per-company timeline API pending.',
  },
  {
    id: 'rfq',
    label: 'RFQ Matching',
    status: 'PARTIAL',
    note: 'orchestration.ts production-ready; voice/video paths use parallel Agent Zero.',
  },
];

export function discoveryReadinessScore(): { score: number; ready: number; partial: number; missing: number } {
  const ready = DISCOVERY_READINESS_BOARD.filter((i) => i.status === 'READY').length;
  const partial = DISCOVERY_READINESS_BOARD.filter((i) => i.status === 'PARTIAL').length;
  const missing = DISCOVERY_READINESS_BOARD.filter((i) => i.status === 'MISSING').length;
  const total = DISCOVERY_READINESS_BOARD.length;
  const score = Math.round(((ready + partial * 0.5) / total) * 100);
  return { score, ready, partial, missing };
}
