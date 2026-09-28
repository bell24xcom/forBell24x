/**
 * Supplier onboarding pipeline — pure rules (MA-01, Phase 2/3/5).
 *
 * The nine stages are DERIVED from facts that already exist (SUPPLIER_ONBOARDING_PIPELINE.md §2/§3); there is no
 * stored status column, so nothing can drift from the source tables. This file is deliberately free of imports
 * (no prisma, no `@/`) so it can be unit-tested with `node --test` against fixtures; the database reader lives in
 * `pipeline.ts`.
 *
 * Honesty rules baked in:
 *   - a stage with no measurable source says so (`measurable: false`) instead of reporting 0;
 *   - "invited" from the legacy path means "an admin ran the send" (no delivery data) and is labelled as such;
 *   - seed accounts are excluded by default and the exclusion is reported, never silent;
 *   - a claimed account with no `claimedAt` is counted as a data-quality problem, not hidden.
 */

export const PIPELINE_STAGES = [
  'DISCOVERED',
  'QUALIFIED',
  'DEDUPLICATED',
  'INVITATION_READY',
  'INVITED',
  'OPENED',
  'CLAIMED',
  'PROFILE_COMPLETED',
  'RFQ_ELIGIBLE',
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const SEED_IMPORTED_FROM = 'admin_seed';
/** The matcher (lib/orchestration.ts findMatchedSuppliers) only ever reads this many of the newest suppliers. */
export const MATCHER_WINDOW = 200;
/** Legacy launch-metrics treats a supplier as outreach-ready only while outreach_count is below this. */
export const LEGACY_CADENCE_LIMIT = 3;

type DateLike = Date | string | null | undefined;

export interface PipelineSupplierRow {
  id: string;
  isActive: boolean;
  company: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  importedFrom: string | null;
  gstNumber: string | null;
  preferences: unknown;
  isClaimed: boolean;
  claimedAt: DateLike;
  claimSentAt: DateLike;
  outreachCount: number;
  createdAt: DateLike;
}

export interface PipelineFacts {
  /** Suppliers on the suppression list by company id. */
  suppressedIds: Set<string>;
  /** Suppression entries by destination; matched on the last 10 digits of the phone. */
  suppressedPhones: Set<string>;
  /** Campaign-path recipients in SENT, DELIVERED or CLAIMED. */
  campaignSentIds: Set<string>;
  /** Signed invitation viewed, or a `claim_link_opened` event. */
  openedIds: Set<string>;
  /** Suppliers with at least one quote. */
  quotedIds: Set<string>;
}

export interface PipelineOptions {
  includeSeed?: boolean;
  matcherWindow?: number;
}

// ---------------------------------------------------------------------------------------------------------------
// field rules (each mirrors the SQL that produced the baselines in SUPPLIER_CONVERSION_DASHBOARD.md)
// ---------------------------------------------------------------------------------------------------------------

/** Last 10 digits of the phone, or '' when there are fewer than 10 digits. */
export function phone10(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : '';
}

/** Valid Indian mobile: the last 10 digits start with 6-9. */
export function isValidIndianMobile(raw: string | null | undefined): boolean {
  return /^[6-9][0-9]{9}$/.test(phone10(raw));
}

/** A usable email: not a placeholder and shaped like an address. */
export function isUsableEmail(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const e = raw.trim();
  return e !== '' && !/placeholder/i.test(e) && /.+@.+\..+/.test(e);
}

export function categoriesOf(prefs: unknown): string[] {
  if (!prefs || typeof prefs !== 'object') return [];
  const c = (prefs as { categories?: unknown }).categories;
  return Array.isArray(c) ? c.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim()) : [];
}

export function isProfileCompleted(prefs: unknown): boolean {
  return !!prefs && typeof prefs === 'object' && (prefs as { onboardingComplete?: unknown }).onboardingComplete === true;
}

