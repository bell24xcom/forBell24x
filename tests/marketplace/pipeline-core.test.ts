// MA-01 supplier pipeline — the pure rules in src/lib/discovery/pipeline-core.ts, against fixtures.
// No database: these prove the DEFINITIONS (stage rules, exclusions, duplicate groups, honesty markers).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PIPELINE_STAGES,
  computeActivation,
  computePipeline,
  evaluateAlerts,
  evaluateSuppliers,
  groupDuplicates,
  isUsableEmail,
  isValidIndianMobile,
  normalizeCompany,
  phone10,
  pilotStatus,
} from '../../src/lib/discovery/pipeline-core.ts';

let n = 0;
function sup(over: Record<string, any> = {}): any {
  n++;
  return {
    id: `s${n}`,
    isActive: true,
    company: `Company ${n} Industries`,
    name: null,
    email: null,
    phone: `98${String(10000000 + n).padStart(8, '0')}`,
    importedFrom: 'mjp',
    gstNumber: null,
    preferences: { categories: ['Steel Bars'] },
    isClaimed: false,
    claimedAt: null,
    claimSentAt: null,
    outreachCount: 0,
    createdAt: new Date(2026, 0, 1, 0, 0, n),
    ...over,
  };
}
const facts = (over: Record<string, Set<string>> = {}): any => ({
  suppressedIds: new Set(),
  suppressedPhones: new Set(),
  campaignSentIds: new Set(),
  openedIds: new Set(),
  quotedIds: new Set(),
  ...over,
});
const stage = (r: any, s: string) => r.stages.find((x: any) => x.stage === s);

test('nine stages, in the documented order', () => {
  assert.deepEqual([...PIPELINE_STAGES], ['DISCOVERED', 'QUALIFIED', 'DEDUPLICATED', 'INVITATION_READY', 'INVITED', 'OPENED', 'CLAIMED', 'PROFILE_COMPLETED', 'RFQ_ELIGIBLE']);
});

test('field rules match the SQL that produced the baselines', () => {
  assert.equal(phone10('+91 98765-43210'), '9876543210');
  assert.equal(phone10('12345'), '');
  assert.equal(isValidIndianMobile('+919876543210'), true);
  assert.equal(isValidIndianMobile('5876543210'), false, 'must start 6-9');
  assert.equal(isValidIndianMobile(null), false);
  assert.equal(isUsableEmail('a@b.co'), true);
  assert.equal(isUsableEmail('x@placeholder.local'), false);
  assert.equal(isUsableEmail('not-an-email'), false);
  assert.equal(normalizeCompany('Acme Steel Pvt. Ltd.'), 'acme steel');
  assert.equal(normalizeCompany('Ltd'), null, 'nothing meaningful left -> no grouping key');
});

test('QUALIFIED needs active + name + a category + a reachable channel', () => {
  const rows = [
    sup(), // qualified
    sup({ isActive: false }),
    sup({ company: null, name: null }),
    sup({ preferences: { categories: [] } }),
    sup({ preferences: null }),
    sup({ phone: null, email: null }),
    sup({ phone: null, email: 'ok@example.com' }), // email-only is qualified
  ];
  const ev = evaluateSuppliers(rows, facts());
  assert.deepEqual(ev.map((e) => e.flags.QUALIFIED), [true, false, false, false, false, false, true]);
});

test('INVITATION_READY = deduplicated, unclaimed, valid mobile, not suppressed (email-only is qualified but NOT ready)', () => {
  const ready = sup();
  const claimed = sup({ isClaimed: true });
  const emailOnly = sup({ phone: null, email: 'only@example.com' });
  const suppressedById = sup();
  const suppressedByPhone = sup({ phone: '9876500001' });
  const ev = evaluateSuppliers([ready, claimed, emailOnly, suppressedById, suppressedByPhone], facts({ suppressedIds: new Set([suppressedById.id]), suppressedPhones: new Set(['9876500001']) }));
  const by = Object.fromEntries(ev.map((e) => [e.row.id, e.flags.INVITATION_READY]));
  assert.equal(by[ready.id], true);
  assert.equal(by[claimed.id], false);
  assert.equal(by[emailOnly.id], false);
  assert.equal(by[suppressedById.id], false);
  assert.equal(by[suppressedByPhone.id], false, 'a suppression by destination (phone) also blocks the supplier');
});

