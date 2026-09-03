/**
 * Production Readiness Diagnostics
 * ────────────────────────────────
 * Single admin endpoint backing /admin/system. Returns three views:
 *   - environment : which env vars are configured (presence only, never values)
 *   - health      : live DB + Business Operating Memory signals
 *   - readiness   : computed 0–100 scores for the production checklist
 *
 * Read-only. Admin-protected via requireAdmin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { LIFE_EVENT_TYPES } from '@/src/lib/bom/life-events';

export const dynamic = 'force-dynamic';

type Severity = 'required' | 'recommended' | 'optional';

interface EnvCheck {
  key: string;
  label: string;
  group: string;
  severity: Severity;
  configured: boolean;
}

/** Presence-only check across one or more candidate var names. */
function present(...names: string[]): boolean {
  return names.some((n) => {
    const v = process.env[n];
    return typeof v === 'string' && v.trim().length > 0;
  });
}

function buildEnvChecks(): EnvCheck[] {
  return [
    // Core
    { key: 'DATABASE_URL', label: 'Database (pooled)', group: 'Core', severity: 'required', configured: present('DATABASE_URL') },
    { key: 'DIRECT_URL', label: 'Database (direct/migrations)', group: 'Core', severity: 'required', configured: present('DIRECT_URL') },
    { key: 'JWT_SECRET', label: 'JWT / session secret', group: 'Core', severity: 'required', configured: present('JWT_SECRET', 'NEXTAUTH_SECRET') },
    { key: 'NEXTAUTH_URL', label: 'Auth base URL', group: 'Core', severity: 'recommended', configured: present('NEXTAUTH_URL', 'NEXT_PUBLIC_SITE_URL') },
    { key: 'NEXT_PUBLIC_SITE_URL', label: 'Public site URL', group: 'Core', severity: 'required', configured: present('NEXT_PUBLIC_SITE_URL') },
    { key: 'CRON_SECRET', label: 'Cron / job auth secret', group: 'Core', severity: 'required', configured: present('CRON_SECRET') },

    // Auth / OTP
    { key: 'MSG91_AUTH_KEY', label: 'MSG91 auth key', group: 'Auth & OTP', severity: 'required', configured: present('MSG91_AUTH_KEY') },
    { key: 'MSG91_SENDER_ID', label: 'MSG91 sender ID', group: 'Auth & OTP', severity: 'required', configured: present('MSG91_SENDER_ID') },
    { key: 'MSG91_TEMPLATE_ID', label: 'MSG91 OTP template', group: 'Auth & OTP', severity: 'required', configured: present('MSG91_TEMPLATE_ID') },
    { key: 'ADMIN_PASSWORD', label: 'Admin login password', group: 'Auth & OTP', severity: 'recommended', configured: present('ADMIN_PASSWORD') },

    // Payments
    { key: 'RAZORPAY_KEY_ID', label: 'Razorpay key ID', group: 'Payments', severity: 'required', configured: present('RAZORPAY_KEY_ID') },
    { key: 'RAZORPAY_KEY_SECRET', label: 'Razorpay key secret', group: 'Payments', severity: 'required', configured: present('RAZORPAY_KEY_SECRET') },
    { key: 'RAZORPAY_WEBHOOK_SECRET', label: 'Razorpay webhook secret', group: 'Payments', severity: 'recommended', configured: present('RAZORPAY_WEBHOOK_SECRET') },

    // AI / Voice
    { key: 'GROQ_API_KEY', label: 'Groq (voice transcription)', group: 'AI & Voice', severity: 'required', configured: present('GROQ_API_KEY') },
    { key: 'NVIDIA_API_KEY', label: 'NVIDIA (matching/SEO LLM)', group: 'AI & Voice', severity: 'recommended', configured: present('NVIDIA_API_KEY', 'NVIDIA_DEEPSEEK_KEY') },
    { key: 'OPENROUTER_API_KEY', label: 'OpenRouter', group: 'AI & Voice', severity: 'optional', configured: present('OPENROUTER_API_KEY') },
    { key: 'PYTHON_EXPLAINER_URL', label: 'Render AI explainer service', group: 'AI & Voice', severity: 'recommended', configured: present('PYTHON_EXPLAINER_URL') },

    // SEO / Google
    { key: 'GSC_SERVICE_ACCOUNT_JSON', label: 'Google Search Console / Indexing', group: 'SEO & Google', severity: 'recommended', configured: present('GSC_SERVICE_ACCOUNT_JSON') },
    { key: 'GSC_SITE_URL', label: 'Search Console property', group: 'SEO & Google', severity: 'recommended', configured: present('GSC_SITE_URL') },

    // Media / Email
    { key: 'RESEND_API_KEY', label: 'Resend (transactional email)', group: 'Media & Email', severity: 'optional', configured: present('RESEND_API_KEY') },
    { key: 'CLOUDINARY_URL', label: 'Cloudinary (media)', group: 'Media & Email', severity: 'optional', configured: present('CLOUDINARY_URL', 'CLOUDINARY_API_KEY') },
  ];
}