const COMPANY_NOISE = new Set(['pvt', 'private', 'ltd', 'limited', 'llp', 'inc', 'co', 'company', 'and']);

/** Normalised company name for duplicate detection; null when nothing meaningful remains. */
export function normalizeCompany(raw: string | null | undefined): string | null {
  const tokens = (raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\uffff\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !COMPANY_NOISE.has(t));
  const s = tokens.join(' ');
  return s.length >= 3 ? s : null;
}

export function sourceLabel(importedFrom: string | null | undefined): string {
  if (!importedFrom) return '(none: self-registered / early)';
  if (importedFrom.startsWith('discovery:')) return importedFrom.split(':')[1] || 'discovery';
  return importedFrom;
}

const ms = (d: DateLike): number => {
  if (!d) return 0;
  const t = d instanceof Date ? d.getTime() : Date.parse(d);
  return Number.isNaN(t) ? 0 : t;
};

// ---------------------------------------------------------------------------------------------------------------
// duplicate groups (normalised company, phone last-10, email, GST — union of any shared key)
// ---------------------------------------------------------------------------------------------------------------

export function duplicateKeys(s: PipelineSupplierRow): string[] {
  const keys: string[] = [];
  const p = phone10(s.phone);
  if (p) keys.push(`p:${p}`);
  if (s.email && isUsableEmail(s.email)) keys.push(`e:${s.email.trim().toLowerCase()}`);
  const g = (s.gstNumber ?? '').trim().toUpperCase();
  if (g.length >= 10) keys.push(`g:${g}`);
  const c = normalizeCompany(s.company ?? s.name);
  if (c) keys.push(`c:${c}`);
  return keys;
}

/**
 * Groups suppliers that share ANY key. Returns id -> group id, plus the canonical member of each group.
 * Canonical = claimed first, then reachable by mobile, then oldest, then lowest id (deterministic).
 */
export function groupDuplicates(rows: PipelineSupplierRow[]): { groupOf: Map<string, string>; canonical: Set<string>; groups: string[][] } {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    let c = x;
    while (parent.get(c) !== r) {
      const n = parent.get(c)!;
      parent.set(c, r);
      c = n;
    }
    return r;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
  };
  for (const r of rows) parent.set(r.id, r.id);
  const byKey = new Map<string, string>();
  for (const r of rows) {
    for (const k of duplicateKeys(r)) {
      const seen = byKey.get(k);
      if (seen) union(seen, r.id);
      else byKey.set(k, r.id);
    }
  }
  const members = new Map<string, PipelineSupplierRow[]>();
  for (const r of rows) {
    const root = find(r.id);
    (members.get(root) ?? members.set(root, []).get(root)!).push(r);
  }
  const groupOf = new Map<string, string>();
  const canonical = new Set<string>();
  const groups: string[][] = [];
  members.forEach((list, root) => {
    const best = list.slice().sort(
      (a, b) =>
        Number(b.isClaimed) - Number(a.isClaimed) ||
        Number(isValidIndianMobile(b.phone)) - Number(isValidIndianMobile(a.phone)) ||
        ms(a.createdAt) - ms(b.createdAt) ||
        (a.id < b.id ? -1 : 1),
    )[0];
    canonical.add(best.id);
    list.forEach((m) => groupOf.set(m.id, root));
    if (list.length > 1) groups.push(list.map((m) => m.id));
  });
  return { groupOf, canonical, groups };
}

// ---------------------------------------------------------------------------------------------------------------
// per-supplier stage flags
// ---------------------------------------------------------------------------------------------------------------

export interface SupplierFlags {
  DISCOVERED: boolean;
  QUALIFIED: boolean;
  DEDUPLICATED: boolean;
  INVITATION_READY: boolean;
  INVITED: boolean;
  OPENED: boolean;
  CLAIMED: boolean;
  PROFILE_COMPLETED: boolean;
  RFQ_ELIGIBLE: boolean;
  /** Extra facts used by the tables and data-quality panel. */
  legacyInvitedOnly: boolean;
  validMobile: boolean;
  reachable: boolean;
  categories: string[];
  claimedAfterInvite: boolean;
  duplicateOfOther: boolean;
  claimedWithoutClaimedAt: boolean;
  cadenceExhausted: boolean;
  quoted: boolean;
}

