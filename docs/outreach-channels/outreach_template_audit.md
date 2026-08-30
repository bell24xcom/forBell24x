# Outreach Template Audit
**Project:** VyaparSethu  
**Date:** 2026-08-26  
**Files audited:**
- `src/data/outreachTemplates.ts` — segmented drip templates (steel/textiles/packaging)
- `src/lib/supplier-drip-engine.ts` — drip messages (day3/day7/day14)
- `src/app/api/admin/outreach/bulk-wa/route.ts` — day-1 wa.me message
- `src/app/api/admin/outreach/daily-batch/route.ts` — day-1 batch message
- `src/app/api/outreach/generate/route.ts` — RFQ-matched supplier messages
- `src/app/api/admin/send-invitations/route.ts` — email invitation

---

## Bug 1: "your business" fallback — cold and impersonal

**Location:** `bulk-wa/route.ts` line:
```ts
const companyName = (s.company && s.company.trim()) ? s.company : 'your business';
```
And the generated message:
```
Your business "your business" has a verified profile on VyaparSethu
```
When `s.company` is null or empty string, the message reads `Your business "your business"` — doubled and hollow. The outer phrase already says "your business"; the placeholder repeats it inside quotes as if it were a company name.

**Also present in:** `daily-batch/route.ts` — same logic:
```ts
const companyName = supplier.company || supplier.name || 'Your Business';
```
Renders: `Your business "Your Business"` when both `company` and `name` are null.

**Fix:**
```ts
// bulk-wa/route.ts and daily-batch/route.ts
const companyName = (s.company && s.company.trim()) ? s.company.trim() : null;

// In message template:
const intro = companyName
  ? `Your business *${companyName}* has a verified supplier profile`
  : `We've created a verified supplier profile for your business`;
```

Revised day-1 message (no-name case):
```
Namaste! 🙏

We've created a verified supplier profile for your business on VyaparSethu —
India's B2B Supplier & Buyer Network.

Verified buyers are searching for your products right now.

Claim your FREE profile in 2 minutes:
{claimLink}

— Team VyaparSethu
vyaparsethu.com
```

---

## Bug 2: Unsupported claim in email welcome template

**Location:** `src/utils/email-service.ts` — `sendWelcomeEmail`:
```html
You're now part of a community of <strong>50,000+ Indian businesses</strong>
```
**Problem:** This number is fabricated. The platform is pre-launch with <10 verified suppliers. "50,000+ businesses" is an unsupported claim that violates the brand rule: **"Never show zero metrics publicly."** The inverse violation — showing false large metrics — is equally prohibited and constitutes misleading advertising under the Consumer Protection Act 2019.

**Fix — replace with:**
```html
You're now part of VyaparSethu's founding supplier network — built for
India's verified B2B community.
```

---

## Bug 3: Unsupported claim in newsletter email

**Location:** `src/utils/email-service.ts` — `sendNewsletterEmail`:
```
🎯 New RFQs: 50+ active requests in your category
```
**Problem:** Hardcoded "50+" is not fetched from the database. When the real count is 0 or 2, this is a false statement.

**Fix — remove the metric entirely or make it conditional:**
```html
<!-- Only include if actual count > 0 from DB query -->
🎯 New Requirements: Active buyer requests in your category
```

---

## Bug 4: Broken emoji rendering risk in SMS context

**Location:** `outreachTemplates.ts` — steel-d1, textiles-d1, packaging-d1:
```
Namaste {{ownerName}} ji 🙏
```
**Problem:** The `🙏` emoji renders correctly on WhatsApp but is stripped or rendered as `?` or `[?]` on some TRAI DLT-registered SMS gateways that use 7-bit GSM encoding. If these templates are ever used via SMS (after DLT registration), the emoji will corrupt the message.

**Fix — maintain two variants:**
```ts
// WhatsApp variant (current)
body: `Namaste {{ownerName}} ji 🙏\n...`

