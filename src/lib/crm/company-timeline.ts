/**
 * Per-company CRM timeline — composes events from existing tables (no schema changes).
 */

import { prisma } from '@/lib/prisma';
import { DISCOVERY_EVENT_TYPES } from '@/src/lib/discovery/events';

/** WhatsApp-related InteractionMemory action types (read-only; matches whatsapp/ops). */
export const WA_TIMELINE_ACTION_TYPES = [
  'day1_wa_sent',
  'outreach_sent',
  'follow_up_1_sent',
  'follow_up_2_sent',
  'drip_day3_sent',
  'drip_day7_sent',
  'drip_day14_sent',
  'whatsapp_click',
] as const;

export type TimelineEventType =
  | 'interaction'
  | 'discovery'
  | 'whatsapp'
  | 'rfq'
  | 'quote'
  | 'outreach'
  | 'notification'
  | 'claim_invitation';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  action: string;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  role: string;
  trustScore: number;
  isClaimed: boolean;
  isVerified: boolean;
  claimedAt: string | null;
  importedFrom: string | null;
  createdAt: string;
  gstNumber: string | null;
  stats: {
    rfqs: number;
    quotes: number;
    outreachRecipients: number;
    claimInvitations: number;
    notifications: number;
  };
}

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      email: true,
      location: true,
      role: true,
      trustScore: true,
      isClaimed: true,
      isVerified: true,
      claimedAt: true,
      importedFrom: true,
      createdAt: true,
      gstNumber: true,
      _count: {
        select: {
          rfqs: true,
          quotes: true,
          outreachRecipient: true,
          claimInvitations: true,
          notifications: true,
        },
      },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    company: user.company,
    phone: user.phone,
    email: user.email,
    location: user.location,
    role: user.role,
    trustScore: user.trustScore,
    isClaimed: user.isClaimed,
    isVerified: user.isVerified,
    claimedAt: user.claimedAt?.toISOString() ?? null,
    importedFrom: user.importedFrom,
    createdAt: user.createdAt.toISOString(),
    gstNumber: user.gstNumber,
    stats: {
      rfqs: user._count.rfqs,
      quotes: user._count.quotes,
      outreachRecipients: user._count.outreachRecipient,
      claimInvitations: user._count.claimInvitations,
      notifications: user._count.notifications,
    },
  };
}

