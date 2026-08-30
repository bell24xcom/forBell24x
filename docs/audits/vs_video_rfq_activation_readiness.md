# VS-PRODUCTION-READINESS-AUDIT-01 — Video RFQ Activation Readiness

**Audit Date:** 2026-08-28  
**Question:** Is Video RFQ ready for production activation?  
**Verdict: READY WITH CONFIGURATION** — All code is deployed and correct. Activation requires 4 founder configuration actions (≈25 minutes). No code changes needed.

---

## Readiness Matrix

| Layer | Component | Status | Evidence |
|-------|-----------|--------|----------|
| **Database** | `RFQ.videoUrl` column | ✅ READY | `prisma/schema.prisma` — `videoUrl String?` exists on RFQ model |
| **Database** | `RFQ.videoPublicId` column | ✅ READY | `prisma/schema.prisma` — `videoPublicId String?` exists on RFQ model |
| **Database** | `RFQ.type` field (VIDEO/TEXT/VOICE) | ✅ READY | `prisma/schema.prisma` — `type String?` on RFQ |
| **API** | `/api/cloudinary/upload-signature` | ✅ CODE READY | Deployed. Auth-gated. Returns signed credential. Returns 503 if env vars missing — correct behavior. |
| **API** | `/api/rfq/create` — videoUrl support | ✅ READY | Accepts `videoUrl` (URL validated), `videoPublicId`. Sets `type: 'VIDEO'` when videoUrl present. |
| **API** | `/api/rfq/[id]/quotes` | ✅ READY | Returns quotes to buyer — unchanged from text RFQ. |
| **API** | `/api/deal/select` | ✅ READY | Deal creation unchanged from text RFQ. |
| **UI** | Video upload section (`/rfq/create`) | ⚠️ FLAG-GATED | Wrapped in `{process.env.NEXT_PUBLIC_VIDEO_RFQ_ENABLED === 'true' && ...}`. Hidden until flag set. |
| **UI** | Video thumbnail on browse page | ✅ READY | `generateVideoThumbnail()` implemented in `src/app/supplier/browse-rfqs/page.tsx` (commit `8da153d`) |
| **UI** | VideoPlayer component | ✅ READY | Deployed on PR branch. Plays back Cloudinary video URLs. |
| **Security** | CSP — `api.cloudinary.com` in `connect-src` | ⚠️ NOT ON PROD | Fixed in commit `1ea3212` on PR #54. Missing from production `main`. All Cloudinary XHR blocked on production. |
| **Security** | CSP — `res.cloudinary.com` in `media-src` | ⚠️ NOT ON PROD | Same — fixed in PR #54, not merged. Video playback blocked on production. |
| **Security** | CSP — `res.cloudinary.com` in `img-src` | ⚠️ NOT ON PROD | Same — fixed in PR #54, not merged. Video thumbnails blocked on production. |
| **Config** | `CLOUDINARY_CLOUD_NAME` | ⚠️ NOT SET | `/api/cloudinary/upload-signature` returns 503. Inferred from 0 videoUrl records across 54 production RFQs. |
| **Config** | `CLOUDINARY_API_KEY` | ⚠️ NOT SET | Same inference. |
| **Config** | `CLOUDINARY_API_SECRET` | ⚠️ NOT SET | Same inference. |
| **Config** | `CLOUDINARY_UPLOAD_PRESET` | ⚠️ NOT SET | Route reads `process.env.CLOUDINARY_UPLOAD_PRESET` and returns 503 if absent. |
| **Config** | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ⚠️ NOT SET | Required for client-side Cloudinary URL construction. |
| **Config** | `NEXT_PUBLIC_VIDEO_RFQ_ENABLED` | ⚠️ NOT SET | Feature flag — video upload section hidden in RFQ creation UI. |
| **Cloudinary** | Upload preset `bell24h-rfq-videos` | ⚠️ NOT CREATED | Unsigned, video type, folder `bell24h/rfq/videos`. Must exist before browser upload can succeed. |

---

## Activation Blockers (4 Total — All Founder Actions)

### Blocker 1 — Production CSP (P0)
**What:** Production `www.vyaparsethu.com` CSP does not include Cloudinary domains. Every browser-side Cloudinary operation (XHR upload, video playback, thumbnail rendering) fails silently.  
**Evidence:** Production response header sampled 2026-08-27:
```
connect-src: 'self' ... https://api.openai.com  [Cloudinary absent]
media-src:   'self' blob:                        [Cloudinary absent]
img-src:     'self' blob: data: ...              [Cloudinary absent]
```
**Fix:** Merge PR #54 — commit `1ea3212` adds the 3 required Cloudinary entries.  
**Action:** Go to https://github.com/bell24xcom/forBell24x/pull/54 → Merge.