export interface EvaluatedSupplier {
  row: PipelineSupplierRow;
  flags: SupplierFlags;
}

/**
 * Evaluates every supplier. `all` must be EVERY role=SUPPLIER row (the matcher window and the duplicate groups are
 * computed over the whole population); exclusion of seed accounts is applied afterwards, in `computePipeline`.
 */
export function evaluateSuppliers(all: PipelineSupplierRow[], facts: PipelineFacts, opts: PipelineOptions = {}): EvaluatedSupplier[] {
  const window = opts.matcherWindow ?? MATCHER_WINDOW;
  const { canonical, groupOf } = groupDuplicates(all);
  const groupSize = new Map<string, number>();
  groupOf.forEach((g) => groupSize.set(g, (groupSize.get(g) ?? 0) + 1));

  const inWindow = new Set(
    all
      .filter((s) => s.isActive)
      .sort((a, b) => ms(b.createdAt) - ms(a.createdAt) || (a.id < b.id ? 1 : -1))
      .slice(0, window)
      .map((s) => s.id),
  );

  return all.map((s) => {
    const cats = categoriesOf(s.preferences);
    const validMobile = isValidIndianMobile(s.phone);
    const reachable = validMobile || isUsableEmail(s.email);
    const named = (s.company ?? s.name ?? '').trim() !== '';
    const qualified = s.isActive && named && cats.length > 0 && reachable;
    const dedup = qualified && canonical.has(s.id);
    const suppressed = facts.suppressedIds.has(s.id) || (phone10(s.phone) !== '' && facts.suppressedPhones.has(phone10(s.phone)));
    const ready = dedup && !s.isClaimed && validMobile && !suppressed;
    const viaCampaign = facts.campaignSentIds.has(s.id);
    const invited = !!s.claimSentAt || viaCampaign;
    const claimed = !!s.isClaimed;
    const claimedAtMs = ms(s.claimedAt);
    const sentAtMs = ms(s.claimSentAt);
    return {
      row: s,
      flags: {
        DISCOVERED: true,
        QUALIFIED: qualified,
        DEDUPLICATED: dedup,
        INVITATION_READY: ready,
        INVITED: invited,
        OPENED: facts.openedIds.has(s.id),
        CLAIMED: claimed,
        PROFILE_COMPLETED: isProfileCompleted(s.preferences),
        // The matcher's gates (SUPPLIER_CONVERSION_DASHBOARD.md §1): active, a channel, a category, inside the window.
        RFQ_ELIGIBLE: s.isActive && reachable && cats.length > 0 && inWindow.has(s.id),
        legacyInvitedOnly: !!s.claimSentAt && !viaCampaign,
        validMobile,
        reachable,
        categories: cats,
        claimedAfterInvite: claimed && !!s.claimSentAt && (claimedAtMs ? claimedAtMs >= sentAtMs : true),
        duplicateOfOther: !canonical.has(s.id) && (groupSize.get(groupOf.get(s.id)!) ?? 1) > 1,
        claimedWithoutClaimedAt: claimed && !s.claimedAt,
        cadenceExhausted: !claimed && s.outreachCount >= LEGACY_CADENCE_LIMIT,
        quoted: facts.quotedIds.has(s.id),
      },
    };
  });
}

// ---------------------------------------------------------------------------------------------------------------
// aggregate result
// ---------------------------------------------------------------------------------------------------------------

export interface StageCount {
  stage: PipelineStage;
  count: number;
  /** False when the data needed to count this stage does not exist yet (shown as "not measurable", never as 0). */
  measurable: boolean;
  note?: string;
}

