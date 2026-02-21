# BELL24H.COM — COMPLETE PRE-LAUNCH PLAN & MEMORY
> Last Updated: 21 February 2026
> Branch: `claude/upgrade-nextjs-security-mL5SG`
> Status: 🟡 IN PROGRESS — Login fixed, building towards soft launch

---

## 🔐 COMPLETED FIXES (Do Not Redo)

| Fix | Date | Status |
|-----|------|--------|
| MSG91 IP Security → OFF (Vercel IPs were blocked) | 21 Feb 2026 | ✅ DONE |
| Neon `users.phone` column added via SQL | 21 Feb 2026 | ✅ DONE |
| Neon `users.company` + all missing columns added via SQL | 21 Feb 2026 | ✅ DONE |
| `DIRECT_URL` added to Vercel environment variables | 21 Feb 2026 | ✅ DONE |
| Full login flow verified working (User 8113 logged in) | 21 Feb 2026 | ✅ DONE |

---

## 🏗️ THE CONCEPT — WHY THIS CAN GO VIRAL

Bell24h is **India's first Voice + Video + Text B2B RFQ marketplace**.

Every competitor (IndiaMART, TradeIndia, Moglix) forces users to type requirements in English
with complex forms. This excludes 80% of MSME India — factory owners in Surat, traders in
Ludhiana, manufacturers in Coimbatore who think in Hindi, Gujarati, Tamil and use WhatsApp
voice notes for daily business.

### The Core Promise
> "Speak your requirement in 30 seconds. Get quotes from verified suppliers in hours. Pay safely."

### The Viral Hook
One 60-second video: Person speaks in Hindi → AI converts to structured RFQ → 3 suppliers
quote → Deal done. Post on Instagram Reels, YouTube Shorts, WhatsApp business groups.
**This video alone will do more than any SEO or paid campaign.**

---

## 👥 TWO USER PERSONAS

| | Buyer (Procurement Manager) | Supplier (Manufacturer/Distributor) |
|---|---|---|
| **Mindset** | "I need 500kg steel rods, fast" | "I want more orders this month" |
| **Pain** | Calls vendors for 2 weeks, no quotes | Sales team costs ₹80K/month |
| **Fear** | "Is this legit? Will suppliers respond?" | "Are there real buyers here?" |
| **WOW moment** | Seeing live RFQs getting quotes in minutes | Seeing real buyer RFQs they can bid on |
| **Action needed** | Post first RFQ | Browse RFQs + Submit quote |

**Critical insight:** Both personas need to see the OTHER side is active.
The live feed is the trust engine.

---

## 📋 COMPLETE WORK BLOCKS — PRE-LAUNCH

### BLOCK 1 — CRITICAL FIXES ⚡ (Week 1, Days 1–2)
*Must complete before any real user sees the site*

- [ ] Remove hardcoded agent passwords (`admin@bell24h.com / admin123` in `/api/agents/auth`)
- [ ] Remove all mock data from live pages:
  - [ ] `/api/products` — mockProducts array
  - [ ] `/api/suppliers` — mockSuppliers array
  - [ ] `/api/subscription` — mockUserSubscription
  - [ ] `/api/neon/suppliers` — mock fallback
- [ ] Fix text visibility / contrast on all pages (white on white, dark on dark)
- [ ] Fix mobile responsiveness — test every main page at 375px width
- [ ] Remove "Escrow coming soon" stale text from `/api/transactions/route.ts` lines 45, 72
- [ ] Hide autonomous agent page from navigation
- [ ] Add proper empty states on all main pages:
  - [ ] "Post your first RFQ" on empty buyer dashboard
  - [ ] "Browse open RFQs" on empty supplier dashboard
  - [ ] Loading skeleton on RFQ list, supplier list, dashboard stats

---

### BLOCK 2 — HOMEPAGE REBUILD 🏠 (Week 2, Days 6–10)
*The viral engine — the first thing every user sees*

#### Hero Section (Full Width)
- [ ] Headline: "Post an RFQ by Speaking. Get Quotes in Hours."
- [ ] Sub: "India's first Voice + Video B2B marketplace. 10,000+ verified suppliers."
- [ ] 3 tabs (Voice / Video / Text) with auto-playing demo (no click required)
- [ ] Live stat ticker: "🔴 LIVE: 47 RFQs posted in last hour • 12 quotes received"
- [ ] "30 seconds to post" promise visible

