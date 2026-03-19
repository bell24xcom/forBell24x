/**
 * Bell24h Knowledge Base
 * ─────────────────────
 * Structured index of all planning docs, automation flows, and system
 * knowledge from the Bell24h / Digitex ecosystem.
 *
 * Sources:
 *  - ./docs/*.md
 *  - ./plans/*.md
 *  - ./automation/*.md
 *  - Cloudflare Worker scripts
 *
 * Types: rfq_logic | marketing | agent | automation | onboarding | compliance
 */

export interface KBEntry {
  id: string;
  type: 'rfq_logic' | 'marketing' | 'agent' | 'automation' | 'onboarding' | 'compliance' | 'general';
  title: string;
  summary: string;
  content: string;
  tags: string[];
  source: string;
  updatedAt?: string;
}

// ─── RFQ Logic ────────────────────────────────────────────────────────────────

const rfqLogic: KBEntry[] = [
  {
    id: 'rfq-001',
    type: 'rfq_logic',
    title: 'Voice RFQ Flow',
    summary: 'Record → Whisper Transcription → AI Extraction → Structured RFQ',
    content: `Voice RFQ workflow:
1. User records audio in Hindi/English
2. Groq Whisper API transcribes in <1 second
3. AI extracts: category, product, quantity, budget, location, timeline
4. Structured RFQ created with type='voice'
5. Suppliers notified via matching algorithm`,
    tags: ['voice', 'transcription', 'groq', 'whisper', 'rfq-creation'],
    source: 'voice-rfq',
  },
  {
    id: 'rfq-002',
    type: 'rfq_logic',
    title: 'Video RFQ Flow',
    summary: 'Upload → NVIDIA MiniMax M2.1 analysis → Structured RFQ',
    content: `Video RFQ workflow:
1. User uploads video (MP4, max 100MB)
2. NVIDIA MiniMax M2.1 model analyzes product visually
3. Extracts: title, category, specs, budget range, timeline
4. Fallback to keyword analysis if AI unavailable
5. type='video', stored with extractedInfo`,
    tags: ['video', 'ai', 'nvidia', 'minimax', 'rfq-creation'],
    source: 'video-rfq',
  },
  {
    id: 'rfq-003',
    type: 'rfq_logic',
    title: 'Quote Acceptance Flow',
    summary: 'Submit Quote → Buyer Reviews → Accept/Reject → Deal Created → Escrow',
    content: `Quote lifecycle:
1. Supplier submits quote (price, quantity, timeline, terms)
2. Buyer sees all quotes in /dashboard/quotes
3. Buyer clicks "Accept Quote" → Deal created with escrow
4. Payment locked in Bell24h escrow until delivery confirmed
5. On confirmation, payment released to supplier
6. Wallet transaction recorded in WalletTransaction table`,
    tags: ['quote', 'deal', 'escrow', 'wallet', 'rfq-lifecycle'],
    source: 'quotes-flow',
  },
  {
    id: 'rfq-004',
    type: 'rfq_logic',
    title: 'RFQ Seeding System',
    summary: 'Populates marketplace with 325 realistic RFQs across all 50 categories',
    content: `Seeding to avoid empty marketplace:
1. Admin clicks "Seed All" in /admin/seed-rfqs
2. API generates RFQs per category + subcategory
3. Titles use semantic generator: "[Subcategory] — Bulk Procurement"
4. isSeeded=true, excluded from email notifications
5. Real RFQs (isSeeded=false) trigger full outreach
6. Clear All resets seeded data without deleting real RFQs`,
    tags: ['seeding', 'demo-data', 'marketplace', 'categories'],
    source: 'seed-rfqs',
  },
  {
    id: 'rfq-005',
    type: 'rfq_logic',
    title: 'Elephant Memory Engine',
    summary: '3-layer intelligence: Episodic + Semantic + Strategic memory',
    content: `Memory system architecture:
Layer 1 - Episodic: RfqMemory, InteractionMemory, QuoteMemory tables
Layer 2 - Semantic: extractRFQMeta() keyword extraction (intent, product, priceRange)
Layer 3 - Strategic: MarketInsight table (avgPrice, successRate, demandTrend)

Store flows:
- storeRFQ() → on RFQ creation (api/rfq/create, voice-rfq/save)
- storeInteraction() → on RFQ view (rfq/[id] page)
- storeQuote() → on quote submission (supplier/quotes)
- dailyInsightsCron() → every 6h updates all MarketInsights

Rules:
- NEVER call LLM without checking memory first
- isSeeded RFQs are excluded from insights
- Memory enables: similar RFQ search, price benchmarking, demand trends`,
    tags: ['memory', 'intelligence', 'insights', 'market', 'patterns'],
    source: 'memory-engine',
  },
];