test('duplicates: shared company / GST / phone-last-10 group together and exactly one canonical stays ready', () => {
  const a = sup({ company: 'Acme Steel Pvt Ltd', createdAt: new Date(2026, 0, 1) });
  const b = sup({ company: 'ACME STEEL', createdAt: new Date(2026, 0, 2) });
  const c = sup({ company: 'Different Name', gstNumber: '27ABCDE1234F1Z5' });
  const d = sup({ company: 'Another Name', gstNumber: '27abcde1234f1z5' });
  const solo = sup();
  const g = groupDuplicates([a, b, c, d, solo]);
  assert.equal(g.groups.length, 2);
  assert.ok(g.canonical.has(a.id) && !g.canonical.has(b.id), 'oldest wins');
  assert.ok(g.canonical.has(solo.id));
  const ev = evaluateSuppliers([a, b, c, d, solo], facts());
  assert.equal(ev.filter((e) => e.flags.DEDUPLICATED).length, 3, 'one per group + the singleton');
  assert.equal(ev.find((e) => e.row.id === b.id)!.flags.duplicateOfOther, true);
});

test('a claimed record is the canonical one of its duplicate group', () => {
  const old = sup({ company: 'Same Co', createdAt: new Date(2025, 0, 1) });
  const claimed = sup({ company: 'Same Co', isClaimed: true, createdAt: new Date(2026, 0, 1) });
  assert.ok(groupDuplicates([old, claimed]).canonical.has(claimed.id));
});

test('INVITED counts either path; legacy-only is labelled unverified; OPENED is NOT MEASURABLE until something can be opened', () => {
  const legacy = sup({ claimSentAt: new Date(2026, 5, 1), outreachCount: 3 });
  const viaCampaign = sup();
  const plain = sup();
  let r = computePipeline([legacy, viaCampaign, plain], facts({ campaignSentIds: new Set([viaCampaign.id]) }));
  assert.equal(stage(r, 'INVITED').count, 2);
  assert.match(stage(r, 'INVITED').note, /legacy/);
  // the campaign path has sent, so opens ARE trackable and 0 is a real 0
  assert.equal(stage(r, 'OPENED').measurable, true);

  r = computePipeline([legacy, plain], facts());
  assert.equal(stage(r, 'OPENED').measurable, false, 'no campaign sends and no open events: not measurable');
  assert.equal(stage(r, 'OPENED').count, 0);
  assert.match(stage(r, 'OPENED').note, /Not measurable/);
  assert.equal(r.funnel.find((f) => f.stage === 'OPENED')!.stepRate, null);

  r = computePipeline([legacy], facts({ openedIds: new Set([legacy.id]) }));
  assert.equal(stage(r, 'OPENED').measurable, true);
  assert.equal(stage(r, 'OPENED').count, 1);
});

test('seed accounts are excluded by default, reported, and the toggle brings them back', () => {
  const real = sup({ isClaimed: true, claimedAt: new Date(2026, 1, 1), preferences: { categories: ['x'], onboardingComplete: true } });
  const seed1 = sup({ importedFrom: 'admin_seed', isClaimed: true, preferences: { categories: ['x'], onboardingComplete: true } });
  const seed2 = sup({ importedFrom: 'admin_seed', isClaimed: true, preferences: { categories: ['x'], onboardingComplete: true } });
  const off = computePipeline([real, seed1, seed2], facts());
  assert.deepEqual([off.scope.supplierAccounts, off.scope.excludedSeed, off.scope.considered], [3, 2, 1]);
  assert.equal(stage(off, 'CLAIMED').count, 1);
  assert.equal(stage(off, 'PROFILE_COMPLETED').count, 1);
  assert.ok(off.banners.some((b) => /Seed accounts excluded \(2\)/.test(b)));
  const on = computePipeline([real, seed1, seed2], facts(), { includeSeed: true });
  assert.equal(stage(on, 'CLAIMED').count, 3);
  assert.equal(stage(on, 'PROFILE_COMPLETED').count, 3);
  assert.ok(!on.banners.some((b) => /Seed accounts excluded/.test(b)));
});