export interface FunnelStep extends StageCount {
  /** count / previous stage count, or null when the previous stage is 0 or this stage is not measurable. */
  stepRate: number | null;
}

export interface CohortRow {
  key: string;
  suppliers: number;
  qualified: number;
  invitationReady: number;
  invited: number;
  opened: number;
  claimed: number;
  profileCompleted: number;
  rfqEligible: number;
}

export interface PilotCoverageRow {
  category: string;
  invitationReady: number;
  fresh: number;
  target: number;
  gap: number;
  status: 'ok' | 'warn' | 'bad';
  /** Why the count may differ from another definition (shown next to the row). */
  note?: string;
  /** Invitation-ready suppliers in a BROADER set of categories, when the exact category cannot be matched. */
  broaderReady?: number;
}

export interface PipelineResult {
  generatedAt: string;
  includeSeed: boolean;
  scope: { supplierAccounts: number; excludedSeed: number; considered: number };
  stages: StageCount[];
  funnel: FunnelStep[];
  bySource: CohortRow[];
  byCategory: CohortRow[];
  pilotCoverage: PilotCoverageRow[];
  claimedAfterInvite: number;
  /** Accounts that are BOTH claimed and profile-completed (the two flags are independent in the data). */
  claimedAndCompleted: number;
  dataQuality: {
    claimedWithoutClaimedAt: number;
    duplicateGroups: number;
    duplicateExtraRecords: number;
    noUsableContact: number;
    legacyInvitedUnverified: number;
    cadenceExhausted: number;
  };
  banners: string[];
}

/** The eight VyaparSethu pilot categories (CATEGORY_ACQUISITION_PLAN.md) and the interim keyword each is matched by. */
export const PILOT_CATEGORIES: { category: string; keywords: string[]; broadKeywords?: string[]; note?: string }[] = [
  { category: 'TEXTILES', keywords: ['textile'] },
  { category: 'UPHOLSTERY FABRICS', keywords: ['upholster'] },
  { category: 'CURTAIN FABRICS', keywords: ['curtain'] },
  { category: 'MACHINERY', keywords: ['machinery'] },
  { category: 'PACKAGING', keywords: ['packag'] },
  { category: 'IRON ORE', keywords: ['iron ore'] },
  { category: 'COPPER', keywords: ['copper'] },
  {
    category: 'STEEL BARS',
    keywords: ['steel bar', 'tmt', 'rebar'],
    // No bar-specific category exists in the data (values are slugs such as 'iron-steel' and 'Steel & Metals'). The narrow
    // match therefore finds none; the broader steel figure is shown next to it instead of being passed off as bars.
    // CATEGORY_ACQUISITION_PLAN.md used a "strict steel-bar group" (15 ready of 17) that cannot be reproduced from
    // category strings alone.
    broadKeywords: ['steel'],
    note: 'Bar-specific categories do not exist in the data, so the count is 0 by exact match; see the broader steel figure.',
  },
];
export const PILOT_TARGET_PER_CATEGORY = 50;

const emptyCohort = (key: string): CohortRow => ({ key, suppliers: 0, qualified: 0, invitationReady: 0, invited: 0, opened: 0, claimed: 0, profileCompleted: 0, rfqEligible: 0 });

function addToCohort(c: CohortRow, f: SupplierFlags) {
  c.suppliers++;
  if (f.QUALIFIED) c.qualified++;
  if (f.INVITATION_READY) c.invitationReady++;
  if (f.INVITED) c.invited++;
  if (f.OPENED) c.opened++;
  if (f.CLAIMED) c.claimed++;
  if (f.PROFILE_COMPLETED) c.profileCompleted++;
  if (f.RFQ_ELIGIBLE) c.rfqEligible++;
}

