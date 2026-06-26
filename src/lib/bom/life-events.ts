/**
 * BusinessLifeEvent — universal object at the center of VyaparSethu BOM.
 * Every meaningful action creates one event. Projections read from here.
 */

import { prisma } from '@/lib/prisma';

export const LIFE_EVENT_TYPES = [
  'company_joined',
  'gst_uploaded',
  'udyam_verified',
  'profile_updated',
  'product_added',
  'product_updated',
  'product_removed',
  'rfq_created',
  'voice_rfq',
  'video_rfq',
  'quote_received',
  'quote_accepted',
  'supplier_changed',
  'payment_completed',
  'escrow_released',
  'payment_delayed',
  'price_alert',
  'export_started',
  'new_customer',
  'factory_expansion',
  'machine_added',
  'interaction_logged',
  'decision_recorded',
  'dna_synced',
] as const;

export type LifeEventType = (typeof LIFE_EVENT_TYPES)[number];

export interface RecordLifeEventInput {
  companyId: string;
  eventType: LifeEventType | string;
  actorId?: string;
  category?: string;
  intent?: string;
  decision?: string;
  outcome?: string;
  metadata?: Record<string, unknown>;
  attachments?: Record<string, unknown>;
  confidence?: number;
  source?: string;
}

export interface LifeEventView {
  id: string;
  eventType: string;
  category: string | null;
  intent: string | null;
  decision: string | null;
  outcome: string | null;
  metadata: Record<string, unknown> | null;
  source: string;
  createdAt: string;
}

/** Record a business life event (non-blocking safe). */
export async function recordLifeEvent(input: RecordLifeEventInput): Promise<string | null> {
  try {
    const row = await prisma.businessLifeEvent.create({
      data: {
        companyId: input.companyId,
        eventType: input.eventType,
        actorId: input.actorId ?? input.companyId,
        category: input.category ?? null,
        intent: input.intent ?? null,
        decision: input.decision ?? null,
        outcome: input.outcome ?? null,
        metadata: input.metadata ?? undefined,
        attachments: input.attachments ?? undefined,
        confidence: input.confidence ?? null,
        source: input.source ?? 'system',
      },
    });
    return row.id;
  } catch (err) {
    console.error('[BOM] recordLifeEvent failed:', input.eventType, err instanceof Error ? err.message : err);
    return null;
  }
}

export function recordLifeEventAsync(input: RecordLifeEventInput): void {
  recordLifeEvent(input).catch(() => {});
}

export async function getLifeEvents(companyId: string, limit = 100): Promise<LifeEventView[]> {
  const rows = await prisma.businessLifeEvent.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(r => ({
    id: r.id,
    eventType: r.eventType,
    category: r.category,
    intent: r.intent,
    decision: r.decision,
    outcome: r.outcome,
    metadata: r.metadata as Record<string, unknown> | null,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function countLifeEvents(companyId: string): Promise<number> {
  return prisma.businessLifeEvent.count({ where: { companyId } });
}

const EVENT_LABELS: Record<string, string> = {
  company_joined: 'Joined VyaparSethu',
  gst_uploaded: 'GST uploaded',
  udyam_verified: 'Udyam registered',
  profile_updated: 'Profile updated',
  product_added: 'Product listed',
  product_updated: 'Product updated',
  rfq_created: 'RFQ created',
  voice_rfq: 'Voice RFQ submitted',
  video_rfq: 'Video RFQ submitted',
  quote_received: 'Quote received',
  quote_accepted: 'Quote accepted',
  supplier_changed: 'Supplier changed',
  payment_completed: 'Payment completed',
  escrow_released: 'Escrow released',
  export_started: 'Export started',
  factory_expansion: 'Factory expansion',
  machine_added: 'New machine added',
  decision_recorded: 'Business decision',
  dna_synced: 'Business memory synced',
};

export function lifeEventLabel(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType.replace(/_/g, ' ');
}
