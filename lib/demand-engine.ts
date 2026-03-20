/**
 * Demand Engine — Auto Lead Conversion + Content Generation
 * ──────────────────────────────────────────────────────────
 * Converts external leads into seeded RFQs and generates
 * ready-to-post content (LinkedIn, WhatsApp, blog).
 *
 * Scraping is EXTERNAL — leads arrive via POST /api/leads/import
 * (from Apify, PhantomBuster, manual CSV, or webhook).
 * This engine processes what arrives.
 */

import { prisma } from '@/lib/prisma';
import { aiClient } from '@/lib/ai-client';
import { storeRFQ } from '@/lib/memory-engine';

const CATEGORIES = [
  'Agriculture', 'Apparel & Fashion', 'Automobile', 'Chemical',
  'Electronics & Electrical', 'Food Products & Beverage',
  'Industrial Machinery', 'Packaging & Paper',
  'Real Estate & Construction', 'Textiles', 'Tools & Equipment',
  'Health & Beauty', 'Logistics', 'Other',
];

// ─── Lead Classification ──────────────────────────────────────────────────────

/**
 * classifyLead — uses AI to extract structured RFQ data from raw lead text.
 * Falls back to keyword matching if AI is unavailable.
 */
export async function classifyLead(rawText: string): Promise<{
  category: string;
  requirement: string;
  budgetHint: string | null;
  location: string | null;
}> {
  // AI classification
  try {
    const response = await aiClient.createChatCompletion('text', [
      {
        role: 'system',
        content: `You are a B2B procurement classifier for Indian marketplace Bell24h. Extract structured data from informal lead text. Reply with JSON only.

Categories: ${CATEGORIES.join(', ')}

Return: { "category": "...", "requirement": "clean 1-sentence summary", "budgetHint": "e.g. ₹50,000 or null", "location": "city or null" }`,
      },
      { role: 'user', content: rawText.slice(0, 1000) },
    ], { temperature: 0.2, maxTokens: 200 });

    const content = response.choices[0]?.message?.content ?? '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {
    // Fall through to keyword fallback
  }

  // Keyword fallback
  const lower = rawText.toLowerCase();
  let category = 'Other';
  const categoryKeywords: [string, string[]][] = [
    ['Textiles', ['cotton', 'fabric', 'textile', 'yarn', 'garment', 'apparel']],
    ['Packaging & Paper', ['packaging', 'box', 'carton', 'label', 'corrugated', 'pouch']],
    ['Industrial Machinery', ['machine', 'machinery', 'equipment', 'cnc', 'lathe', 'pump']],
    ['Automobile', ['auto', 'car', 'vehicle', 'spare', 'tyre', 'brake']],
    ['Electronics & Electrical', ['electronic', 'pcb', 'led', 'sensor', 'wire', 'cable']],
    ['Chemical', ['chemical', 'solvent', 'resin', 'polymer', 'pigment']],
    ['Food Products & Beverage', ['food', 'beverage', 'snack', 'spice', 'grain', 'rice']],
    ['Agriculture', ['seed', 'fertilizer', 'pesticide', 'agri', 'crop', 'farm']],
  ];
  for (const [cat, kws] of categoryKeywords) {
    if (kws.some(kw => lower.includes(kw))) { category = cat; break; }
  }

  return {
    category,
    requirement: rawText.slice(0, 200).trim(),
    budgetHint: null,
    location: null,
  };
}

// ─── Lead → RFQ Conversion ────────────────────────────────────────────────────

/**
 * convertLeadToRFQ — takes a classified ExternalLead and creates a seeded RFQ.
 * Seeded RFQs are visible in marketplace but skipped by Agent Zero outreach.
 */