export function pilotStatus(ready: number, target = PILOT_TARGET_PER_CATEGORY): 'ok' | 'warn' | 'bad' {
  if (ready >= target) return 'ok';
  return ready >= target / 2 ? 'warn' : 'bad'; // red below 50% of target (MARKETPLACE_ACTIVATION_DASHBOARD.md §1)
}

export function computePipeline(all: PipelineSupplierRow[], facts: PipelineFacts, opts: PipelineOptions = {}, now: Date = new Date()): PipelineResult {
  const includeSeed = !!opts.includeSeed;
  const evaluated = evaluateSuppliers(all, facts, opts);
  const considered = evaluated.filter((e) => includeSeed || e.row.importedFrom !== SEED_IMPORTED_FROM);
  const excludedSeed = evaluated.length - considered.length;

  const count = (k: PipelineStage) => considered.filter((e) => e.flags[k]).length;
  const openedTrackable = facts.campaignSentIds.size > 0 || facts.openedIds.size > 0;
  const claimedNoDate = considered.filter((e) => e.flags.claimedWithoutClaimedAt).length;
  const legacyOnly = considered.filter((e) => e.flags.legacyInvitedOnly).length;

  const stages: StageCount[] = PIPELINE_STAGES.map((stage) => {
    const base: StageCount = { stage, count: count(stage), measurable: true };
    if (stage === 'OPENED' && !openedTrackable) {
      return { ...base, count: 0, measurable: false, note: 'Not measurable: the campaign path has sent nothing and legacy links record no opens.' };
    }
    if (stage === 'INVITED' && legacyOnly > 0) base.note = `${legacyOnly} of these are legacy sends recorded before the send (no delivery data): "sent (unverified)".`;
    if (stage === 'CLAIMED' && claimedNoDate > 0) base.note = `${claimedNoDate} claimed account(s) have no claimed_at, so claim timing cannot be computed.`;
    if (stage === 'RFQ_ELIGIBLE') base.note = `Same gates as the matcher, which reads only the ${opts.matcherWindow ?? MATCHER_WINDOW} newest active suppliers.`;
    return base;
  });

  const funnel: FunnelStep[] = stages.map((s, i) => ({
    ...s,
    stepRate: !s.measurable || i === 0 || stages[i - 1].count === 0 || !stages[i - 1].measurable ? null : Math.round((s.count / stages[i - 1].count) * 1000) / 10,
  }));

  const group = (keyOf: (e: EvaluatedSupplier) => string[]): CohortRow[] => {
    const m = new Map<string, CohortRow>();
    for (const e of considered) {
      for (const k of keyOf(e)) addToCohort(m.get(k) ?? m.set(k, emptyCohort(k)).get(k)!, e.flags);
    }
    return Array.from(m.values()).sort((a, b) => b.suppliers - a.suppliers || (a.key < b.key ? -1 : 1));
  };

  const pilotCoverage: PilotCoverageRow[] = PILOT_CATEGORIES.map((p) => {
    const inCat = considered.filter((e) => e.flags.categories.some((c) => p.keywords.some((k) => c.toLowerCase().includes(k))));
    const ready = inCat.filter((e) => e.flags.INVITATION_READY);
    const broaderReady = p.broadKeywords
      ? considered.filter((e) => e.flags.INVITATION_READY && e.flags.categories.some((c) => p.broadKeywords!.some((k) => c.toLowerCase().includes(k)))).length
      : undefined;
    const fresh = ready.filter((e) => !e.row.claimSentAt && !facts.campaignSentIds.has(e.row.id) && e.row.outreachCount === 0).length;
    return { category: p.category, invitationReady: ready.length, fresh, target: PILOT_TARGET_PER_CATEGORY, gap: Math.max(0, PILOT_TARGET_PER_CATEGORY - ready.length), status: pilotStatus(ready.length), ...(p.note ? { note: p.note } : {}), ...(broaderReady !== undefined ? { broaderReady } : {}) };
  });

  const dupGroups = groupDuplicates(considered.map((e) => e.row)).groups;
  const noContact = considered.filter((e) => !e.flags.reachable).length;
  const cadence = considered.filter((e) => e.flags.cadenceExhausted).length;

  const banners: string[] = [];
  if (!includeSeed) banners.push(`Seed accounts excluded (${excludedSeed}). Admin accounts are never suppliers here.`);
  if (legacyOnly > 0) banners.push('Legacy sends are unverified: the timestamp is written before the send and no delivery status exists.');
  if (claimedNoDate > 0) banners.push(`${claimedNoDate} claimed account(s) have no claimed_at.`);
  if (!openedTrackable) banners.push('Opens are not measurable yet: use signed invitations (claim_invitations.viewed_at).');
  if (cadence > 0) banners.push(`${cadence} unclaimed supplier(s) have already had ${LEGACY_CADENCE_LIMIT}+ sends; another is a fourth touch and needs a deliberate decision.`);

  return {
    generatedAt: now.toISOString(),
    includeSeed,
    scope: { supplierAccounts: evaluated.length, excludedSeed, considered: considered.length },
    stages,
    funnel,
    bySource: group((e) => [sourceLabel(e.row.importedFrom)]),
    byCategory: group((e) => (e.flags.categories.length ? Array.from(new Set(e.flags.categories.map((c) => c.toLowerCase()))) : ['(no category)'])),
    pilotCoverage,
    claimedAfterInvite: considered.filter((e) => e.flags.claimedAfterInvite).length,
    claimedAndCompleted: considered.filter((e) => e.flags.CLAIMED && e.flags.PROFILE_COMPLETED).length,
    dataQuality: {
      claimedWithoutClaimedAt: claimedNoDate,
      duplicateGroups: dupGroups.length,
      duplicateExtraRecords: dupGroups.reduce((n, g) => n + g.length - 1, 0),
      noUsableContact: noContact,
      legacyInvitedUnverified: legacyOnly,
      cadenceExhausted: cadence,
    },
    banners,
  };
}

