# VS-PRODUCTION-READINESS-AUDIT-01 — First Transaction Gap Analysis

**Audit Date:** 2026-08-28  
**Question:** What prevents the first real buyer and first real supplier from completing a real transaction today?  
**Answer:** Two blockers for a text-RFQ transaction. Five blockers for a Video RFQ transaction.

---

## First Transaction Flow — Complete Sequence

```
Buyer                              Platform                           Supplier
  │                                    │                                  │
  │── POST /api/auth/otp/send ────────►│                                  │
  │◄─ { devOtp } (PILOT mode) ─────────│                                  │
  │── POST /api/auth/otp/verify ───────►│                                  │
  │◄─ { token, user } ─────────────────│                                  │
  │                                    │                                  │
  │── POST /api/rfq/create ────────────►│  Orchestration fires:            │
  │   { title, category, quantity,     │  ├─ supplier matching             │
  │     budget, location, urgency }    │  ├─ notifications                 │
  │◄─ { rfq.id, rfq.status: OPEN } ───│  └─ n8n webhook                  │
  │                                    │                                  │
  │                                    │◄─── GET /api/rfq/list ───────────│
  │                                    │──── { rfqs: [...] } ────────────►│
  │                                    │                                  │
  │                                    │◄─── POST /api/leads/unlock ──────│
  │                                    │     { leadId: rfq.id }           │
  │                                    │── check UserCredits >= 1         │
  │                                    │── atomic: credits--, LeadSupplier│
  │                                    │──── { buyerName, buyerPhone } ──►│
  │                                    │                                  │
  │                                    │◄─── POST /api/quote ─────────────│
  │                                    │     { rfqId, price, quantity }   │
  │                                    │──── { quote.id, status: PENDING }►│
  │                                    │                                  │
  │◄─── Notification: QUOTE_RECEIVED ─│                                  │
  │                                    │                                  │
  │── GET /api/rfq/[id]/quotes ───────►│                                  │
  │◄─ { quotes: [{ supplier, price }]} │                                  │
  │                                    │                                  │
  │── POST /api/deal/select ──────────►│                                  │
  │   { quoteId }                      │── atomic: Deal ACTIVE,           │
  │                                    │   Quote → ACCEPTED,              │
  │                                    │   RFQ → ACCEPTED                 │
  │◄─ { deal.id, status: ACTIVE } ────│                                  │
  │                                    │──── Email: QuoteAccepted ────────►│
  │                                    │                                  │
  │── POST /api/payment/create-order ─►│── Razorpay: createOrder()        │
  │◄─ { razorpay_order_id, amount } ──│                                  │
  │── [Razorpay checkout UI] ─────────►│                                  │
  │◄─ { razorpay_payment_id, sig } ───│                                  │
  │── POST /api/payment/verify ───────►│── HMAC-SHA256 verify             │
  │                                    │── Wallet: balance += amount      │
  │◄─ { success: true } ──────────────│                                  │
  │                                    │                                  │
  │                                    │── /api/admin/transaction-evidence│
  │                                    │   captures full journey          │
```

---

## Gap Analysis — Text RFQ Transaction (Today)

| Gap # | Gap | Severity | Evidence | Founder Action |
|-------|-----|----------|----------|----------------|
| G1 | Supplier has no unlock credits | **P0** | New suppliers get 3 onboarding credits on registration (auto-granted in `/api/auth/otp/verify:105-119`). But if supplier pre-dates this code change, they may have 0 credits. Founder must verify or grant via `/api/admin/credits`. | `POST /api/admin/credits { action: "grant", userId, amount: 5, reason: "pilot launch" }` |
| G2 | No confirmed deal in production | **P1** | `totalDeals: 0` from transaction-evidence. The flow is code-complete but has never produced a real non-seeded deal. First execution risk: unknown environment-specific issues. | Execute the flow manually as both buyer and supplier (test accounts) |

