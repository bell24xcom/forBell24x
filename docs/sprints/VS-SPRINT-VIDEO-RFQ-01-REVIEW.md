# VS-SPRINT-VIDEO-RFQ-01-REVIEW
## Design Document Certification Review

**Date:** 2026-08-27  
**Mode:** READ ONLY — review only. No code changes. No commits.  
**Reviewer:** Claude Code (automated)  
**Subject:** `docs/sprints/VS-SPRINT-VIDEO-RFQ-01-DESIGN.md`  
**Verdict:** ⚠️ CONDITIONAL PASS — 4 corrections required before implementation begins

---

## Summary

The design document is substantially correct in its architectural diagnosis. The two-path upload model, the Vercel 4.5MB cap risk, the feature flag gate, and the component audit are all accurate. However, the document contains **3 factual errors** (one about thumbnail generation, one about file format, one about which config file is primary) and **2 silent production risks** that would cause the MVP to fail at runtime even after Cloudinary env vars are set.

These corrections do not require a redesign. They change implementation details, not architecture.

---

## Section 1 — Upload Architecture: CONFIRMED CORRECT

The design document's two-path description is accurate.

**Path 1 (Web multipart)** — verified in `VideoRFQ.tsx:89-129`:
```typescript
const formData = new FormData();
formData.append('video', recordedBlob, 'video-rfq.webm');
// POSTs directly to /api/video-rfq as multipart
const res = await fetch('/api/video-rfq', { method: 'POST', body: formData });
```

**Path 2 (Mobile/direct-to-Cloudinary)** — verified in `video-rfq/route.ts:37-42`:
```typescript
const isJsonRequest = contentType.includes('application/json');
// Mobile uploads to Cloudinary, passes videoUrl only
```

**Verified facts:**
- ✅ Vercel 4.5MB body cap affects web path
- ✅ Groq 25MB guard exists at `video-rfq/route.ts:101-109`
- ✅ `isOwnCloudinaryUrl()` security guard exists at `video-rfq/route.ts:19-31`
- ✅ Feature flag at `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=false` confirmed in `.env.example`
- ✅ `RFQ.type = 'VIDEO'` set in `video-rfq/route.ts:263`
- ✅ `videoUrl` and `videoPublicId` saved in same route at `video-rfq/route.ts:264-265`

---

## Section 2 — Storage Provider: CORRECTION REQUIRED

### Error 2.1 — Three Cloudinary files exist, not one

The design document repeatedly refers to `src/lib/cloudinary-server.ts` as the primary config file. **This is inaccurate.**

Three Cloudinary library files exist:

| File | Used by | Has fake credential fallbacks? |
|------|---------|-------------------------------|
| `src/lib/cloudinary.ts` | `upload-signature/route.ts` (via `@/src/lib/cloudinary`) | ❌ No — api_key/secret left undefined if unset |
| `src/lib/cloudinary-server.ts` | `supplier/upload-image/route.ts` | ✅ YES — dangerous |
| `src/lib/cloudinary-client.ts` | (not audited this session) | Unknown |

The `upload-signature` route — which is the critical path for direct-to-Cloudinary uploads — imports from `cloudinary.ts`, not `cloudinary-server.ts`. The design document described `cloudinary-server.ts` as the relevant file throughout sections 1.1, 1.2, and 12.1.

**New risk identified:** `cloudinary-server.ts` configures the Cloudinary SDK with fallback hardcoded fake credentials:
```typescript
// cloudinary-server.ts lines 8-9
api_key: process.env.CLOUDINARY_API_KEY || 'development-key',
api_secret: process.env.CLOUDINARY_API_SECRET || 'development-secret',
```

If `supplier/upload-image/route.ts` (which imports from `cloudinary-server.ts`) reaches the `uploadToCloudinary()` function without a prior `isCloudinaryConfigured()` check, it will attempt a real Cloudinary API call with the string `'development-key'` as credentials — producing a Cloudinary 401 error rather than a clean "not configured" message.

**`isCloudinaryConfigured()` in both files correctly checks env vars** (not the SDK config values), so any route that calls `isCloudinaryConfigured()` first is safe. Verify that `supplier/upload-image/route.ts` does this before implementation begins.

### Confirmed: Cloudinary not configured in production — CORRECT

`isCloudinaryConfigured()` checks three env vars:
```typescript
!!(CLOUDINARY_CLOUD_NAME || NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
```