#### Live Activity Ticker (Full Width, scrolling)
```
🔴 LIVE: "Raj Traders, Pune — Posted Voice RFQ for 200kg Copper Wire" •
         "3 quotes received" • "ABC Metals responded" •
         "Deal: ₹4.2 lakh closed 2 hrs ago" →→→ [scrolling]
```
- [ ] Build scrolling ticker with real DB data
- [ ] Makes site feel like a live trading floor

#### 3-Column Layout
- [ ] LEFT (3/12) — Categories with live RFQ counts (Steel 342 active, etc.)
- [ ] CENTER (6/12) — Live RFQ feed cards (the heartbeat)
- [ ] RIGHT (3/12) — Post RFQ CTA + Live stats + Top responders today

#### RFQ Card Badge System (Viral shareable unit)
- [ ] 🎤 Voice = orange badge
- [ ] 📹 Video = purple badge (premium, unique)
- [ ] 🔥 HOT = when >10 quotes in <1 hour
- [ ] ⚡ URGENT = buyer needs it in <48 hours
- [ ] WhatsApp share button on every card

#### Sections to Keep (Already Built)
- ✅ AI Features Section (`AIFeaturesSection.tsx`) — keep, just restyle
- ✅ How It Works (`HowItWorks.tsx`) — keep, Buyers vs Suppliers split is correct
- ✅ Final CTA section — keep

---

### BLOCK 3 — VIDEO RFQ UI 📹 (Week 1, Days 3–5)
*Your biggest differentiator — currently a blank gray rectangle*

#### What It Should Show
```
┌──────────────────────────────────────────────┐
│  📷 VIDEO RFQ — Show the transformation      │
│                                              │
│  ┌─────────────┐    ┌──────────────────────┐ │
│  │ [Person     │ →  │ AI EXTRACTED:         │ │
│  │  holding    │    │ • Product: Steel Rods │ │
│  │  part +     │    │ • Qty: 500 kg         │ │
│  │  speaking]  │    │ • Grade: 60           │ │
│  │             │    │ • Location: Mumbai    │ │
│  └─────────────┘    │ • Urgency: 1 week     │ │
│                     └──────────────────────┘ │
│  ⚡ 3 suppliers matched automatically        │
└──────────────────────────────────────────────┘
```

#### Build Tasks
- [ ] Replace blank rectangle with animated demo (speak → transcribe → match)
- [ ] Camera integration (browser MediaRecorder API)
- [ ] AI analysis result display (product, qty, location extracted)
- [ ] Upload existing video option
- [ ] Show the TRANSFORMATION: messy human input → clean structured RFQ → supplier matches

---

### BLOCK 4 — "TRY WITHOUT LOGIN" VOICE DEMO 🎤 (Week 3, Days 11–12)
*Conversion rate booster — experience the magic before signup*

- [ ] Mic button on homepage — no login required
- [ ] AI transcription live on screen as they speak
- [ ] Fake (animated) supplier matches shown after transcription
- [ ] "Create account to post this RFQ" conversion trigger appears
- [ ] Works in Hindi + English minimum

---

### BLOCK 5 — DASHBOARD CLEANUP 📊 (Week 3, Days 13–15)

#### Buyer Dashboard
- [ ] Active RFQs list with status (ACTIVE / QUOTED / ACCEPTED / COMPLETED)
- [ ] Quote inbox — new quotes received, with supplier name + price
- [ ] Deal status tracker — visual progress bar per RFQ
- [ ] 7-day deal check notification (already built in orchestration)

#### Supplier Dashboard
- [ ] Browse open RFQs (by category they serve)
- [ ] My quotes — status of quotes submitted
- [ ] Earnings tracker
- [ ] Trust score display with breakdown (GST badge, Udyam badge, deals completed)

#### Header / Navigation
- [ ] Notification bell with unread count (already built, needs to be wired to header)
- [ ] Profile completion prompt (GST, Udyam, company name — boosts trust score)

---