export interface RfqActivityItem {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface QuoteActivityItem {
  id: string;
  price: number;
  status: string;
  rfqTitle: string | null;
  createdAt: string;
}

export interface OutreachHistoryItem {
  id: string;
  state: string;
  channel: string;
  campaignName: string | null;
  campaignStatus: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  claimedAt: string | null;
  createdAt: string;
}

export interface WhatsAppHistoryItem {
  id: string;
  actionType: string;
  source: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ClaimStatusSummary {
  isClaimed: boolean;
  claimedAt: string | null;
  latestInvitation: {
    id: string;
    status: string;
    issuedAt: string;
    expiresAt: string;
    consumedAt: string | null;
    campaignName: string | null;
  } | null;
}

export interface CrmJourneyPayload {
  profile: CompanyProfile;
  discoverySource: string | null;
  claimStatus: ClaimStatusSummary;
  rfqActivity: { rfqs: RfqActivityItem[]; quotes: QuoteActivityItem[] };
  outreachHistory: OutreachHistoryItem[];
  whatsappHistory: WhatsAppHistoryItem[];
  timeline: TimelineEvent[];
}

export async function buildCrmJourney(userId: string, limit = 100): Promise<CrmJourneyPayload | null> {
  const profile = await getCompanyProfile(userId);
  if (!profile) return null;

  const [rfqs, quotes, recipients, invitations, interactions, waEvents, discoveryEvents] =
    await Promise.all([
      prisma.rFQ.findMany({
        where: { createdBy: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, title: true, status: true, category: true, createdAt: true },
      }),
      prisma.quote.findMany({
        where: { supplierId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, price: true, status: true, createdAt: true, rfq: { select: { title: true } } },
      }),
      prisma.outreachRecipient.findMany({
        where: { companyId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          state: true,
          channel: true,
          sentAt: true,
          deliveredAt: true,
          claimedAt: true,
          createdAt: true,
          campaign: { select: { id: true, name: true, status: true } },
        },
      }),
      prisma.claimInvitation.findMany({
        where: { companyId: userId },
        orderBy: { issuedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          status: true,
          issuedAt: true,
          expiresAt: true,
          consumedAt: true,
          campaign: { select: { id: true, name: true } },
        },
      }),
      prisma.interactionMemory.findMany({
        where: {
          userId,
          actionType: { notIn: [...WA_TIMELINE_ACTION_TYPES, ...DISCOVERY_EVENT_TYPES] },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, actionType: true, source: true, metadata: true, createdAt: true, rfqId: true },
      }),
      prisma.interactionMemory.findMany({
        where: { userId, actionType: { in: [...WA_TIMELINE_ACTION_TYPES] } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, actionType: true, source: true, metadata: true, createdAt: true },
      }),
      prisma.interactionMemory.findMany({
        where: {
          userId,
          OR: [{ source: 'discovery' }, { actionType: { in: [...DISCOVERY_EVENT_TYPES] } }],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, actionType: true, source: true, metadata: true, createdAt: true },
      }),
    ]);

  const latestInvitation = invitations[0];
  const claimStatus: ClaimStatusSummary = {
    isClaimed: profile.isClaimed,
    claimedAt: profile.claimedAt,
    latestInvitation: latestInvitation
      ? {
          id: latestInvitation.id,
          status: latestInvitation.status,
          issuedAt: latestInvitation.issuedAt.toISOString(),
          expiresAt: latestInvitation.expiresAt.toISOString(),
          consumedAt: latestInvitation.consumedAt?.toISOString() ?? null,
          campaignName: latestInvitation.campaign?.name ?? null,
        }
      : null,
  };

  const rfqActivity = {
    rfqs: rfqs.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    quotes: quotes.map((q) => ({
      id: q.id,
      price: q.price,
      status: q.status,
      rfqTitle: q.rfq?.title ?? null,
      createdAt: q.createdAt.toISOString(),
    })),
  };

  const outreachHistory: OutreachHistoryItem[] = recipients.map((r) => ({
    id: r.id,
    state: r.state,
    channel: r.channel,
    campaignName: r.campaign?.name ?? null,
    campaignStatus: r.campaign?.status ?? null,
    sentAt: r.sentAt?.toISOString() ?? null,
    deliveredAt: r.deliveredAt?.toISOString() ?? null,
    claimedAt: r.claimedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  const whatsappHistory: WhatsAppHistoryItem[] = waEvents.map((e) => ({
    id: e.id,
    actionType: e.actionType,
    source: e.source,
    createdAt: e.createdAt.toISOString(),
    metadata: e.metadata as Record<string, unknown> | undefined,
  }));

  const timeline = buildTimelineEvents({
    interactions,
    discoveryEvents,
    waEvents,
    rfqs,
    quotes,
    recipients,
    notifications: await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, title: true, message: true, type: true, isRead: true, createdAt: true },
    }),
    invitations,
    limit,
  });

  return {
    profile,
    discoverySource: profile.importedFrom,
    claimStatus,
    rfqActivity,
    outreachHistory,
    whatsappHistory,
    timeline,
  };
}

interface TimelineBuildInput {
  interactions: Array<{
    id: string;
    actionType: string;
    source: string | null;
    metadata: unknown;
    createdAt: Date;
    rfqId?: string | null;
  }>;
  discoveryEvents: Array<{
    id: string;
    actionType: string;
    source: string | null;
    metadata: unknown;
    createdAt: Date;
  }>;
  waEvents: Array<{
    id: string;
    actionType: string;
    source: string | null;
    metadata: unknown;
    createdAt: Date;
  }>;
  rfqs: Array<{ id: string; title: string; status: string; category: string; createdAt: Date }>;
  quotes: Array<{
    id: string;
    price: number;
    status: string;
    createdAt: Date;
    rfq: { title: string } | null;
  }>;
  recipients: Array<{
    id: string;
    state: string;
    channel: string;
    sentAt: Date | null;
    deliveredAt: Date | null;
    claimedAt: Date | null;
    createdAt: Date;
    campaign: { id: string; name: string; status: string } | null;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
  }>;
  invitations: Array<{
    id: string;
    status: string;
    issuedAt: Date;
    expiresAt: Date;
    consumedAt: Date | null;
    campaign: { id: string; name: string } | null;
  }>;
  limit: number;
}

function buildTimelineEvents(input: TimelineBuildInput): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const { interactions, discoveryEvents, waEvents, rfqs, quotes, recipients, notifications, invitations, limit } =
    input;