All three are absent on Vercel → `isCloudinaryConfigured()` returns `false`. The design document's production status is accurate.

---

## Section 3 — Missing From Design: Thumbnail Generation Already Exists

### Error 3.1 — "Thumbnail generation does NOT exist" is false

Design document Section 1 states:
> **What does NOT yet exist:**  
> - Video thumbnail generation pipeline

**This is incorrect.** `src/lib/cloudinary.ts` lines 208-214 contains:

```typescript
export const generateVideoThumbnail = (publicId: string): string => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [{ width: 300, height: 200, crop: 'fill' }, { quality: 'auto' }],
  });
};
```

Thumbnail generation from a Cloudinary `publicId` is a single function call that already exists. The design document's MVP list (Section 12.2) explicitly excluded thumbnails. With this correction, thumbnails in feed cards are implementable **within the MVP** — it is not a Phase 3 feature.

**Impact on MVP scope:** The MVP "Video RFQ badge in feed card" step (Section 12.1 Step 5) can include a thumbnail using `generateVideoThumbnail(rfq.videoPublicId)` at no additional implementation cost. This should be included in VS-SPRINT-VIDEO-RFQ-02.

---

## Section 4 — File Format: CORRECTION REQUIRED

### Error 4.1 — "MP4-only" is wrong for web browser recording

Design document Section 7.1 and Section 12 recommend:
> **Allowed formats: mp4, webm, mov**  
> MVP scope: "MP4 only"

The recommended MVP format restriction is incorrect. **Browser recording produces webm, not mp4.**

From `VideoRFQ.tsx:51`:
```typescript
const blob = new Blob(chunksRef.current, { type: 'video/webm' });
```

`MediaRecorder` in Chrome/Firefox/Edge produces `video/webm`. Safari produces `video/mp4`. An MP4-only restriction would break Chrome/Firefox — the vast majority of web users.

**Correct MVP format policy:**
- **Browser recording:** webm (produced by MediaRecorder on Chrome/Firefox/Edge)
- **File upload:** mp4 + webm + mov (reasonable coverage)
- **After Cloudinary transcoding:** Cloudinary `PRODUCT_VIDEOS` config auto-converts to mp4 for delivery

The user records in webm; Cloudinary delivers mp4. The format restriction at input must allow webm.

**No change to MVP scope — change is to the allowed-formats list only.**

---

## Section 5 — Hidden Risk: Vercel Function Timeout

### Risk 5.1 — The URL path does NOT escape the timeout problem

Design document Section 11 risk matrix states:
> **Large video causes Vercel function timeout (10s default)** — MEDIUM probability  
> Mitigation: "Upload direct-to-Cloudinary; only pass URL to API. Already implemented for mobile."

**This mitigation is incomplete.** The Vercel function timeout applies to the entire `/api/video-rfq` execution, including the Groq API calls — not just the file upload. Even when the video URL path is used:

1. Groq Whisper fetches the video URL and runs transcription: **5–30 seconds** for a 2-minute video
2. Groq Llama 3.1 70B runs field extraction: **2–10 seconds**
3. Prisma DB write: ~1 second

**Total: 8–41 seconds for a typical video**

Vercel Hobby plan: **10-second default timeout** for serverless functions.  
Vercel Pro plan: **60-second maximum** for serverless functions.

**Result:** Even with the direct-to-Cloudinary upload (which saves the bytes transfer), the Groq transcription step will timeout on Hobby for any video longer than ~60 seconds.

**Severity: HIGH** — This is a production blocker, not a medium risk.

**Mitigation options (not implementing now — for implementation sprint):**
1. Upgrade Vercel plan to Pro before enabling video (changes timeout to 60s)
2. Set `export const maxDuration = 60;` at the top of the video-rfq route file (Vercel Pro feature)
3. Decouple transcription: return `rfqId` immediately, run transcription async via background job (requires a queue or background route)

The simplest path: Vercel Pro + `maxDuration = 60`. Cost: ~$20/month.

---

## Section 6 — Hidden Risk: Auth Inconsistency in Guest Flow

### Risk 6.1 — Migrating web path to direct-to-Cloudinary breaks guest RFQs

Design document Section 12.1 Step 2 recommends:
> "Modify VideoRFQ.tsx to use POST /api/cloudinary/upload-signature → direct upload → then POST URL to /api/video-rfq"