**Conclusion for Text RFQ:** All 20 capabilities are deployed. The only gaps are operational (credit provisioning, and the first execution has never happened). A real text RFQ transaction is **executable today** if a supplier has credits.

---

## Gap Analysis — Video RFQ Transaction (Today)

| Gap # | Gap | Severity | Evidence | Founder Action |
|-------|-----|----------|----------|----------------|
| G3 | Production CSP blocks Cloudinary | **P0** | Production `content-security-policy` header (sampled 2026-08-27) missing `api.cloudinary.com` from `connect-src`, `res.cloudinary.com` from `media-src` and `img-src`. PR #54 commit `1ea3212` fixes this but is NOT merged. All browser-side video upload and playback silently fail. | Merge PR #54 → main |
| G4 | Cloudinary server env vars missing | **P1** | `/api/cloudinary/upload-signature:33-38` returns HTTP 503 if `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, or `CLOUDINARY_UPLOAD_PRESET` not set. Inferred from 0 `videoUrl` records across 54 RFQs. | Add to Vercel: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| G5 | Upload preset does not exist | **P1** | The route hardcodes folder `bell24h/rfq/videos`. The preset `bell24h-rfq-videos` (unsigned, video type) does not yet exist in Cloudinary dashboard. Without it, direct browser upload returns 400. | Create preset in Cloudinary dashboard: name=`bell24h-rfq-videos`, mode=unsigned, folder=`bell24h/rfq/videos` |
| G6 | Feature flag not active | **P1** | `src/app/rfq/create/page.tsx` wraps video upload section in `{process.env.NEXT_PUBLIC_VIDEO_RFQ_ENABLED === 'true' && ...}`. Env var not set → section invisible. `NEXT_PUBLIC_*` inlined at build time → requires Vercel redeploy after setting. | Set `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true` in Vercel → trigger redeploy |
| G7 | No Video RFQ evidence exists | **INFO** | 0 records with `videoUrl` in production DB. No supplier has ever viewed a Video RFQ. Not a code gap — awaits G3–G6 resolution. | N/A — resolves automatically after G3–G6 |

---

## Founder Action Sequence (Ordered by Dependency)

| Order | Action | Dependency | Est. Time |
|-------|--------|-----------|-----------|
| 1 | Merge PR #54 to `main` | None (do first — CSP fix must precede all Cloudinary ops) | 5 min |
| 2 | Create Cloudinary upload preset `bell24h-rfq-videos` (unsigned, video, folder `bell24h/rfq/videos`) | Cloudinary account access | 10 min |
| 3 | Set Vercel env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true` | Cloudinary dashboard API keys | 10 min |
| 4 | Trigger Vercel production redeploy (after PR #54 merge + env vars set) | Actions 1+3 | 5 min |
| 5 | Verify supplier has credits (`GET /api/admin/credits?userId=<supplierId>`) and grant if 0 | Supplier account created | 2 min |
| 6 | Execute first transaction: buyer creates Video RFQ → supplier unlocks + quotes → buyer selects → payment | Actions 1–5 complete | 30 min |

**Total estimated time to first real Video RFQ transaction: ~62 minutes from a cold start.**

---

## What Is NOT a Gap (Already Working)

- OTP authentication (send + verify)
- User auto-creation with onboarding credits
- Text RFQ creation, listing, filtering
- Lead unlock with credit deduction (atomic, audited)
- Quote submission with duplicate guard
- Quote comparison (buyer views all quotes on their RFQ)
- Deal creation (quote selection)
- Wallet escrow attempt (non-blocking)
- Razorpay order creation + signature verification
- Notifications (schema + route deployed)
- Transaction evidence API (full journey logging)
- Admin credit management (grant/deduct)
- BOM life event recording (non-blocking)

---

*Audit: VS-PRODUCTION-READINESS-AUDIT-01 | Branch: claude/vyaparsethu-outreach-channels-18ghlu | Date: 2026-08-28*
