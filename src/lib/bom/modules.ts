/**
 * Business Operating Memory (BOM) — configurable memory modules.
 * Company DNA graph is a visualization; BusinessLifeEvent is the source of truth.
 */

export interface BomMemoryModule {
  id: string;
  label: string;
  description: string;
  color: string;
  /** Event types that primarily feed this module */
  eventTypes: string[];
  enabled: boolean;
}

export const BOM_MODULES: BomMemoryModule[] = [
  {
    id: 'identity',
    label: 'Identity Memory',
    description: 'GST, Udyam, company registration, locations',
    color: '#6366f1',
    eventTypes: ['company_joined', 'gst_uploaded', 'udyam_verified', 'profile_updated'],
    enabled: true,
  },
  {
    id: 'business',
    label: 'Business Memory',
    description: 'Industry, products, capacity, operations',
    color: '#8b5cf6',
    eventTypes: ['product_added', 'product_updated', 'factory_expansion', 'profile_updated'],
    enabled: true,
  },
  {
    id: 'product',
    label: 'Product Memory',
    description: 'Catalog, SKUs, listings',
    color: '#a855f7',
    eventTypes: ['product_added', 'product_updated', 'product_removed'],
    enabled: true,
  },
  {
    id: 'procurement',
    label: 'Procurement Memory',
    description: 'RFQs, purchases, supplier changes',
    color: '#d946ef',
    eventTypes: ['rfq_created', 'voice_rfq', 'video_rfq', 'quote_received', 'supplier_changed'],
    enabled: true,
  },
  {
    id: 'supplier',
    label: 'Supplier Memory',
    description: 'Supplier relationships and behaviour',
    color: '#ec4899',
    eventTypes: ['supplier_changed', 'quote_received'],
    enabled: true,
  },
  {
    id: 'customer',
    label: 'Customer Memory',
    description: 'Buyers, repeat orders, geography',
    color: '#f43f5e',
    eventTypes: ['new_customer', 'export_started'],
    enabled: true,
  },
  {
    id: 'financial',
    label: 'Financial Memory',
    description: 'Payments, escrow, spend patterns',
    color: '#f97316',
    eventTypes: ['payment_completed', 'escrow_released', 'price_alert'],
    enabled: true,
  },
  {
    id: 'trust',
    label: 'Trust Memory',
    description: 'Verification, disputes, escrow history',
    color: '#22c55e',
    eventTypes: ['gst_uploaded', 'udyam_verified', 'payment_completed'],
    enabled: true,
  },
  {
    id: 'risk',
    label: 'Risk Memory',
    description: 'Dependency, delays, compliance',
    color: '#eab308',
    eventTypes: ['supplier_changed', 'price_alert', 'payment_delayed'],
    enabled: true,
  },
  {
    id: 'market',
    label: 'Market Memory',
    description: 'Category demand, seasonality, prices',
    color: '#06b6d4',
    eventTypes: ['price_alert', 'rfq_created'],
    enabled: true,
  },
  {
    id: 'knowledge',
    label: 'Knowledge Memory',
    description: 'Category specs, alternatives, HSN',
    color: '#3b82f6',
    eventTypes: ['product_added'],
    enabled: true,
  },
  {
    id: 'communication',
    label: 'Communication Memory',
    description: 'Voice, video, WhatsApp, email touchpoints',
    color: '#14b8a6',
    eventTypes: ['voice_rfq', 'video_rfq', 'interaction_logged'],
    enabled: true,
  },
  {
    id: 'decision',
    label: 'Decision Memory',
    description: 'Decisions + outcomes — the business brain',
    color: '#6366f1',
    eventTypes: ['supplier_changed', 'decision_recorded'],
    enabled: true,
  },
  {
    id: 'intent',
    label: 'Intent Memory',
    description: 'WHY behind purchases and changes',
    color: '#64748b',
    eventTypes: ['rfq_created', 'voice_rfq', 'video_rfq', 'supplier_changed'],
    enabled: true,
  },
  {
    id: 'timeline',
    label: 'Timeline Memory',
    description: 'Business life story — all events',
    color: '#475569',
    eventTypes: ['*'],
    enabled: true,
  },
  {
    id: 'opportunity',
    label: 'Opportunity Memory',
    description: 'Cross-sell, export, cost savings',
    color: '#D4AF37',
    eventTypes: ['export_started', 'new_customer'],
    enabled: true,
  },
  {
    id: 'operational',
    label: 'Operational Memory',
    description: 'Capacity, maintenance, lead times',
    color: '#f59e0b',
    eventTypes: ['factory_expansion', 'machine_added'],
    enabled: true,
  },
  {
    id: 'predictive',
    label: 'Predictive Memory',
    description: 'Historical patterns — explainable forecasts from own data',
    color: '#8b5cf6',
    eventTypes: ['rfq_created', 'payment_completed'],
    enabled: true,
  },
  {
    id: 'economic',
    label: 'Economic Memory',
    description: 'Input costs, freight, linked commodities (PVC/oil etc.)',
    color: '#0ea5e9',
    eventTypes: ['price_alert', 'rfq_created', 'payment_completed'],
    enabled: true,
  },
  {
    id: 'location',
    label: 'Location Memory',
    description: 'Office, factory, warehouse, industrial cluster, freight zone, nearby trade',
    color: '#10b981',
    eventTypes: ['location_set', 'company_joined', 'factory_expansion'],
    enabled: true,
  },
];

export function getEnabledModules(): BomMemoryModule[] {
  return BOM_MODULES.filter(m => m.enabled);
}

export function modulesForEventType(eventType: string): BomMemoryModule[] {
  return BOM_MODULES.filter(
    m => m.enabled && (m.eventTypes.includes('*') || m.eventTypes.includes(eventType)),
  );
}
