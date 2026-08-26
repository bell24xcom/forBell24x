# Communication Channel Audit
**Project:** VyaparSethu  
**Date:** 2026-08-26  
**Scope:** All outbound supplier and buyer communication channels  
**Context:** Meta WhatsApp Cloud API blocked — personal Facebook account restriction dated Jan 13, 2024. No further Meta configuration should be attempted.

---

## Channel Inventory

### 1. wa.me Deep Links (WhatsApp Personal Outreach)

| Attribute | Status |
|-----------|--------|
| **Current status** | ✅ **Active** — generated in multiple routes |
| **Automation status** | Semi-automated. Admin UI opens `wa.me` link with pre-composed message. Operator clicks to send. |
| **Implementation** | `bulk-wa/route.ts` generates `wa.me/91{phone}?text={encoded}` for every supplier. `daily-batch/route.ts` and `supplier-drip-engine.ts` generate the same links. `outreach/generate/route.ts` produces links for claimed suppliers vs live RFQs. |
| **Limitations** | Requires a human to open each link. Not bulk-API. Cannot run unattended. Limited to the operator's own WhatsApp account phone number as sender. No delivery receipts, no opt-out tracking, no threading. |
| **Compliance risks** | TRAI Telecom Commercial Communications regulations apply to bulk unsolicited messages. wa.me outreach without prior consent is a grey area. DND registry does not cover WhatsApp, but DPDP Act 2023 requires a consent record. Current `consent_audit_log` table is in schema but opt-in at point-of-contact is absent. |
| **Implementation effort** | **Zero** — already live. Admin opens outreach page, clicks WhatsApp icon, message pre-loaded. |

---

### 2. MSG91 Transactional SMS

| Attribute | Status |
|-----------|--------|
| **Current status** | ✅ **Active** — `msg91-service.ts` is the OTP sender. Transactional route only. |
| **Automation status** | Automated for OTP. Not yet configured for supplier outreach messages. |
| **Implementation** | `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID` env vars. OTP API at `control.msg91.com/api/v5/otp`. Transactional route = 4. |
| **Limitations** | MSG91 transactional route is OTP/alert only — cannot be used for promotional content. Promotional SMS requires a separate TRAI DLT-registered sender ID and template. MSG91 does support promotional routes but requires DLT registration under TRAI. |
| **Compliance risks** | High if promotional SMS sent on transactional route. DLT violations carry ₹10 lakh fines. Opt-out / DND compliance mandatory. |
| **Implementation effort** | **Medium** — need: (1) DLT registration on MSG91, (2) new sender ID approved for promotional, (3) template approval, (4) new API route for outreach SMS separate from OTP. Existing phone data is already in DB. |

---

### 3. Transactional Email (SMTP via Nodemailer / Brevo)

| Attribute | Status |
|-----------|--------|
| **Current status** | ✅ **Active** — `lib/email.ts` uses nodemailer with `SMTP_HOST/USER/PASS`. Email-health admin route checks SPF/DKIM/DMARC for `bell24h.com` via **Brevo** (checks `brevo1._domainkey.bell24h.com`). |
| **Automation status** | Automated for: quote-received, quote-accepted, deal-complete, order-confirmation, weekly-digest (cron), churn-check (cron), invitation emails. |
| **Implementation** | `lib/email.ts` + `lib/emailTemplates.ts`. Invitation route `admin/send-invitations` sends claim links to unclaimed suppliers who have an email. |
| **Limitations** | Phone-only registrations get `ph_{phone}@bell24h.placeholder` — guard exists in `email-service.ts` to skip these. Many scraped/imported suppliers may not have real emails. SMTP fallback is localhost:1025 if env vars absent. `RESEND_API_KEY` referenced in diagnostics as optional — Resend client not currently integrated, Brevo SMTP is the actual sender. |
| **Compliance risks** | Low for transactional (quote/deal/invite). DPDP consent required for marketing emails. Unsubscribe link must be present — current newsletter template has `unsubscribe@bell24h.com` mailto only, not a one-click unsubscribe (RFC 8058 compliance gap). |
| **Implementation effort** | **Low** — sending infrastructure is live. Gap: confirm Brevo SMTP credentials are set in Vercel env. |

---

### 4. In-App / Dashboard Notifications

| Attribute | Status |
|-----------|--------|
| **Current status** | ✅ **Active** — `Notification` table in Prisma schema. `GET /api/notifications` and `PUT /api/notifications` (mark-read) are live. |
| **Automation status** | Partially automated — notifications table exists, read/update API works. No evidence of automated notification creation in quote or deal routes (those trigger emails only). |
| **Implementation** | `prisma.notification.findMany` filtered by userId. Browser polling or refresh required — no WebSocket/SSE push. |
| **Limitations** | Supplier must be logged in and dashboard open to see notifications. No push to mobile. No automatic creation on RFQ match. |
| **Compliance risks** | None — internal platform. |
| **Implementation effort** | **Low to Medium** — notification rows can be created from any server-side event. Extend quote-received and rfq-match routes to also create a `Notification` row. |