// ---------------------------------------------------------------------------------------------------------------
// activation KPIs, supplier health, RFQ readiness, outreach performance, alerts (Phase 5)
// ---------------------------------------------------------------------------------------------------------------

export interface RfqFacts {
  rfqTotal: number;
  rfqByStatus: Record<string, number>;
  /** Quotes created by considered supplier accounts. */
  quotesBySuppliers: number;
  quotesTotal: number;
  /** Distinct considered suppliers with at least one quote. */
  rfqParticipants: number;
  /** Notifications of type QUOTE_RECEIVED. */
  buyerQuoteAlerts: number;
  dealsTotal: number;
  /** Campaign-path outcomes. */
  campaign: { sent: number; delivered: number; failed: number; last50Sent: number; last50Failed: number };
}

export type KpiStatus = 'info' | 'ok' | 'warn' | 'bad' | 'not_measurable';
export interface Kpi {
  key: string;
  label: string;
  value: number | string | null;
  status: KpiStatus;
  note?: string;
}

export interface Alert {
  key: 'delivery_problem' | 'zero_conversion' | 'data_integrity' | 'cadence' | 'buyer_alerts_missing';
  severity: 'warn' | 'bad';
  message: string;
}

export interface ActivationResult {
  kpis: Kpi[];
  supplierHealth: Kpi[];
  rfqReadiness: Kpi[];
  outreach: Kpi[];
  alerts: Alert[];
  rfqLifecycle: { rfqTotal: number; byStatus: Record<string, number>; quotes: number; buyerAlerts: number; deals: number };
  notes: string[];
}

const pct = (n: number, d: number): number | null => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);

/** Thresholds are PROPOSALS (the founder has not set targets); they only drive alerts, never a "healthy" claim. */
export const ALERT_THRESHOLDS = { deliveryFailedShare: 0.1, zeroConversionMinInvites: 100 };

