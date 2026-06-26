# VyaparSethu Vision — Business Operating Platform for Indian MSMEs

**One sentence (June 2026):**

> VyaparSethu is building the Business Operating Platform for Indian MSMEs—a trusted system that combines Business Operating Memory, Procurement Intelligence, Decision Support, Verified Trade, and Protected Transactions to help businesses make better decisions throughout their entire lifecycle.

---

## Core principle

**Memory first. Decision second. Marketplace third.**

Every meaningful business action must answer:

> *What new business memory does this create, and how will that memory improve future decisions?*

---

## Platform architecture

```text
VyaparSethu Business Operating Platform
│
├── Website
│   ├── Marketplace & RFQs
│   ├── Supplier / Buyer portals
│   ├── Industry Knowledge & SEO
│   ├── Admin & SEO Cockpit
│   └── Company DNA (visualization)
│
├── Mobile App (future — daily operating interface)
│   ├── Morning Brief
│   ├── Voice / Video RFQ
│   ├── Escrow approvals
│   ├── Trade Confidence
│   ├── Business Copilot
│   └── Procurement alerts
│
├── Business Operating Memory (BOM) — core engine
│   └── BusinessLifeEvent stream (source of truth)
│
└── Business Intelligence Layer
    ├── Morning Brief
    ├── Procurement prediction
    ├── Trade Confidence Score
    ├── Supplier recommendations
    └── Cost-saving suggestions
```

**Company DNA** is a graph visualization of BOM — not the center. **Business Life Events** are the center.

---

## BOM memory modules (extensible)

| Module | Purpose |
|--------|---------|
| Identity Memory | GST, Udyam, locations |
| Business Memory | Industry, capacity, operations |
| Product Memory | Catalog, SKUs |
| Procurement Memory | RFQs, quotes, purchases |
| Supplier / Customer Memory | Relationships, behaviour |
| Trust Memory | Verification, escrow, disputes |
| Market / Economic Memory | Prices, seasonality, input costs |
| Risk Memory | Dependency, delays |
| Intent Memory | WHY behind actions |
| Decision Memory | Decision + outcome pairs |
| Timeline Memory | Full business life story |
| Communication Memory | Voice, video, WhatsApp, email |
| Knowledge Memory | 450+ category intelligence |
| Opportunity Memory | Cross-sell, export, savings |
| Predictive Memory | Patterns from own history |

Modules are configured in `src/lib/bom/modules.ts` — add without redesigning schema.

---

## What we build vs defer

### Tier 1 (now)
- Supplier onboarding (manual + field)
- SEO Cockpit + supplier/product pages
- Voice RFQ
- BOM + BusinessLifeEvent
- Morning Brief (company data only)

### Tier 2
- Video RFQ as **Visual Procurement**
- Trade Confidence Score
- Protected payments (Razorpay escrow)
- Industry Knowledge Hub

### Tier 3
- Procurement forecasting
- Invoice financing (after volume)
- Logistics integrations

### Tier 4
- ERP integrations
- AI marketing video (Remotion first)
- International trade intelligence

### Removed / deprioritized
- Blockchain positioning
- Stock market APIs for MSMEs
- Generic AI chatbot → **Business Copilot** (memory-grounded)
- Wan2GP / GPU video servers (until scale justifies)

---

## Positioning shifts (2024 → 2026)

| Was | Now |
|-----|-----|
| AI Marketplace | Business Operating Platform |
| Supplier Matching | Decision Matching (why, risk, alternatives) |
| Upload Video | Visual Procurement |
| Predictive Analytics (stocks) | Procurement Prediction (raw materials) |
| Supplier Risk | Trade Confidence Score |
| Company DNA (15 fixed layers) | BOM modules + DNA as one view |

---

## Mobile app vision

Not "website on a phone." **Business Companion** — Morning Brief, Voice/Video RFQ, escrow, alerts, document scan, factory photos, repeat-order reminders.

---

## Implementation map (codebase)

| Capability | Location |
|------------|----------|
| BusinessLifeEvent | `prisma` + `src/lib/bom/life-events.ts` |
| BOM modules | `src/lib/bom/modules.ts` |
| Projections | `src/lib/bom/projections.ts` |
| Elephant Memory | `src/lib/memory-engine.ts` |
| Company DNA graph | `src/lib/company-dna/` + `/admin/company-dna` |
| Morning Brief | `src/lib/bom/morning-brief.ts` + `/admin/morning-brief` |
| Business Genome Score | `src/lib/bom/genome-score.ts` |
| SEO / directories | `/admin/seo`, `/admin/directories/submit` |

---

## Aladdin analogy (internal)

Aladdin connects every event, position, relationship, decision, and risk. VyaparSethu aims for the same **principle** in procurement and MSME operations — not portfolio management.

---

*Last updated: June 2026*