// ─── Marketing ────────────────────────────────────────────────────────────────

const marketing: KBEntry[] = [
  {
    id: 'mkt-001',
    type: 'marketing',
    title: 'One-Man Army Outreach',
    summary: 'WhatsApp outreach to 50-100 suppliers/day for new RFQ categories',
    content: `Outreach strategy:
TARGET: First 50 suppliers per category (100 total)
CHANNEL: WhatsApp + LinkedIn + Email
MESSAGE TEMPLATE:
"Hi {name}, a new verified buyer just posted an RFQ for {product} in {location} on Bell24h. View details: {link}"

PACE: 50-100 messages/day
CONVERSION TARGET: 10-15 profile claims in Week 1
METRICS: Messages Sent, Profile Claims, Active RFQs

Tool: Agent Zero orchestrates the outreach loop
Scraping: OpenClaw finds supplier contact data
Image: Nano Banana 2 generates social proof cards`,
    tags: ['whatsapp', 'outreach', 'suppliers', 'one-man-army', 'lead-gen'],
    source: 'marketing-outreach',
  },
  {
    id: 'mkt-002',
    type: 'marketing',
    title: 'Supplier Onboarding',
    summary: 'Claim company profile → GST verify → Trust Score → Start quoting',
    content: `Supplier journey:
1. Visit bell24h.com/claim-company
2. Search for company name
3. OTP verification (phone + GST)
4. Auto-fetch: GST number, CIN, address via GST API
5. Trust Score calculated (0-100)
   - Base: phone verified (+30)
   - GST verified (+20)
   - Bank added (+20)
   - Business docs (+15)
   - 3+ deals completed (+15)
6. Supplier can now receive RFQ alerts and submit quotes
7. Dashboard shows: My Quotes, Deals, Wallet, Performance`,
    tags: ['onboarding', 'kyc', 'gst', 'trust-score', 'supplier'],
    source: 'claim-company',
  },
  {
    id: 'mkt-003',
    type: 'marketing',
    title: 'Live Ticker Viral Engine',
    summary: 'Scrolling ticker shows live RFQ activity for social proof',
    content: `Live Ticker:
- Displayed at top of dashboard
- Shows: Video RFQ, Voice RFQ, Verified Supplier, Bulk Order
- Auto-scrolls every 25 seconds
- Uses animate-marquee CSS animation
- Dark mode (#1a1d27) with gold accent for verified
- Data from real RFQs and InteractionMemory

Purpose:
- Social proof for new visitors
- Makes platform appear active/busy
- Encourages first-time engagement
- Shown in screenshots/marketing materials`,
    tags: ['ticker', 'social-proof', 'viral', 'dashboard', 'live'],
    source: 'live-ticker',
  },
];

// ─── Automation ──────────────────────────────────────────────────────────────