export function evaluateAlerts(p: PipelineResult, f: RfqFacts): Alert[] {
  const alerts: Alert[] = [];
  const stage = (s: PipelineStage) => p.stages.find((x) => x.stage === s)!;
  const last = f.campaign.last50Sent + f.campaign.last50Failed;
  if (last > 0 && f.campaign.last50Failed / last > ALERT_THRESHOLDS.deliveryFailedShare) {
    alerts.push({ key: 'delivery_problem', severity: 'bad', message: `${f.campaign.last50Failed} of the last ${last} campaign sends failed (>${ALERT_THRESHOLDS.deliveryFailedShare * 100}%).` });
  }
  const campaignInvites = f.campaign.sent + f.campaign.delivered;
  const opened = stage('OPENED');
  if (campaignInvites >= ALERT_THRESHOLDS.zeroConversionMinInvites && ((opened.measurable && opened.count === 0) || stage('CLAIMED').count === 0)) {
    alerts.push({ key: 'zero_conversion', severity: 'bad', message: `${campaignInvites} campaign invitations with zero opens or zero claims.` });
  }
  if (p.dataQuality.claimedWithoutClaimedAt > 0) {
    alerts.push({ key: 'data_integrity', severity: 'warn', message: `${p.dataQuality.claimedWithoutClaimedAt} claimed account(s) have no claimed_at.` });
  }
  if (p.dataQuality.cadenceExhausted > 0) {
    alerts.push({ key: 'cadence', severity: 'warn', message: `${p.dataQuality.cadenceExhausted} unclaimed supplier(s) have had ${LEGACY_CADENCE_LIMIT}+ sends; the next would be a fourth touch.` });
  }
  if (f.quotesTotal > 0 && f.buyerQuoteAlerts < f.quotesTotal) {
    alerts.push({ key: 'buyer_alerts_missing', severity: 'warn', message: `Buyers were alerted to ${f.buyerQuoteAlerts} of ${f.quotesTotal} quotes (older quotes predate the notification fix and are not backfilled).` });
  }
  return alerts;
}