function scoreColor(score: number): 'green' | 'amber' | 'red' {
  return score >= 80 ? 'green' : score >= 50 ? 'amber' : 'red';
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const env = buildEnvChecks();
  const requiredEnv = env.filter((e) => e.severity === 'required');
  const requiredConfigured = requiredEnv.filter((e) => e.configured).length;
  const legacyInsforge = present('INSFORGE_URL', 'INSFORGE_API_KEY', 'NEXT_PUBLIC_INSFORGE_BASE_URL');

  // ── Health: live DB + BOM signals ────────────────────────────────────────
  let dbConnected = false;
  let dbLatency: number | null = null;
  let dbError: string | null = null;

  const counts = {
    users: 0,
    verifiedSuppliers: 0,
    rfqs: 0,
    rfqMemory: 0,
    quoteMemory: 0,
    deals: 0,
    lifeEvents: 0,
    marketInsights: 0,
  };
  let recordedEventTypes: string[] = [];
  let lastEventAt: string | null = null;

  // Per-metric errors — one failing count must never blank the others.
  // Populated only for metrics that actually failed; absent (not present as a
  // key) for anything that succeeded. Additive to the response — existing
  // consumers reading `health.counts`/`health.bom` are unaffected.
  const countErrors: Record<string, string> = {};

  if (present('DATABASE_URL')) {
    // Connectivity probe stays isolated from the metric queries below: if
    // this fails, dbConnected/dbError reflect a real DB-down state and none
    // of the metric queries below are attempted. If this succeeds but an
    // individual metric query later fails, dbConnected stays true (the DB is
    // reachable — only that one metric had a problem) and the failure is
    // recorded per-key in countErrors instead of wiping every count.
    try {
      const t0 = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - t0;
      dbConnected = true;
    } catch (err) {
      dbError = describeError(err);
    }

    if (dbConnected) {
      const metricQueries: Array<{ key: keyof typeof counts; run: () => Promise<number> }> = [
        { key: 'users', run: () => prisma.user.count() },
        { key: 'verifiedSuppliers', run: () => prisma.user.count({ where: { role: 'SUPPLIER', isVerified: true } }) },
        { key: 'rfqs', run: () => prisma.rFQ.count() },
        { key: 'rfqMemory', run: () => prisma.rfqMemory.count() },
        { key: 'quoteMemory', run: () => prisma.quoteMemory.count() },
        { key: 'deals', run: () => prisma.deal.count() },
        { key: 'lifeEvents', run: () => prisma.businessLifeEvent.count() },
        { key: 'marketInsights', run: () => prisma.marketInsight.count() },
      ];

      const [countResults, eventCoverageResult, lastEventResult] = await Promise.all([
        Promise.allSettled(metricQueries.map((m) => m.run())),
        Promise.allSettled([
          prisma.businessLifeEvent.findMany({ distinct: ['eventType'], select: { eventType: true } }),
        ]),
        Promise.allSettled([
          prisma.businessLifeEvent.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
        ]),
      ]);

      countResults.forEach((result, i) => {
        const { key } = metricQueries[i];
        if (result.status === 'fulfilled') {
          counts[key] = result.value;
        } else {
          countErrors[key] = describeError(result.reason);
          console.error(`[System Diagnostics] count query failed for "${key}":`, result.reason);
        }
      });

      const [eventCoverageSettled] = eventCoverageResult;
      if (eventCoverageSettled.status === 'fulfilled') {
        recordedEventTypes = eventCoverageSettled.value.map((d) => d.eventType);
      } else {
        countErrors.eventCoverage = describeError(eventCoverageSettled.reason);
        console.error('[System Diagnostics] eventType coverage query failed:', eventCoverageSettled.reason);
      }

      const [lastEventSettled] = lastEventResult;
      if (lastEventSettled.status === 'fulfilled') {
        lastEventAt = lastEventSettled.value?.createdAt.toISOString() ?? null;
      } else {
        countErrors.lastEventAt = describeError(lastEventSettled.reason);
        console.error('[System Diagnostics] latest event query failed:', lastEventSettled.reason);
      }
    }
  } else {
    dbError = 'DATABASE_URL not set';
  }

  // Which of the meaningful life-event types have ever been recorded?
  const eventCoverage = LIFE_EVENT_TYPES.map((t) => ({
    eventType: t,
    recorded: recordedEventTypes.includes(t),
  }));
  const recordedCount = eventCoverage.filter((e) => e.recorded).length;

  // ── Readiness scores (0–100) from real signals ───────────────────────────
  const environmentScore = Math.round((requiredConfigured / Math.max(requiredEnv.length, 1)) * 100);
  const databaseScore = dbConnected ? 100 : 0;

  const securityChecks = [
    present('JWT_SECRET', 'NEXTAUTH_SECRET'),
    present('CRON_SECRET'),
    present('ADMIN_PASSWORD'),
    present('RAZORPAY_WEBHOOK_SECRET'),
    !legacyInsforge, // legacy InsForge creds should be gone
  ];
  const securityScore = Math.round((securityChecks.filter(Boolean).length / securityChecks.length) * 100);

  const businessMemoryScore = Math.round((recordedCount / LIFE_EVENT_TYPES.length) * 100);
  const automationScore = present('CRON_SECRET') && present('NEXT_PUBLIC_SITE_URL') ? 100 : 50;
  const seoScore = present('GSC_SERVICE_ACCOUNT_JSON') ? 100 : 60;
  const supplierReadinessScore = counts.verifiedSuppliers > 0 ? Math.min(100, counts.verifiedSuppliers * 2) : 10;
  const apiScore = dbConnected ? 90 : 0;
  const deploymentScore = present('NEXT_PUBLIC_SITE_URL') && dbConnected ? 100 : 50;

  const scores = [
    { id: 'production', label: 'Production', value: Math.round((environmentScore + databaseScore + securityScore) / 3) },
    { id: 'deployment', label: 'Deployment', value: deploymentScore },
    { id: 'security', label: 'Security', value: securityScore },
    { id: 'seo', label: 'SEO', value: seoScore },
    { id: 'businessMemory', label: 'Business Memory', value: businessMemoryScore },
    { id: 'automation', label: 'Automation', value: automationScore },
    { id: 'supplierReadiness', label: 'Supplier Readiness', value: supplierReadinessScore },
    { id: 'database', label: 'Database', value: databaseScore },
    { id: 'api', label: 'API', value: apiScore },
    { id: 'environment', label: 'Environment', value: environmentScore },
  ].map((s) => ({ ...s, color: scoreColor(s.value) }));

  const overall = Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);

  return NextResponse.json({
    success: true,
    generatedAt: new Date().toISOString(),
    environment: {
      checks: env,
      requiredConfigured,
      requiredTotal: requiredEnv.length,
      legacyInsforgePresent: legacyInsforge,
    },
    health: {
      database: { connected: dbConnected, latencyMs: dbLatency, error: dbError },
      counts,
      // Additive — existing consumers reading only `counts`/`bom` are
      // unaffected. `degraded` is true when the DB is reachable but one or
      // more individual metrics failed (see Finding 5,
      // docs/audits/VS-ADMIN-PRODUCTION-AUDIT-FIX-01.md): lets the UI (and
      // anyone reading this JSON directly) tell "really zero" apart from
      // "that one query failed" instead of both looking identical.
      degraded: Object.keys(countErrors).length > 0,
      countErrors,
      bom: {
        totalEvents: counts.lifeEvents,
        lastEventAt,
        recordedTypes: recordedCount,
        totalTypes: LIFE_EVENT_TYPES.length,
        coverage: eventCoverage,
      },
    },
    readiness: {
      overall,
      color: scoreColor(overall),
      scores,
    },
  });
}