const automation: KBEntry[] = [
  {
    id: 'auto-001',
    type: 'automation',
    title: 'Agent Zero Orchestrator',
    summary: 'Main decision engine: Memory → Knowledge → Strategy → Action',
    content: `Agent Zero decision loop:
TRIGGER: New RFQ (isSeeded=false)

STEP 1: MEMORY CHECK
- getMarketInsights(category) → avgPrice, demandTrend, conversionRate
- getSimilarRFQs(category) → last 5 similar RFQs

STEP 2: KNOWLEDGE SEARCH
- searchKnowledge("supplier outreach for " + category)
- Find relevant marketing/agent docs

STEP 3: DECIDE STRATEGY
if demandTrend === 'RISING':
  strategy = 'aggressive_outreach'  // faster, higher volume
elif conversionRate > 0.6:
  strategy = 'quality_focus'  // premium suppliers only
else:
  strategy = 'volume_push'  // more suppliers, lower effort per contact

STEP 4: EXECUTE
- Scout.findSuppliers(rfq) → top 10 suppliers
- Messenger.sendOutreach(rfq, suppliers) → WhatsApp messages
- Log KPI (rfq_id, suppliers_found, messages_sent)

RULES:
- NEVER contact same supplier twice in 7 days
- Skip isSeeded RFQs
- If budget < 10000, skip outreach (low value)
- If demandTrend === 'DECLINING', reduce outreach volume`,
    tags: ['agent-zero', 'orchestrator', 'decision', 'strategy'],
    source: 'agent-zero',
  },
  {
    id: 'auto-002',
    type: 'automation',
    title: 'Scout Agent — Supplier Finding',
    summary: 'Finds relevant suppliers by category + location using memory + scraping',
    content: `Scout agent logic:
INPUT: { category, location, budget, quantity }

STEP 1: Memory lookup
- getSimilarRFQs(category) → past winning suppliers
- getMarketInsights(category) → price range

STEP 2: Database search
- prisma.user.findMany({ where: { role: SUPPLIER, isClaimed: true })
- Filter by location proximity
- Filter by trustScore >= 40

STEP 3: External enrichment (if OpenClaw available)
- Scrape Google Maps for category suppliers in location
- Scrape IndiaMart/TradeIndia for leads
- Enrich with: phone, company, GST number

STEP 4: Rank by score
score = (
  trustScore * 0.3 +
  locationMatch * 0.25 +
  categoryMatch * 0.25 +
  priceProximity * 0.2
)

OUTPUT: top 10 suppliers with scores + contact data`,
    tags: ['scout', 'suppliers', 'scraping', 'openclaw', 'finding'],
    source: 'scout-agent',
  },
  {
    id: 'auto-003',
    type: 'automation',
    title: 'Messenger Agent — WhatsApp Outreach',
    summary: 'Generates and sends personalized WhatsApp messages to suppliers',
    content: `Messenger agent:
INPUT: { rfq, suppliers[] }

MESSAGE GENERATION:
Template: "Hi {supplier_name}, a new verified buyer on Bell24h needs {product} — {quantity} {unit}. Budget: {budget}. Timeline: {timeline}. View & quote: {link}"

Personalization by type:
- HIGH urgency: add "URGENT requirement — "
- export RFQ: add "Export quality required — "
- repeat buyer: add "Repeat order from {company}"

No-reply rules:
- If supplier contacted in last 7 days → skip
- If supplier already quoted → skip
- If trustScore < 30 → skip (low quality)

KPI Logging:
- messages_sent += 1
- log: { rfq_id, supplier_id, message_id, timestamp }
- Stored in InteractionMemory with actionType='outreach_sent'

OpenClaw integration:
- Generate social card image (Nano Banana 2) for each RFQ
- Attach image to WhatsApp message for visual impact`,
    tags: ['messenger', 'whatsapp', 'outreach', 'personalization', 'kpi'],
    source: 'messenger-agent',
  },
  {
    id: 'auto-004',
    type: 'automation',
    title: 'Daily Insights Cron',
    summary: 'Updates MarketInsight table every 6 hours from real data',
    content: `Daily insights cron (/api/cron/update-insights):
Runs: every 6 hours via Vercel Cron

For each category with RFQ history:
1. Count RFQs in last 100 (rfqMemory)
2. Count quotes (quoteMemory where status != EXPIRED)
3. Count won quotes (status = WON)

METRICS COMPUTED:
- conversionRate = quotes / rfqs
- successRate = won / quotes
- avgPrice = mean(quote prices)
- demandTrend:
  - RISING: recentRFQs > olderRFQs * 1.2
  - DECLINING: recentRFQs < olderRFQs * 0.8
  - STABLE: otherwise

DEMAND TREND formula:
recentWeek = RFQs in last 7 days
previousWeek = RFQs in 7-14 days ago
if recent > previous * 1.2 → RISING
elif recent < previous * 0.8 → DECLINING
else → STABLE

STORAGE:
Upsert into MarketInsight table
lastUpdated = now()`,
    tags: ['cron', 'insights', 'market', 'analytics', 'automation'],
    source: 'update-insights',
  },
];

// ─── Compliance ────────────────────────────────────────────────────────────