---

### 5. MSG91 WhatsApp Business API (via MSG91 WABA intermediary)

| Attribute | Status |
|-----------|--------|
| **Current status** | ⚠️ **Configured but blocked** — `MSG91_WA_AUTH_KEY`, `MSG91_WA_PHONE`, `MSG91_WA_TEMPLATE` env vars in `.env.example`. `bulk-wa/route.ts` attempts `api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/` when all three are set. |
| **Automation status** | Code is ready. API calls will fail because the underlying Meta WABA is connected to the restricted Facebook account. |
| **Implementation** | `bulk-wa/route.ts` → MSG91 WABA endpoint → Meta Cloud API (blocked). |
| **Limitations** | Meta account restriction blocks template approval and message sending. This is an **external dependency**, not an engineering problem. |
| **Compliance risks** | N/A — non-functional. |
| **Implementation effort** | **External dependency only** — requires Meta support resolution. |

---

### 6. Meta WhatsApp Cloud API (Direct)

| Attribute | Status |
|-----------|--------|
| **Current status** | ❌ **Blocked** — `WhatsAppService.ts` (in `src/services/whatsapp/`) targets `graph.facebook.com/v17.0/`. |
| **Automation status** | Code exists but unreachable. |
| **Compliance risks** | N/A — non-functional. |
| **Implementation effort** | **External dependency** — moved to watchlist. No engineering action. |

---

### 7. Bolna.ai Voice Calling

| Attribute | Status |
|-----------|--------|
| **Current status** | 🔲 **Configured in env template only** — `BOLNA_API_KEY` and `BOLNA_AGENT_ID` listed in CLAUDE.md and `.env.example`. Route at `POST /api/trigger-voice-agent` exists. |
| **Automation status** | Env vars present in template. Whether actual Bolna credentials are configured in Vercel: unknown from codebase alone. |
| **Implementation** | `src/app/api/trigger-voice-agent/route.ts` — triggers the "Sethu" voice persona on Bolna.ai. |
| **Limitations** | Voice calls to unclaimed suppliers require consent under TRAI. Calling without a DLT-registered commercial calling entity is a violation. Bolna quality for Hindi outreach: untested at production scale. |
| **Compliance risks** | High — voice calls to businesses without opt-in may violate TRAI Commercial Communications regulations. Use for follow-up to warm leads only (those who responded to WhatsApp/email). |
| **Implementation effort** | **Low if credentials are set** — route already exists. Need to confirm Bolna API key is active and agent is scripted. |

---

### 8. Website / Landing Page (Organic / SEO)

| Attribute | Status |
|-----------|--------|
| **Current status** | ✅ **Active** — vyaparsethu.com and bell24h.com. `/industrial-cluster/[slug]` and `/product-intelligence/[slug]` SEO routes live. |
| **Automation status** | Automated via Next.js SSG. Newsletter subscribe route exists at `/api/newsletter/subscribe`. |
| **Limitations** | Supplier discovery through SEO is slow (3–6 month ramp). Contact form at `/api/contact` is inbound only. |
| **Compliance risks** | Low. Newsletter subscribe must confirm DPDP consent at point of subscribe. |
| **Implementation effort** | **Zero** — already live. Optimise for supplier-intent keywords. |

---

## Summary Matrix

| Channel | Works Today | Automated | Compliance Risk | Effort to Improve |
|---------|-------------|-----------|-----------------|-------------------|
| wa.me personal outreach | ✅ Yes | Semi (operator-click) | Medium | Zero |
| MSG91 Transactional SMS | ✅ Yes (OTP only) | Yes (OTP) | High if misused | Medium (DLT registration) |
| Email via Brevo SMTP | ✅ Yes | Yes (transactional) | Low | Low (verify env vars) |
| In-app Dashboard Notifications | ✅ Yes | Partial | None | Low |
| MSG91 WABA | ❌ Blocked (Meta) | Code ready | N/A | External dependency |
| Meta Cloud API direct | ❌ Blocked | Code ready | N/A | External dependency |
| Bolna Voice | 🔲 Unknown | Route exists | High (TRAI) | Low if credentialed |
| Website / SEO inbound | ✅ Yes | Yes | Low | Zero |

---

## Recommended Immediate Channel Stack (No Meta Dependency)

1. **wa.me links** — primary day-1 outreach. Founder-sent, personal tone.  
2. **Email (Brevo SMTP)** — automated claim invitations for suppliers with real emails.  
3. **In-app notifications** — auto-create on RFQ match for claimed suppliers.  
4. **Voice (Bolna)** — day-3 follow-up for warm leads only, if Bolna key is active.  
5. **MSG91 Promotional SMS** — after DLT registration, for unresponsive contacts at day-7.