test('claimed accounts with no claimed_at are counted as a data-quality problem, never hidden', () => {
  const noDate = sup({ isClaimed: true, claimedAt: null });
  const withDate = sup({ isClaimed: true, claimedAt: new Date(2026, 1, 1) });
  const r = computePipeline([noDate, withDate], facts());
  assert.equal(r.dataQuality.claimedWithoutClaimedAt, 1);
  assert.match(stage(r, 'CLAIMED').note, /no claimed_at/);
});

test('claimed-after-invite needs an invitation first and (when dated) a claim on or after it', () => {
  const after = sup({ isClaimed: true, claimSentAt: new Date(2026, 1, 1), claimedAt: new Date(2026, 1, 2) });
  const before = sup({ isClaimed: true, claimSentAt: new Date(2026, 1, 5), claimedAt: new Date(2026, 1, 2) });
  const never = sup({ isClaimed: true, claimedAt: new Date(2026, 1, 2) });
  const r = computePipeline([after, before, never], facts());
  assert.equal(r.claimedAfterInvite, 1);
});

test('RFQ_ELIGIBLE uses the matcher gates INCLUDING its newest-N window (older suppliers are not eligible)', () => {
  const rows = Array.from({ length: 5 }, (_, i) => sup({ createdAt: new Date(2026, 0, 1 + i) }));
  const ev = evaluateSuppliers(rows, facts(), { matcherWindow: 3 });
  assert.deepEqual(ev.map((e) => e.flags.RFQ_ELIGIBLE), [false, false, true, true, true]);
  const noCat = sup({ preferences: { categories: [] }, createdAt: new Date(2030, 0, 1) });
  const ev2 = evaluateSuppliers([...rows, noCat], facts(), { matcherWindow: 3 });
  assert.equal(ev2.find((e) => e.row.id === noCat.id)!.flags.RFQ_ELIGIBLE, false, 'in the window but no category');
  // the window is computed over ALL suppliers, so an excluded seed account still consumes a slot
  const seed = sup({ importedFrom: 'admin_seed', createdAt: new Date(2031, 0, 1) });
  const r = computePipeline([...rows, seed], facts(), { matcherWindow: 3 });
  assert.equal(stage(r, 'RFQ_ELIGIBLE').count, 2);
});

test('cohort tables by source and category; pilot coverage flags shortage against 50', () => {
  const rows = [sup({ importedFrom: 'mjp' }), sup({ importedFrom: 'mjp' }), sup({ importedFrom: null }), sup({ importedFrom: 'discovery:websearch:x', preferences: { categories: ['Copper Wire'] } })];
  const r = computePipeline(rows, facts());
  assert.deepEqual(r.bySource.map((c) => [c.key, c.suppliers]), [['mjp', 2], ['(none: self-registered / early)', 1], ['websearch', 1]]);
  const steel = r.byCategory.find((c) => c.key === 'steel bars')!;
  assert.equal(steel.suppliers, 3);
  const copper = r.pilotCoverage.find((c) => c.category === 'COPPER')!;
  assert.deepEqual([copper.invitationReady, copper.gap, copper.status], [1, 49, 'bad']);
  assert.equal(r.pilotCoverage.find((c) => c.category === 'STEEL BARS')!.invitationReady, 3);
  assert.equal(r.pilotCoverage.find((c) => c.category === 'UPHOLSTERY FABRICS')!.status, 'bad');
  assert.equal(pilotStatus(50), 'ok');
  assert.equal(pilotStatus(25), 'warn');
  assert.equal(pilotStatus(24), 'bad');
});

test('fresh = invitation-ready and never contacted', () => {
  const fresh = sup();
  const contacted = sup({ outreachCount: 3, claimSentAt: new Date(2026, 1, 1) });
  const r = computePipeline([fresh, contacted], facts());
  const steel = r.pilotCoverage.find((c) => c.category === 'STEEL BARS')!;
  assert.deepEqual([steel.invitationReady, steel.fresh], [2, 1]);
  assert.equal(r.dataQuality.cadenceExhausted, 1);
  assert.ok(r.banners.some((b) => /fourth touch/.test(b)));
});