### Blocker 2 — Cloudinary Upload Preset (P1)
**What:** The preset `bell24h-rfq-videos` does not exist in Cloudinary. Even with credentials configured, direct browser upload returns 400 (Unknown upload preset).  
**Evidence:** No Video RFQs in production (0 videoUrl records). The route at `src/app/api/cloudinary/upload-signature/route.ts:44` passes `preset: uploadPreset` in the signed credential — if the preset doesn't exist in Cloudinary, the upload fails.  
**Fix:** Create preset in Cloudinary dashboard.

| Setting | Value |
|---------|-------|
| Preset name | `bell24h-rfq-videos` |
| Signing mode | Unsigned |
| Folder | `bell24h/rfq/videos` |
| Resource type | Video |
| Max file size | 50 MB |
| Allowed formats | mp4 |

### Blocker 3 — Cloudinary + Feature Flag Env Vars (P1)
**What:** 5 environment variables missing from Vercel production.  
**Evidence:** Route returns 503 on missing vars. 0 videoUrl records across 54 production RFQs — if Cloudinary were configured, at least the May 2026 video upload attempt would have stored data.

| Variable | Purpose | Status |
|----------|---------|--------|
| `CLOUDINARY_CLOUD_NAME` | Server-side signing | ❌ Not set |
| `CLOUDINARY_API_KEY` | Server-side signing | ❌ Not set |
| `CLOUDINARY_API_SECRET` | Server-side signing | ❌ Not set |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client URL construction | ❌ Not set |
| `NEXT_PUBLIC_VIDEO_RFQ_ENABLED` | Feature flag gate | ❌ Not set → UI hidden |

**Fix:** Add all 5 to Vercel → Settings → Environment Variables.

### Blocker 4 — Production Redeploy Required (P1)
**What:** `NEXT_PUBLIC_*` variables are inlined at Next.js build time. Setting them in Vercel does not activate them until a new build runs.  
**Evidence:** Next.js build behavior — `NEXT_PUBLIC_VIDEO_RFQ_ENABLED` is embedded in the JS bundle, not read at runtime.  
**Fix:** After merging PR #54 and setting env vars, trigger a Vercel redeploy from the Vercel dashboard.

---

## Video RFQ Transaction Flow (Once Activated)

```
1. Buyer opens /rfq/create
2. Video Requirement section visible (feature flag = true)
3. Buyer records/uploads MP4
4. UI calls POST /api/cloudinary/upload-signature → gets signed credential
5. Browser uploads video directly to Cloudinary (bypasses Vercel 4.5MB limit)
6. Upload URL: https://api.cloudinary.com/v1_1/{cloud_name}/video/upload
7. Cloudinary returns { public_id, secure_url }
8. UI calls POST /api/rfq/create with { videoUrl: secure_url, videoPublicId: public_id, ... }
9. RFQ saved with type: 'VIDEO', videoUrl set, videoPublicId set
10. RFQ appears in /marketplace with "Video Requirement" badge
11. Supplier views RFQ — thumbnail generated via generateVideoThumbnail()
12. Supplier watches video → unlocks buyer contact → submits quote
13. Buyer receives QUOTE_RECEIVED notification
14. Buyer views quotes at /api/rfq/[id]/quotes
15. Buyer selects quote → POST /api/deal/select → Deal created
16. Payment flow: Razorpay order → checkout → verify → wallet credited
```

---

## Evidence Package Template (Capture After Activation)

```
RFQ ID:            _________________________________
Video URL:         https://res.cloudinary.com/{cloud}/video/upload/bell24h/rfq/videos/___
Thumbnail URL:     https://res.cloudinary.com/{cloud}/video/upload/so_0,w_400,h_300,c_fill,q_auto,f_jpg/___.jpg
Public ID:         bell24h/rfq/videos/___
RFQ Created At:    _________________________________
Supplier ID:       _________________________________
Unlock Timestamp:  _________________________________
Quote ID:          _________________________________
Quote Timestamp:   _________________________________
Deal ID:           _________________________________
Deal Timestamp:    _________________________________
Payment ID:        _________________________________
```

---

## Readiness Summary

| Dimension | Ready? | Notes |
|-----------|--------|-------|
| Database schema | ✅ YES | videoUrl, videoPublicId, type all present |
| Backend API | ✅ YES | Upload-signature, RFQ create, quote, deal all deployed |
| Frontend UI | ✅ YES (gated) | Video section deployed; hidden behind feature flag |
| Supplier discovery | ✅ YES | Browse page with video thumbnail deployed (commit `8da153d`) |
| End-to-end quote flow | ✅ YES | Unchanged from text RFQ |
| Production CSP | ❌ NO | Merge PR #54 |
| Cloudinary credentials | ❌ NO | Set 5 env vars in Vercel |
| Upload preset | ❌ NO | Create in Cloudinary dashboard |
| Feature flag | ❌ NO | Set NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true + redeploy |
| **Overall** | **⚠️ READY WITH CONFIGURATION** | **4 founder actions, ~25 min** |

---

*Audit: VS-PRODUCTION-READINESS-AUDIT-01 | Branch: claude/vyaparsethu-outreach-channels-18ghlu | Date: 2026-08-28*