**What the design document missed:** The current web multipart path (`VideoRFQ.tsx → /api/video-rfq` as blob) works **without authentication**. From `video-rfq/route.ts:237-241`:
```typescript
const token = request.cookies.get('auth-token')?.value ||
  request.headers.get('authorization')?.replace('Bearer ', '');
const authPayload = token ? verifyToken(token) : null;
const userId = authPayload?.userId ?? null;  // nullable — no auth required
```

The VideoRFQ success screen at `VideoRFQ.tsx:229-237` shows:
```tsx
<span>Try without login:</span> We'll find matching suppliers in the next few minutes.
```

Guest video RFQs are an intentional feature — a buyer can record and submit a requirement without creating an account.

**But `/api/cloudinary/upload-signature` is strictly auth-gated** (`upload-signature/route.ts:21-30`):
```typescript
if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
```

**Impact:** Migrating the web path to direct-to-Cloudinary (as the design doc recommends) would require a JWT for every video upload. Guest video RFQs would break.

**Decision required (founder):** 
- Option A: Keep the multipart path for guests (stays under Vercel 4.5MB; guest RFQs limited to ~45 seconds of recording)
- Option B: Migrate to direct-upload and require login before video recording (removes guest capability; simplifies auth)
- Option C: Create an unauthenticated upload-signature endpoint with tighter rate limiting (introduces abuse risk)

**Recommendation:** Option B — require login for video RFQs. Rationale: a buyer recording a video requirement is a high-intent action; requiring login before the video step is acceptable UX and prevents storage abuse. The text-based guest flow still works without auth.

---

## Section 7 — Minor Findings

### 7.1 — The 25MB Groq guard is dead code in web production

`video-rfq/route.ts:101-109` checks `videoBuffer.length > 25MB` and returns 413. But on Vercel Hobby, the body cap is 4.5MB — requests over 4.5MB are rejected by Vercel infrastructure before the function code runs. The 25MB guard is unreachable in production for the web path. It only matters in local development.

Not a bug. No fix needed. Note for implementation sprint: add a **client-side guard** at 4.5MB for the current web path to give users a clear error instead of a Vercel 413 with no body.

### 7.2 — No `RFQ_VIDEOS` entry in `UPLOAD_CONFIGS`

`cloudinary.ts` has 7 upload configs (`PRODUCT_IMAGES`, `PRODUCT_VIDEOS`, `DOCUMENTS`, etc.) but no `RFQ_VIDEOS`. The `upload-signature` endpoint hardcodes `folder: 'bell24h/rfq/videos'` directly rather than referencing a config key. This means `validateFileType()` cannot be used for video RFQ uploads — there's no config entry to validate against.

**Risk level: LOW** — the upload-signature endpoint validates Cloudinary credentials exist but not file type. Cloudinary itself enforces the allowed formats configured in the upload preset on the Cloudinary dashboard. If the preset is correctly configured, file validation is handled at the storage layer.

For the implementation sprint: add `RFQ_VIDEOS` to `UPLOAD_CONFIGS` and use it in the upload-signature endpoint for consistency.

### 7.3 — `CLOUDINARY_UPLOAD_PRESET` must match Cloudinary dashboard preset

The `upload-signature` endpoint uses `process.env.CLOUDINARY_UPLOAD_PRESET` as the preset name. If this env var doesn't match an actual preset configured in the Cloudinary dashboard, all signed upload attempts will fail with a Cloudinary error.

Before enabling video: create an upload preset named to match `CLOUDINARY_UPLOAD_PRESET` in the Cloudinary dashboard with:
- `resource_type: video`
- `allowed_formats: mp4,webm,mov`
- `max_file_size: 52428800` (50MB)
- `folder: bell24h/rfq/videos`

This is operational setup, not code. The design document did not include this step.

### 7.4 — VideoPlayer is 147 lines, not "120 lines"

Minor: design document Section 5.2 says "The existing component is 120 lines." Actual count: 147 lines. Inconsequential.

---

## MVP Evaluation: Four Founder Questions

### Q1: Is 1 video per RFQ the correct MVP?

**YES — and it's the only schema option.**

`RFQ.videoUrl` and `RFQ.videoPublicId` are single nullable string fields. The schema enforces 1 video per RFQ without modification. Multi-video support would require a separate `RFQVideo` relation table — a schema migration, out of MVP scope.

### Q2: Is MP4-only the correct MVP format?

**NO — webm must be included.**