### BLOCK 6 — SEO FOUNDATION 🔍 (Week 4, Days 16–17)

#### Target Keywords
**Tier 1 — Transactional (high buyer intent):**
- "industrial supplier quotation India"
- "B2B RFQ platform India"
- "find manufacturers India online"
- "voice RFQ platform India" ← UNIQUE TO BELL24H

**Tier 2 — Informational:**
- "how to find suppliers for small business India"
- "what is RFQ in business"
- "MSME procurement platform"

**Tier 3 — Comparison:**
- "IndiaMART alternative"
- "TradeIndia alternative free"

#### Technical SEO Tasks
- [ ] Page title + meta description on EVERY page (not "Bell24h" on every tab)
- [ ] `sitemap.xml` — auto-generated including all category pages
- [ ] `robots.txt` — allow all except `/api/`, `/admin/`
- [ ] Open Graph tags — for WhatsApp/Twitter card previews when shared
- [ ] Schema markup on supplier profiles (`LocalBusiness` schema)
- [ ] Category landing pages: `/categories/steel-metals`, `/categories/textiles`, etc.
- [ ] Core Web Vitals — LCP under 2.5s (watch for Neon cold starts)

---

### BLOCK 7 — FULL JOURNEY TESTING 🧪 (Week 4, Days 18–19)

**DO NOT LAUNCH until 10 real people complete the full loop without any help from you.**

#### Buyer Journey (must work perfectly on mobile)
```
Phone OTP login (10 sec)
→ Tap mic → speak requirement in Hindi/English (30 sec)
→ AI converts to RFQ → buyer reviews + confirms (20 sec)
→ WhatsApp notification: "3 suppliers quoted your requirement"
→ View quotes → Accept one → Escrow payment → deal
```

#### Supplier Journey (must work perfectly on mobile)
```
Phone OTP login
→ Browse live RFQs by category
→ WhatsApp alert: "New RFQ in your category"
→ Submit quote in 2 minutes
→ Buyer accepts → money in escrow → deliver → release payment
```

---

## 📅 LAUNCH TIMELINE

| Week | Focus | Goal |
|------|-------|------|
| **Week 1** | Block 1 (Fixes) + Block 3 (Video RFQ) | Site is safe + differentiator is visible |
| **Week 2** | Block 2 (Homepage rebuild) | Viral engine is live |
| **Week 3** | Block 4 (Voice demo) + Block 5 (Dashboard) | Full user journey works |
| **Week 4** | Block 6 (SEO) + Block 7 (Testing) + Soft launch | 50 real MSME users |
| **Week 6** | Full public launch | Viral video posted, campaigns live |

**Soft launch target: 4 weeks from 21 Feb 2026 = ~21 March 2026**
**Full viral launch: 6 weeks = ~4 April 2026**

---

## 🚀 VIRAL MECHANICS (5 Growth Engines)

### 1. WhatsApp Share on RFQ Cards
Every RFQ card has a share button. Supplier shares to their WhatsApp group:
> "Bhai, ₹15L LED RFQ in Delhi, quick submit a quote!"
→ Network effect with zero marketing spend.

### 2. Live Deal Ticker (Stock Market Feel)
```
🔴 LIVE DEALS: Cotton Yarn ₹6.2L closed • Steel Rods ₹3.1L closed •
               12 new RFQs in last 10 minutes →→→
```

### 3. Try Without Login Voice Demo
Anyone clicks mic → speaks → sees AI magic → converts to account.
Conversion rate multiplier.

### 4. The Guarantee
> "Get 5 quotes in 24 hours or free Premium membership"
Bold guarantee. Gets shared. Builds trust with skeptical MSME buyers.

### 5. RFQ Success Story Cards (Shareable)
> "Anita saved ₹2.4 lakh vs previous supplier"
Auto-generated shareable card after each completed deal.
Indian business community shares success stories heavily.

---

## 🏗️ ARCHITECTURE REFERENCE (Do Not Change These)

