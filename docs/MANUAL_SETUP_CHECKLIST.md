# Manual setup checklist (your side)

Code is on GitHub `main`. These steps require your accounts — not automatable from the repo.

---

## 1. Neon database (required for BOM + DNA)

Run migrations on your Neon project:

```bash
npm run db:migrate
```

Or in **Neon SQL Editor**, run in order:

1. `prisma/migrations/0003_company_dna/migration.sql`
2. `prisma/migrations/0004_business_life_events/migration.sql`

Without this, Company DNA and Business Life Events will fail silently in production.

---

## 2. Vercel environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon pooled connection |
| `DIRECT_URL` | Neon direct (migrations) |
| `GROQ_API_KEY` | Voice RFQ, Morning Brief, AI analyze |
| `GSC_SERVICE_ACCOUNT_JSON` | SEO Cockpit live GSC sync |
| `GSC_SITE_URL` | `sc-domain:vyaparsethu.com` |
| `PYTHON_EXPLAINER_URL` | `https://vyaparsethu-ai.onrender.com` |
| `NEXT_PUBLIC_GA_ID` | Analytics |
| `CRON_SECRET` | Daily cron jobs |
| `RAZORPAY_*` | Payments / escrow (when live) |

Redeploy after adding vars.

---

## 3. SEO backlinks (manual, ~1–2 hours each)

| Platform | Correct URL | Status |
|----------|-------------|--------|
| **G2** | https://www.g2.com/products/new | ⚠️ `sell.g2.com/free-listing` is **404** — use link above |
| **Crunchbase** | https://www.crunchbase.com/add-new-organization | Guide: `/admin/directories/submit?guide=crunchbase` |
| **AlternativeTo** | https://alternativeto.net/software/add | List as IndiaMART alternative |
| **Startup India** | startupindia.gov.in | DPIIT if applicable |

Copy-paste text: `/admin/directories/submit`

---

## 4. Google Search Console

1. Add service account email as **Owner** in GSC
2. Paste JSON into `GSC_SERVICE_ACCOUNT_JSON` on Vercel
3. Request indexing: `/how-payment-works`, `/how-verification-works`

---

## 5. Ubersuggest trial

Cancel before day 8. Replacements are in SEO Cockpit (no paid API).

---

## 6. Meta / WhatsApp

Wait for **Business verification** to complete before WABA messaging goes live.

---

## 7. Real suppliers (highest priority)

Memory is empty until real companies:

1. Onboard 10–20 suppliers manually
2. Complete profile: GST, categories, description, **products**
3. `/admin/company-dna` → Sync from DB
4. `/admin/morning-brief` → preview brief

---

## 8. Render.com (SHAP/LIME)

Service: `https://vyaparsethu-ai.onrender.com` — set `PYTHON_EXPLAINER_URL` on Vercel. Free tier may sleep; first request ~30s.

---

## 9. After deploy — quick test

| URL | Expect |
|-----|--------|
| `/admin/company-dna` | Seed Digitex demo → graph |
| `/admin/morning-brief` | Brief for a supplier with events |
| `/admin/seo/supplier-profiles` | Supplier SEO inventory |
| `/admin/seo/search-console` | GSC sync (if JSON set) |

---

*Updated June 2026*