Browser recording (`MediaRecorder`) produces webm on Chrome/Firefox/Edge. MP4-only at input would break 90%+ of web users. Correct MVP input formats: **webm + mp4 + mov**. Cloudinary delivers all as mp4 via transcoding.

### Q3: Should supplier profile videos launch in MVP or Phase 2?

**Phase 2 — correct.**

No schema fields, no upload route, no UI, no approval queue. Everything is missing. Adding supplier videos to MVP would at minimum require a schema migration (new nullable JSON field on User or new relation table), a new API route, and a new dashboard section. This is a full sprint of work. Phase 2 is right.

### Q4: Should RFQ videos launch before supplier videos?

**YES — correct.**

RFQ video infrastructure is ~90% complete (component, backend pipeline, schema, player all exist). Supplier videos are 0% complete. Launch RFQ videos first, then supplier videos once RFQ videos prove engagement value.

---

## Recommended Implementation Order for VS-SPRINT-VIDEO-RFQ-02

Revised from the design document, incorporating corrections above:

### Pre-Sprint Operational Steps (Founder — no code)

1. **Upgrade Vercel to Pro** — required for 60-second function timeout; $20/month
2. **Create Cloudinary upload preset** — in Cloudinary dashboard: name it, set resource_type=video, max 50MB, allow mp4/webm/mov, folder=bell24h/rfq/videos
3. **Set 5 Vercel env vars:**
   - `CLOUDINARY_CLOUD_NAME=<cloud name from dashboard>`
   - `CLOUDINARY_API_KEY=<key>`
   - `CLOUDINARY_API_SECRET=<secret>`
   - `CLOUDINARY_UPLOAD_PRESET=<preset name from step 2>`
   - `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true`

### Implementation Sprint Scope (VS-SPRINT-VIDEO-RFQ-02)

| Step | Task | Complexity |
|------|------|-----------|
| 1 | Add `export const maxDuration = 60;` to `/api/video-rfq/route.ts` | 1 line |
| 2 | Add client-side 4.5MB size guard to `VideoRFQ.tsx` (for current multipart path) | 10 lines |
| 3 | Add 2-minute auto-stop to `VideoRFQ.tsx` timer | 5 lines |
| 4 | Require login before video recording (decision: remove guest video path) | 20 lines |
| 5 | Show video in `RFQDetail.tsx` using existing `VideoPlayer` component | 30 lines |
| 6 | Add `generateVideoThumbnail()` call when saving RFQ and store as note in description | 10 lines |
| 7 | Add "📹 Video Requirement" badge to feed cards where `type === 'VIDEO'` | 15 lines |
| 8 | Add `RFQ_VIDEOS` entry to `UPLOAD_CONFIGS` in `cloudinary.ts` | 10 lines |

**Revised effort estimate: 3–4 hours** (reduced from 5 hours because thumbnail generation is pre-built)

### Explicitly Out of MVP (unchanged from design doc)

- Supplier capability videos → Phase 2
- Video analytics instrumentation → Phase 3
- Video moderation pipeline → Phase 3
- Direct-to-Cloudinary web upload path → Phase 2 (requires auth decision resolution first)
- Adaptive bitrate streaming → Phase 4+

---

## Verdict

| Section | Status | Action |
|---------|--------|--------|
| Upload architecture | ✅ Confirmed correct | None |
| Storage strategy | ✅ Correct (Cloudinary for MVP) | Identify which of 3 lib files each route uses |
| Thumbnail generation | ❌ Error — already exists | Update MVP scope to include thumbnails |
| File format (MP4-only) | ❌ Error — must allow webm | Change allowed formats in implementation |
| Vercel timeout | ❌ Missing critical risk | Add Vercel Pro upgrade to pre-sprint checklist |
| Guest auth inconsistency | ❌ Missing risk | Decide: require login for video or keep guest-friendly multipart path |
| Supplier videos | ✅ Phase 2 is correct | None |
| MVP implementation order | ✅ Correct | Minor additions (maxDuration, thumbnails in feed) |

**Design document: CONDITIONALLY APPROVED.** 4 corrections are documented above. These are implementation-detail corrections, not architectural rethinks. The overall design is sound and the MVP is still ~3–4 hours of implementation work after Vercel Pro upgrade and Cloudinary setup.

**Recommended next action:** Update the design document with corrections, then proceed to VS-SPRINT-VIDEO-RFQ-02 (Implementation).

---

*VS-SPRINT-VIDEO-RFQ-01-REVIEW complete. No code changes made.*