const compliance: KBEntry[] = [
  {
    id: 'comp-001',
    type: 'compliance',
    title: 'Razorpay Escrow Flow',
    summary: 'Buyer pays into Bell24h escrow → held until delivery → released to supplier',
    content: `Escrow payment flow:
1. Buyer accepts quote → Deal created
2. Buyer initiates payment → Razorpay
3. Funds held in Bell24h RazorPay escrow account
4. Status: TRANSACTION_PENDING in escrow table
5. Supplier ships goods + shares tracking
6. Buyer confirms delivery OR 7-day auto-confirm
7. Funds released from escrow → Supplier wallet
8. Transaction COMPLETED

Rules:
- Buyer refund window: 7 days after delivery
- Dispute: Admin reviews → refund or release
- Platform fee: deducted at release (configurable %)
- EscrowTransaction model: does NOT exist yet (API returns empty)`,
    tags: ['escrow', 'razorpay', 'payments', 'compliance'],
    source: 'escrow-flow',
  },
  {
    id: 'comp-002',
    type: 'compliance',
    title: 'GST Verification',
    summary: 'Auto-fetch business details from GST portal using GSTIN',
    content: `GST verification flow:
1. Supplier enters GSTIN (15-char alphanumeric)
2. Backend calls GST API: https://api.gst.gov.in/
3. Returns: legal_name, address, cin, nature_of_business
4. Auto-fills supplier profile fields
5. Trust Score +20 for GST verified suppliers
6. GSTIN stored encrypted in user.gstNumber

Rules:
- GSTIN format: 27AAAPL1234C1ZB (15 chars)
- Validate checksum (last char = check digit)
- Auto-create firm type: Proprietorship/Partnership/LLP/Pvt Ltd`,
    tags: ['gst', 'verification', 'compliance', 'supplier'],
    source: 'gst-verification',
  },
  {
    id: 'comp-003',
    type: 'compliance',
    title: 'Data Privacy — Phone/Email Masking',
    summary: 'Contact info displayed as mailto:/tel: links or partially masked',
    content: `Privacy rules:
- Phone displayed as: +91 XXXXXX1234 (last 4 digits only)
- Email displayed as: t***@company.com
- Full data only visible to: matched buyer/supplier on accepted deal
- Admin can see full data for support purposes

Implementation:
- Contact form emails use obfuscated React state (useState split)
- No plain-text emails in page source
- WhatsApp links use wa.me with encoded message
- No email scraper-friendly patterns in HTML`,
    tags: ['privacy', 'masking', 'phone', 'email', 'compliance'],
    source: 'privacy-rules',
  },
];

// ─── Onboarding ────────────────────────────────────────────────────────────

const onboarding: KBEntry[] = [
  {
    id: 'onboard-001',
    type: 'onboarding',
    title: 'Buyer Flow',
    summary: 'OTP → Profile → Post RFQ → Get Quotes → Accept Deal',
    content: `Buyer journey:
1. Visit bell24h.com → Click "Post RFQ"
2. Login with phone OTP (no password)
3. Enter: category, product, quantity, budget, timeline
4. Choose type: Voice | Video | Text
5. RFQ created → AI matching runs
6. Notifications sent to relevant suppliers
7. Quotes appear in /dashboard/quotes
8. Compare quotes → Accept best one
9. Deal created → Escrow payment
10. Receive goods → Confirm delivery
11. Funds released to supplier`,
    tags: ['buyer', 'onboarding', 'rfq', 'flow'],
    source: 'buyer-flow',
  },
  {
    id: 'onboard-002',
    type: 'onboarding',
    title: 'Supplier Flow',
    summary: 'Claim Profile → GST Verify → Browse RFQs → Submit Quote → Win Deal',
    content: `Supplier journey:
1. Visit bell24h.com/supplier/registration
2. OTP login
3. Claim company: search GSTIN or company name
4. GST + phone verification
5. Profile auto-filled from GST API
6. Browse RFQs: /supplier/browse-rfqs
7. Filter by category, location, budget
8. Click "Submit Quote" → Enter price/terms
9. If quote accepted → Deal created
10. Ship goods + update tracking
11. Payment received in wallet after delivery`,
    tags: ['supplier', 'onboarding', 'claim', 'gst', 'flow'],
    source: 'supplier-flow',
  },
];

// ─── All entries ────────────────────────────────────────────────────────────

const knowledgeBase: KBEntry[] = [
  ...rfqLogic,
  ...marketing,
  ...automation,
  ...compliance,
  ...onboarding,
];

/**
 * Search the knowledge base by query string
 * Returns entries matching any tag or containing query in title/summary/content
 */
export function searchKnowledge(query: string, limit = 5): KBEntry[] {
  const q = query.toLowerCase();
  const scored = knowledgeBase.map(entry => {
    let score = 0;
    if (entry.tags.some(t => q.includes(t) || t.includes(q))) score += 3;
    if (entry.title.toLowerCase().includes(q)) score += 2;
    if (entry.summary.toLowerCase().includes(q)) score += 1;
    if (entry.content.toLowerCase().includes(q)) score += 0.5;
    return { entry, score };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

/**
 * Get all entries of a specific type
 */
export function getKnowledgeByType(type: KBEntry['type']): KBEntry[] {
  return knowledgeBase.filter(e => e.type === type);
}

/**
 * Get relevant knowledge for a specific RFQ (by category)
 */
export function getKnowledgeForRFQ(category: string): KBEntry[] {
  const q = category.toLowerCase();
  return knowledgeBase.filter(e =>
    e.tags.some(t => q.includes(t) || t.includes(q)) ||
    e.content.toLowerCase().includes(q)
  );
}

export { knowledgeBase };