export async function convertLeadToRFQ(leadId: string): Promise<{ rfqId: string } | null> {
  const lead = await prisma.externalLead.findUnique({ where: { id: leadId } });
  if (!lead || lead.status !== 'new') return null;

  const category = lead.category ?? 'Other';
  const title = lead.requirement
    ? lead.requirement.slice(0, 80)
    : `${category} requirement from ${lead.source}`;

  try {
    const rfq = await prisma.rFQ.create({
      data: {
        title,
        description: lead.rawText.slice(0, 500),
        category,
        quantity: 'To be discussed',
        location: lead.location ?? null,
        status: 'OPEN',
        isSeeded: true,     // marks as seeded — Agent Zero skips outreach
        isPublic: true,
        type: 'TEXT',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Store in memory for market insights (seeded data enriches category trends)
    storeRFQ({
      rfqId: rfq.id,
      title: rfq.title,
      category: rfq.category,
      quantity: rfq.quantity,
      location: rfq.location ?? undefined,
      metadata: { source: lead.source, isSeeded: true },
    }).catch(() => {});

    // Mark lead as converted
    await prisma.externalLead.update({
      where: { id: leadId },
      data: { status: 'converted', rfqId: rfq.id, processedAt: new Date() },
    });

    return { rfqId: rfq.id };
  } catch (e) {
    console.error('[DemandEngine] convertLeadToRFQ failed:', e);
    return null;
  }
}

// ─── Content Generator ────────────────────────────────────────────────────────

export interface GeneratedContent {
  linkedin: string;
  whatsapp: string;
  blogSnippet: string;
  twitterX: string;
}

/**
 * generateContent — creates shareable content for a live RFQ.
 * Used to push into LinkedIn/WhatsApp/Twitter manually or via scheduler.
 */
export async function generateContent(rfqId: string): Promise<GeneratedContent | null> {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    select: { id: true, title: true, category: true, location: true, maxBudget: true, quantity: true, urgency: true },
  });
  if (!rfq) return null;

  const budget = rfq.maxBudget ? `₹${Number(rfq.maxBudget).toLocaleString('en-IN')}` : null;
  const loc = rfq.location ?? 'India';
  const link = `https://www.bell24h.com/rfq/${rfq.id}`;

  const linkedin = [
    `🔴 New B2B RFQ on Bell24h`,
    ``,
    `📦 ${rfq.title}`,
    `📍 Category: ${rfq.category}`,
    `🌏 Location: ${loc}`,
    budget ? `💰 Budget: ${budget}` : null,
    rfq.quantity !== 'To be discussed' ? `📊 Qty: ${rfq.quantity}` : null,
    ``,
    `Suppliers — quote directly (free during beta):`,
    link,
    ``,
    `#B2B #Procurement #${rfq.category.replace(/\s+/g, '')} #Bell24h #IndianManufacturing`,
  ].filter(Boolean).join('\n');

  const whatsapp = `*New RFQ Alert — Bell24h* 🔔\n\n` +
    `*${rfq.title}*\n` +
    `Category: ${rfq.category} | Location: ${loc}\n` +
    (budget ? `Budget: ${budget}\n` : '') +
    `\nQuote now (free): ${link}`;

  const blogSnippet = `**${rfq.title}** — A buyer in ${loc} is actively sourcing ${rfq.category.toLowerCase()} products` +
    (budget ? ` with a budget of ${budget}` : '') +
    `. Submit your quote on Bell24h: ${link}`;

  const twitterX = `🔴 Live RFQ: ${rfq.title} (${rfq.category}, ${loc})` +
    (budget ? ` | Budget: ${budget}` : '') +
    `\nFree to quote 👉 ${link} #B2B #Manufacturing`;

  return { linkedin, whatsapp, blogSnippet, twitterX };
}

// ─── Daily Demand Loop ────────────────────────────────────────────────────────

/**
 * runDailyDemandLoop — called by cron.
 * 1. Converts pending leads to seeded RFQs
 * 2. Returns content for today's top RFQs
 */
export async function runDailyDemandLoop(): Promise<{
  leadsConverted: number;
  contentGenerated: number;
  errors: number;
}> {
  let leadsConverted = 0;
  let contentGenerated = 0;
  let errors = 0;

  // Convert up to 20 pending leads per run
  const pendingLeads = await prisma.externalLead.findMany({
    where: { status: 'new', category: { not: null } },
    take: 20,
    orderBy: { createdAt: 'asc' },
  });

  for (const lead of pendingLeads) {
    const result = await convertLeadToRFQ(lead.id).catch(() => null);
    if (result) leadsConverted++;
    else errors++;
  }

  // Generate content for today's real (non-seeded) RFQs
  const todayRFQs = await prisma.rFQ.findMany({
    where: {
      isSeeded: false,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: 'OPEN',
    },
    take: 10,
    select: { id: true },
  });

  for (const rfq of todayRFQs) {
    const content = await generateContent(rfq.id).catch(() => null);
    if (content) contentGenerated++;
  }

  return { leadsConverted, contentGenerated, errors };
}

// ─── Activity Perception ──────────────────────────────────────────────────────

/**
 * getActivityStats — real stats with minimum floor for trust signals.
 * Shows real numbers when available, floor values when cold-start.
 */
export async function getActivityStats() {
  const [rfqsToday, quotesThisWeek, activeSuppliers, totalRFQs] = await Promise.all([
    prisma.rFQ.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) }, isSeeded: false } }),
    prisma.quote.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.user.count({ where: { role: 'SUPPLIER', isActive: true, isClaimed: true } }),
    prisma.rFQ.count({ where: { isSeeded: false } }),
  ]);

  return {
    rfqsToday: Math.max(rfqsToday, 0),
    quotesThisWeek: Math.max(quotesThisWeek, 0),
    activeSuppliers: Math.max(activeSuppliers, 0),
    totalRFQs: Math.max(totalRFQs, 0),
    // Human-readable trust signals (real numbers only)
    signals: [
      activeSuppliers > 0 ? `${activeSuppliers} verified suppliers ready to quote` : null,
      rfqsToday > 0 ? `${rfqsToday} RFQs posted today` : null,
      quotesThisWeek > 0 ? `${quotesThisWeek} quotes submitted this week` : null,
    ].filter(Boolean) as string[],
  };
}