// SMS variant (add separate set)
body: `Namaste {{ownerName}} ji,\n...`
```
Or detect channel at render time:
```ts
export function renderTemplate(
  template: OutreachTemplate,
  vars: { companyName: string; ownerName: string; category: string; claimUrl: string },
  channel: 'whatsapp' | 'sms' = 'whatsapp',
): string {
  let body = template.body
    .replace(/\{\{companyName\}\}/g, vars.companyName)
    .replace(/\{\{ownerName\}\}/g,   vars.ownerName)
    .replace(/\{\{category\}\}/g,    vars.category)
    .replace(/\{\{claimUrl\}\}/g,    vars.claimUrl);
  
  if (channel === 'sms') {
    // Strip emoji for GSM 7-bit compatibility
    body = body.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/\n+/g, ' ').trim();
  }
  return body;
}
```

---

## Bug 5: Missing personalization in drip engine messages

**Location:** `supplier-drip-engine.ts` — `DRIP_MESSAGES`:
```ts
day3: (c, l) => `Hi ${c} 👋 Reminder about your free verified supplier profile...`
```
The variable `c` is `companyName`, not the owner's first name. Messages say `Hi Sharma Steel Pvt Ltd 👋` which is grammatically awkward in a personal WhatsApp message.

**Fix:**
Pass owner first name separately. Extract from `user.name` (first token):
```ts
const ownerFirst = (s.name || '').split(' ')[0] || companyName;
```
Revised message:
```
Hi {ownerFirst} ji 👋 — a reminder about {companyName}'s free verified profile
on VyaparSethu. Buyers in your cluster are actively posting Requirements.
Claim in 2 min: {claimLink}
```

---

## Bug 6: Brand name inconsistency in email templates

**Location:** `src/lib/emailTemplates.ts`:
```
Bell24h · India's AI-Powered B2B Procurement Platform
```
And the footer constant `FOOTER_CONTENT` uses `bell24h.com` as the primary URL.

**Problem:** All user-facing copy must say VyaparSethu. "Bell24h" in transactional emails contradicts the controlled rebrand policy.

**Fix in `emailTemplates.ts`:**
```ts
const FOOTER_CONTENT = `VyaparSethu · India's B2B Trade Network<br>
Formerly Bell24h | Digitex Studio | GSTIN: 27AAAPP9753F2ZF<br>
<a href="https://vyaparsethu.com" style="color: #2563EB; text-decoration: none;">vyaparsethu.com</a>`;
```

And update `sendWelcomeEmail` header:
```html
<!-- Change: -->
<h1 style="margin: 0; font-size: 28px;">🇮🇳 VyaparSethu</h1>
<p>India's Leading AI-Powered B2B Marketplace</p>

<!-- To: -->
<h1 style="margin: 0; font-size: 28px;">VyaparSethu</h1>
<p style="color:#D4AF37;">Commerce Connections Globally</p>
```

---

## Bug 7: outreach/generate route uses "Bell24h" brand in email drafts

**Location:** `src/app/api/outreach/generate/route.ts`:
```ts
subject: `New RFQ Opportunity: ${topRFQ.title} — Bell24h`,
body: `...A buyer on Bell24h is looking for...`,
body: `— Bell24h Team\n${SITE_URL}`,
```
All three occurrences must say VyaparSethu.

**Fix:**
```ts
subject: `New Requirement Opportunity: ${topRFQ.title} — VyaparSethu`,
body: `A buyer on VyaparSethu is looking for ${topRFQ.title}...`,
body: `— VyaparSethu Team\n${SITE_URL}`,
```

---

## Bug 8: "your business" bug in outreach/generate route

**Location:** `src/app/api/outreach/generate/route.ts`:
```ts
const whatsapp = `Hi ${name},\n\nWe found your company *${s.company ?? name}* in *${category}*...`
```
When `s.company` is null, falls back to `name`. When `name` is also null (`s.name ?? s.company ?? 'there'`), the company block becomes `*there*`. Awkward.

**Fix:**
```ts
const displayName  = (s.name   || '').split(' ')[0] || 'there';
const displayCo    = s.company || s.name || 'your business';
const whatsapp = `Hi ${displayName},\n\nWe found *${displayCo}* listed under *${category}* (${city}).\n\n...`
```

---

## Corrected Template Versions (Drop-In Replacements)

### Day-1 wa.me message (bulk-wa/route.ts)

```
Namaste! 🙏

{companyLine}

Verified buyers are actively searching for {category} suppliers right now.

Claim your FREE verified profile in 2 minutes:
{claimLink}

Reply STOP to opt out permanently.
— VyaparSethu Team
```
Where `companyLine`:
- With company: `Your business *{companyName}* has a verified supplier profile on VyaparSethu — India's B2B Trade Network.`
- Without company: `We've created a verified supplier profile for your business on VyaparSethu — India's B2B Trade Network.`

### Day-3 drip message

```
{ownerFirst} ji 👋

Just checking in — {companyName}'s profile on VyaparSethu is still unclaimed.

Buyers in your area are posting Requirements this week. Your slot is reserved.

Claim free (2 min): {claimLink}

Reply STOP anytime.
```

### Day-7 drip message

```
{ownerFirst} ji — it's been a week.

Verified buyers are searching for {category} suppliers right now on VyaparSethu.
Your profile is still available for free.

{claimLink}

Reply STOP to opt out permanently.
```

### Day-14 drip message (final)

```
This is our last message.

{companyName}'s profile will be reassigned to another supplier in your category
if unclaimed this week.

VyaparSethu's Protected Payment removes bad debt risk for suppliers.
Claim free: {claimLink}

Reply STOP to never hear from us again.
```

---

## Summary of Issues Found

| # | Bug | Severity | File |
|---|-----|----------|------|
| 1 | "your business" doubled in message | High | bulk-wa, daily-batch |
| 2 | "50,000+ businesses" false metric in welcome email | High | email-service.ts |
| 3 | "50+ active requests" hardcoded in newsletter | High | email-service.ts |
| 4 | Emoji in SMS-destined templates (future risk) | Medium | outreachTemplates.ts |
| 5 | Company name used as greeting instead of owner first name | Medium | supplier-drip-engine.ts |
| 6 | "Bell24h" brand in transactional email footer | Medium | emailTemplates.ts |
| 7 | "Bell24h" brand in outreach/generate email drafts | Medium | outreach/generate/route.ts |
| 8 | "your business" / "there" fallback in generate route | Medium | outreach/generate/route.ts |