export function computeActivation(p: PipelineResult, f: RfqFacts): ActivationResult {
  const st = (s: PipelineStage) => p.stages.find((x) => x.stage === s)!;
  const kpi = (key: string, label: string, value: number | string | null, status: KpiStatus = 'info', note?: string): Kpi => ({ key, label, value, status, note });
  const opened = st('OPENED');
  const invited = st('INVITED');
  const covBad = p.pilotCoverage.filter((c) => c.status === 'bad').length;

  const kpis: Kpi[] = [
    kpi('suppliers', 'Suppliers considered', p.scope.considered, 'info', p.includeSeed ? 'Seed accounts included.' : `${p.scope.excludedSeed} seed accounts excluded.`),
    kpi('invitation_ready', 'Invitation ready', st('INVITATION_READY').count, covBad > 0 ? 'bad' : 'info', `${p.pilotCoverage.reduce((n, c) => n + c.fresh, 0)} fresh (never contacted) across the pilot categories. Target ${PILOT_TARGET_PER_CATEGORY} per category (proposal).`),
    kpi('invited', 'Invited (sent, unverified)', invited.count, 'info', invited.note),
    kpi('opened', 'Opened', opened.measurable ? opened.count : null, opened.measurable ? 'info' : 'not_measurable', opened.note),
    kpi('claimed', 'Claimed', st('CLAIMED').count, 'info', `${p.claimedAfterInvite} claimed after an invitation.`),
    kpi('profile_completed', 'Profile completed', st('PROFILE_COMPLETED').count),
    kpi('rfq_eligible', 'RFQ eligible', st('RFQ_ELIGIBLE').count, 'info', st('RFQ_ELIGIBLE').note),
    kpi('rfq_participants', 'RFQ participants', f.rfqParticipants, 'info', 'Suppliers with at least one quote; not necessarily the same suppliers as the eligible ones.'),
    kpi('quotes', 'Quotes by supplier accounts', f.quotesBySuppliers, 'info', `${f.quotesTotal} in total including staff accounts.`),
  ];

  const total = p.scope.considered;
  const supplierHealth: Kpi[] = [
    kpi('qualified_share', 'Qualified share', pct(st('QUALIFIED').count, total), 'info', `${st('QUALIFIED').count} of ${total}.`),
    kpi('no_contact', 'No usable phone or email', p.dataQuality.noUsableContact, p.dataQuality.noUsableContact > 0 ? 'warn' : 'ok'),
    kpi('duplicates', 'Duplicate groups', p.dataQuality.duplicateGroups, p.dataQuality.duplicateGroups > 0 ? 'warn' : 'ok', `${p.dataQuality.duplicateExtraRecords} extra record(s).`),
    kpi('claimed_no_date', 'Claimed without claimed_at', p.dataQuality.claimedWithoutClaimedAt, p.dataQuality.claimedWithoutClaimedAt > 0 ? 'warn' : 'ok'),
    kpi('completion_of_claimed', 'Completed among claimed', pct(p.claimedAndCompleted, st('CLAIMED').count), 'info', `${p.claimedAndCompleted} account(s) are both claimed and completed; the two are independent in the data.`),
  ];

  const rfqReadiness: Kpi[] = [
    kpi('eligible_share', 'Eligible share of considered', pct(st('RFQ_ELIGIBLE').count, total)),
    kpi('participation', 'Participants ÷ eligible', pct(f.rfqParticipants, st('RFQ_ELIGIBLE').count), 'info', 'Indicative only.'),
    kpi('buyer_alerts', 'Buyer quote alerts vs quotes', `${f.buyerQuoteAlerts} / ${f.quotesTotal}`, f.quotesTotal > 0 && f.buyerQuoteAlerts < f.quotesTotal ? 'warn' : 'info', 'Quotes made before the notification fix are not backfilled.'),
  ];

  const campaignSent = f.campaign.sent + f.campaign.delivered;
  const outreach: Kpi[] = [
    kpi('campaign_sent', 'Campaign-path sends', campaignSent, 'info', campaignSent === 0 ? 'The tracked path has never sent.' : undefined),
    kpi('campaign_failed', 'Campaign-path failures', f.campaign.failed, f.campaign.failed > 0 ? 'warn' : 'info'),
    kpi('legacy_sent', 'Legacy sends (suppliers)', p.dataQuality.legacyInvitedUnverified, 'info', 'Unverified: no delivery data.'),
    kpi('delivery_rate', 'Delivery rate', f.campaign.delivered > 0 || f.campaign.sent > 0 ? pct(f.campaign.delivered, campaignSent) : null, campaignSent > 0 ? 'info' : 'not_measurable', 'Provider delivery receipts only; legacy sends have none.'),
    kpi('open_rate', 'Open rate', opened.measurable ? pct(opened.count, Math.max(1, campaignSent)) : null, opened.measurable ? 'info' : 'not_measurable'),
    kpi('claim_rate', 'Claim rate after invite', pct(p.claimedAfterInvite, invited.count), 'info', invited.count === 0 ? 'No invitations.' : undefined),
    kpi('cadence_exhausted', 'Cadence exhausted (3+ sends)', p.dataQuality.cadenceExhausted, p.dataQuality.cadenceExhausted > 0 ? 'warn' : 'ok'),
  ];

  return {
    kpis,
    supplierHealth,
    rfqReadiness,
    outreach,
    alerts: evaluateAlerts(p, f),
    rfqLifecycle: { rfqTotal: f.rfqTotal, byStatus: f.rfqByStatus, quotes: f.quotesTotal, buyerAlerts: f.buyerQuoteAlerts, deals: f.dealsTotal },
    notes: ['Targets and thresholds are proposals for the founder; none is stored anywhere. No stage or rate is reported as healthy.'],
  };
}