| Component | Location | Status |
|-----------|----------|--------|
| Database | Neon PostgreSQL (ap-southeast-1) | ✅ Live |
| ORM | Prisma 6.16.2 | ✅ Working |
| Auth | Phone OTP via MSG91 | ✅ Working |
| Email | Resend (`noreply@bell24h.com`) | ✅ Configured |
| Payments | Razorpay LIVE keys | ✅ Configured |
| Escrow | `/api/escrow` — POST/GET/PUT | ✅ Built |
| Orchestration | `/lib/orchestration.ts` | ✅ Built |
| n8n Automation | 7 workflow JSON files in `/n8n/workflows/` | ⚠️ Need import to n8n instance |
| AI/Voice | NVIDIA APIs (DeepSeek, Kimi, MiniMax) | ✅ Configured |
| SMS | MSG91 — IP Security OFF | ✅ Fixed |
| Notifications | Neon `notifications` table | ✅ Built |

---

## ⚠️ KNOWN ISSUES / TECH DEBT (Fix Before Launch)

1. **Agent auth is MOCKED** — `/api/agents/auth` has hardcoded `admin123` password
   → **Remove or replace with real DB-backed auth before ANY public launch**

2. **InsForge is dead code** — `lib/insforge.ts`, `lib/auth/insforge-auth.ts` are unused
   → Delete after launch confirmed stable

3. **n8n hardcoded fallback IP** — `165.232.187.195:5678` in `lib/n8n-trigger.ts` line 6
   → Move to `N8N_WEBHOOK_URL` env var only

4. **`users.phone` placeholder emails** — `/api/auth/otp/widget-verify` line 70
   → `ph_{phone}@bell24h.placeholder` for phone-only signups (acceptable for now)

5. **Escrow "coming soon" text** — `/api/transactions/route.ts` lines 45, 72
   → Remove this stale text (feature fully works)

6. **Rate limits** — 10 RFQs/day/buyer, 20 quotes/day/supplier
   → Review if too restrictive for launch

---

## 📱 ENVIRONMENT VARIABLES CHECKLIST (Vercel Dashboard)

| Variable | Status | Notes |
|----------|--------|-------|
| `DATABASE_URL` | ✅ Set | Pooler URL for runtime |
| `DIRECT_URL` | ✅ Set | Direct URL for migrations — added 21 Feb |
| `MSG91_AUTH_KEY` | ✅ Set | IP Security OFF on MSG91 dashboard |
| `NEXT_PUBLIC_MSG91_WIDGET_ID` | ✅ Set | Browser widget |
| `RESEND_API_KEY` | ✅ Set | Email service |
| `RAZORPAY_KEY_ID` | ✅ Set | Live keys |
| `RAZORPAY_KEY_SECRET` | ✅ Set | Live keys |
| `JWT_SECRET` | ✅ Set | |
| `NEXTAUTH_SECRET` | ✅ Set | |
| `N8N_WEBHOOK_URL` | ⚠️ Check | Should be set — currently has hardcoded fallback |
| `NVIDIA_API_KEY` | ✅ Set | Voice/AI features |
| `INSFORGE_URL` | 🗑️ Remove after launch | Dead code |
| `INSFORGE_API_KEY` | 🗑️ Remove after launch | Dead code |

---

## 📊 LAUNCH SUCCESS METRICS (How We Know It's Working)

| Metric | Target at Soft Launch | Target at Full Launch |
|--------|----------------------|----------------------|
| Registered users | 50 | 500 |
| RFQs posted | 20 | 200 |
| Quotes submitted | 60 | 800 |
| Deals completed | 5 | 50 |
| Voice RFQ % | >40% of all RFQs | >60% of all RFQs |
| Avg time to first quote | <2 hours | <45 minutes |
| Mobile users % | >70% | >80% |

---

## 🗓️ DAILY LOG (Update As Work Completes)

### 21 February 2026
- ✅ MSG91 IP Security disabled — OTP delivery unblocked
- ✅ Neon users table fully synced with Prisma schema (all columns added)
- ✅ `DIRECT_URL` added to Vercel for future migrations
- ✅ Full login flow confirmed working (User 8113 authenticated)
- ✅ Complete architecture audit completed (83 API routes mapped)
- ✅ This launch plan document created

---

*This document is the single source of truth for Bell24h pre-launch.*
*Update the daily log and check off tasks as they complete.*
*Do not start public marketing until all Block 1 items are checked.*
