/**
 * Business Pulse — location-aware activity feed driven by BusinessLifeEvents.
 *
 * NOT SEO. NOT the marketplace. This is location intelligence: every
 * industrial cluster gets its own living economic pulse, derived entirely
 * from the BOM event stream (no new tables).
 *
 * Output is plain serialisable JSON so the same engine powers:
 *   - /location/[area] SEO pages (server component)
 *   - /api/location/pulse (mobile app + homepage "Near You")
 *   - Morning Brief "Around your area" section
 */

import { prisma } from '@/lib/prisma';
import { getArea, type IndustrialArea } from './location';
import { lifeEventLabel } from './life-events';

export interface PulseSummary {
  newCompanies: number;
  newProducts: number;
  newRfqs: number;
  quotes: number;
  dealsClosed: number;
  payments: number;
  exporters: number;
  factoryExpansions: number;
  verifications: number;
  machinesAdded: number;
  priceAlerts: number;
  newCustomers: number;
  decisionsRecorded: number;
  totalEvents: number;
}

export interface PulseFeedItem {
  id: string;
  eventType: string;
  label: string;
  category: string | null;
  /** Human emoji hint for the UI */
  icon: string;
  createdAt: string;
}

export interface AreaPulse {
  area: IndustrialArea | null;
  windowDays: number;
  hasActivity: boolean;
  summary: PulseSummary;
  feed: PulseFeedItem[];
  /** Non-zero trending categories from recent RFQ events */
  trendingCategories: string[];
  updatedAt: string;
}

const EVENT_ICON: Record<string, string> = {
  company_joined: '🟢',
  gst_uploaded: '🧾',
  udyam_verified: '🏅',
  product_added: '📦',
  product_updated: '📦',
  rfq_created: '📋',
  voice_rfq: '🎙️',
  video_rfq: '🎥',
  quote_received: '💬',
  quote_accepted: '🤝',
  payment_completed: '💳',
  escrow_released: '🔓',
  export_started: '🚢',
  factory_expansion: '🏭',
  machine_added: '⚙️',
  new_customer: '👤',
  decision_recorded: '🧠',
  location_set: '📍',
  price_alert: '📈',
  profile_updated: '📝',
};

const RFQ_TYPES = ['rfq_created', 'voice_rfq', 'video_rfq'];

/** Resolve company ids that belong to an industrial area (no schema change). */
async function companyIdsInArea(area: IndustrialArea): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { location: { contains: area.name, mode: 'insensitive' } },
        { location: { contains: area.fullName, mode: 'insensitive' } },
        { location: { contains: area.key, mode: 'insensitive' } },
      ],
    },
    select: { id: true },
    take: 5000,
  });
  return users.map((u) => u.id);
}

export async function getAreaPulse(areaKey: string, windowDays = 7): Promise<AreaPulse> {
  const area = getArea(areaKey);
  const now = new Date();
  const empty: AreaPulse = {
    area,
    windowDays,
    hasActivity: false,
    summary: {
      newCompanies: 0,
      newProducts: 0,
      newRfqs: 0,
      quotes: 0,
      dealsClosed: 0,
      payments: 0,
      exporters: 0,
      factoryExpansions: 0,
      verifications: 0,
      machinesAdded: 0,
      priceAlerts: 0,
      newCustomers: 0,
      decisionsRecorded: 0,
      totalEvents: 0,
    },
    feed: [],
    trendingCategories: [],
    updatedAt: now.toISOString(),
  };

  if (!area) return empty;

  try {
    const ids = await companyIdsInArea(area);
    if (ids.length === 0) return empty;

    const since = new Date(now.getTime() - windowDays * 86400000);
    const events = await prisma.businessLifeEvent.findMany({
      where: { companyId: { in: ids }, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { id: true, eventType: true, category: true, createdAt: true },
    });

    const summary: PulseSummary = {
      newCompanies: events.filter((e) => e.eventType === 'company_joined').length,
      newProducts: events.filter((e) => e.eventType === 'product_added').length,
      newRfqs: events.filter((e) => RFQ_TYPES.includes(e.eventType)).length,
      quotes: events.filter((e) => e.eventType === 'quote_received').length,
      dealsClosed: events.filter((e) => e.eventType === 'quote_accepted').length,
      payments: events.filter((e) => e.eventType === 'payment_completed').length,
      exporters: events.filter((e) => e.eventType === 'export_started').length,
      factoryExpansions: events.filter((e) => e.eventType === 'factory_expansion').length,
      verifications: events.filter((e) => ['gst_uploaded', 'udyam_verified'].includes(e.eventType)).length,
      machinesAdded: events.filter((e) => e.eventType === 'machine_added').length,
      priceAlerts: events.filter((e) => e.eventType === 'price_alert').length,
      newCustomers: events.filter((e) => e.eventType === 'new_customer').length,
      decisionsRecorded: events.filter((e) => e.eventType === 'decision_recorded').length,
      totalEvents: events.length,
    };

    const catCounts = new Map<string, number>();
    for (const e of events) {
      if (e.category && RFQ_TYPES.includes(e.eventType)) {
        catCounts.set(e.category, (catCounts.get(e.category) ?? 0) + 1);
      }
    }
    const trendingCategories = Array.from(catCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c]) => c);

    const feed: PulseFeedItem[] = events.slice(0, 40).map((e) => ({
      id: e.id,
      eventType: e.eventType,
      label: lifeEventLabel(e.eventType),
      category: e.category,
      icon: EVENT_ICON[e.eventType] ?? '•',
      createdAt: e.createdAt.toISOString(),
    }));

    return {
      area,
      windowDays,
      hasActivity: summary.totalEvents > 0,
      summary,
      feed,
      trendingCategories,
      updatedAt: now.toISOString(),
    };
  } catch (err) {
    console.error('[BusinessPulse] getAreaPulse failed:', err instanceof Error ? err.message : err);
    return empty;
  }
}

/** Cluster pulse — resolves industrial cluster slug → area key when linked. */
export async function getClusterPulse(clusterSlug: string, windowDays = 7): Promise<AreaPulse> {
  const { getClusterRecord, resolveClusterPulseKey } = await import('@/src/data/industrial-clusters');
  const cluster = getClusterRecord(clusterSlug);
  const areaKey = resolveClusterPulseKey(clusterSlug);
  if (areaKey) {
    const pulse = await getAreaPulse(areaKey, windowDays);
    return {
      ...pulse,
      area: pulse.area
        ? { ...pulse.area, name: cluster?.name ?? pulse.area.name, fullName: cluster?.fullName ?? pulse.area.fullName }
        : null,
    };
  }
  return {
    area: cluster
      ? {
          key: clusterSlug,
          name: cluster.name,
          fullName: cluster.fullName,
          state: cluster.state ?? '',
          description: cluster.description,
          clusterNote: cluster.clusterNote,
          categories: cluster.categories,
          lat: cluster.lat ?? null,
          lng: cluster.lng ?? null,
        }
      : null,
    windowDays,
    hasActivity: false,
    summary: {
      newCompanies: 0,
      newProducts: 0,
      newRfqs: 0,
      quotes: 0,
      dealsClosed: 0,
      payments: 0,
      exporters: 0,
      factoryExpansions: 0,
      verifications: 0,
      machinesAdded: 0,
      priceAlerts: 0,
      newCustomers: 0,
      decisionsRecorded: 0,
      totalEvents: 0,
    },
    feed: [],
    trendingCategories: [],
    updatedAt: new Date().toISOString(),
  };
}