test('funnel step rates are null (not 0) when the previous stage is empty', () => {
  const r = computePipeline([], facts());
  assert.ok(r.funnel.every((f) => f.stepRate === null));
  assert.equal(r.scope.considered, 0);
});

test('activation: every rate that cannot be computed is null, the alerts follow the documented conditions', () => {
  const rows = [sup({ isClaimed: true, claimedAt: null, preferences: { categories: ['x'], onboardingComplete: true } }), sup({ claimSentAt: new Date(2026, 1, 1), outreachCount: 3 })];
  const p = computePipeline(rows, facts());
  const rf: any = { rfqTotal: 86, rfqByStatus: { EXPIRED: 56 }, quotesBySuppliers: 6, quotesTotal: 19, rfqParticipants: 5, buyerQuoteAlerts: 0, dealsTotal: 3, campaign: { sent: 0, delivered: 0, failed: 0, last50Sent: 0, last50Failed: 0 } };
  const a = computeActivation(p, rf);
  const k = (arr: any[], key: string) => arr.find((x) => x.key === key);
  assert.equal(k(a.kpis, 'opened').status, 'not_measurable');
  assert.equal(k(a.kpis, 'opened').value, null);
  assert.equal(k(a.outreach, 'delivery_rate').value, null);
  assert.equal(k(a.outreach, 'open_rate').status, 'not_measurable');
  assert.equal(k(a.supplierHealth, 'completion_of_claimed').value, 100);
  assert.equal(k(a.rfqReadiness, 'buyer_alerts').value, '0 / 19');
  assert.deepEqual(a.alerts.map((x) => x.key).sort(), ['buyer_alerts_missing', 'cadence', 'data_integrity']);
  assert.match(a.notes[0], /proposals/);
});

test('alerts: delivery problem above 10% of the last sends; zero-conversion only from 100 invitations', () => {
  const p = computePipeline([sup({ claimSentAt: new Date(2026, 1, 1) })], facts({ campaignSentIds: new Set(['x']) }));
  const base: any = { rfqTotal: 0, rfqByStatus: {}, quotesBySuppliers: 0, quotesTotal: 0, rfqParticipants: 0, buyerQuoteAlerts: 0, dealsTotal: 0 };
  const keys = (campaign: any) => evaluateAlerts(p, { ...base, campaign }).map((a) => a.key);
  assert.deepEqual(keys({ sent: 40, delivered: 0, failed: 6, last50Sent: 44, last50Failed: 6 }), ['delivery_problem']);
  assert.deepEqual(keys({ sent: 40, delivered: 0, failed: 1, last50Sent: 49, last50Failed: 1 }), []);
  assert.ok(!keys({ sent: 99, delivered: 0, failed: 0, last50Sent: 50, last50Failed: 0 }).includes('zero_conversion'));
  assert.ok(keys({ sent: 100, delivered: 0, failed: 0, last50Sent: 50, last50Failed: 0 }).includes('zero_conversion'));
});

test('STEEL BARS: a generic steel slug is NOT counted as bars; the broader steel figure is reported separately', () => {
  const generic = sup({ preferences: { categories: ['iron-steel'] } });
  const generic2 = sup({ preferences: { categories: ['Steel & Metals'] } });
  const bars = sup({ preferences: { categories: ['TMT Bars'] } });
  const r = computePipeline([generic, generic2, bars], facts());
  const row = r.pilotCoverage.find((c) => c.category === 'STEEL BARS')!;
  assert.equal(row.invitationReady, 1, 'only the bar-specific category counts as STEEL BARS');
  assert.equal(row.broaderReady, 2, 'the two generic steel categories are reported as broader steel, not as bars');
  assert.equal(row.status, 'bad');
  assert.match(row.note!, /do not exist/);
  assert.equal(r.pilotCoverage.find((c) => c.category === 'COPPER')!.broaderReady, undefined);
});