  for (const i of discoveryEvents) {
    events.push({
      id: `disc-${i.id}`,
      type: 'discovery',
      action: i.actionType,
      title: i.actionType.replace(/_/g, ' '),
      detail: i.source ? `Source: ${i.source}` : undefined,
      metadata: i.metadata as Record<string, unknown> | undefined,
      createdAt: i.createdAt.toISOString(),
    });
  }

  for (const w of waEvents) {
    events.push({
      id: `wa-${w.id}`,
      type: 'whatsapp',
      action: w.actionType,
      title: w.actionType.replace(/_/g, ' '),
      detail: w.source ? `Source: ${w.source}` : 'WhatsApp',
      metadata: w.metadata as Record<string, unknown> | undefined,
      createdAt: w.createdAt.toISOString(),
    });
  }

  for (const i of interactions) {
    events.push({
      id: `im-${i.id}`,
      type: 'interaction',
      action: i.actionType,
      title: i.actionType.replace(/_/g, ' '),
      detail: i.source ? `Source: ${i.source}` : undefined,
      metadata: { rfqId: i.rfqId, ...(i.metadata as Record<string, unknown> | null) },
      createdAt: i.createdAt.toISOString(),
    });
  }

  for (const r of rfqs) {
    events.push({
      id: `rfq-${r.id}`,
      type: 'rfq',
      action: 'requirement_posted',
      title: r.title,
      detail: `${r.category} · ${r.status}`,
      metadata: { rfqId: r.id, status: r.status },
      createdAt: r.createdAt.toISOString(),
    });
  }

  for (const q of quotes) {
    events.push({
      id: `quote-${q.id}`,
      type: 'quote',
      action: 'quote_submitted',
      title: q.rfq?.title ? `Quote on: ${q.rfq.title}` : 'Quote submitted',
      detail: `₹${q.price.toLocaleString('en-IN')} · ${q.status}`,
      metadata: { quoteId: q.id, status: q.status },
      createdAt: q.createdAt.toISOString(),
    });
  }

  for (const r of recipients) {
    events.push({
      id: `outreach-${r.id}`,
      type: 'outreach',
      action: `outreach_${r.state.toLowerCase()}`,
      title: r.campaign?.name ?? 'Outreach campaign',
      detail: `${r.channel} · ${r.state}`,
      metadata: {
        campaignId: r.campaign?.id,
        campaignStatus: r.campaign?.status,
        sentAt: r.sentAt?.toISOString(),
        claimedAt: r.claimedAt?.toISOString(),
      },
      createdAt: (r.sentAt ?? r.createdAt).toISOString(),
    });
  }

  for (const n of notifications) {
    events.push({
      id: `notif-${n.id}`,
      type: 'notification',
      action: 'notification',
      title: n.title,
      detail: n.message.slice(0, 120),
      metadata: { type: n.type, isRead: n.isRead },
      createdAt: n.createdAt.toISOString(),
    });
  }

  for (const inv of invitations) {
    events.push({
      id: `invite-${inv.id}`,
      type: 'claim_invitation',
      action: `invitation_${inv.status.toLowerCase()}`,
      title: inv.campaign?.name ?? 'Claim invitation',
      detail: `Status: ${inv.status}`,
      metadata: {
        campaignId: inv.campaign?.id,
        expiresAt: inv.expiresAt.toISOString(),
        consumedAt: inv.consumedAt?.toISOString(),
      },
      createdAt: inv.issuedAt.toISOString(),
    });
  }

  events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return events.slice(0, limit);
}

/** @deprecated Use buildCrmJourney — kept for GET /api/admin/crm?userId= compat */
export async function buildCompanyTimeline(
  userId: string,
  limit = 100,
): Promise<TimelineEvent[]> {
  const journey = await buildCrmJourney(userId, limit);
  return journey?.timeline ?? [];
}
