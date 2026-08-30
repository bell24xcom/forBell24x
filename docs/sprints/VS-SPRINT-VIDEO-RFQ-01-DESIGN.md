# VS-SPRINT-VIDEO-RFQ-01: Marketplace Video RFQ Foundation
## Design Document

**Date:** 2026-08-27  
**Sprint:** VS-SPRINT-VIDEO-RFQ-01  
**Mode:** READ ONLY — design and audit only. No code changes. No commits beyond this document.  
**Status:** ✅ Design complete

---

## Executive Summary

The Video RFQ foundation is **significantly more complete than anticipated**. An audit of the codebase reveals that video upload infrastructure, the Video RFQ component, the backend transcription pipeline, and the video player component all exist in production-ready states. The feature is gated behind `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=false` — not because the code is missing, but because it was built ahead of the first real transaction.

**What already exists (surprising finding):**
- `VideoRFQ.tsx` — full browser recording + file upload component
- `/api/video-rfq/route.ts` — Groq Whisper transcription + Llama 3.1 extraction pipeline
- `VideoPlayer.tsx` — custom HTML5 player (play/pause/mute/fullscreen/progress)
- Cloudinary `PRODUCT_VIDEOS` config — 100MB limit, 1280x720 MP4 transform
- `/api/cloudinary/upload-signature` — direct-to-Cloudinary for mobile (bypasses Vercel 4.5MB limit)
- `RFQ.videoUrl` and `RFQ.videoPublicId` fields in the Prisma schema
- `RFQ.type = 'VIDEO'` — already typed in the data model

**What does NOT yet exist:**
- Supplier capability video profile (no schema fields, no UI, no upload route)
- Video thumbnail generation pipeline
- Video in the RFQ feed cards
- Video moderation pipeline
- Video analytics instrumentation
- Duration/size limits enforced at the upload layer

**Recommended MVP:** Enable `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true` in Vercel, set Cloudinary credentials, and surface the existing `VideoRFQ.tsx` component on the RFQ creation page. The supplier video profile requires 2–4 new schema fields and a new upload route.

---

## 1. Current Architecture Assessment

### 1.1 Storage Provider: Cloudinary (Primary)

**Status:** Installed and configured in code; env vars NOT set in production.

| Item | Detail |
|------|--------|
| Package | `cloudinary ^2.10.0` (npm installed) |
| Config file | `src/lib/cloudinary-server.ts` |
| Cloud name env | `CLOUDINARY_CLOUD_NAME` or `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| API key env | `CLOUDINARY_API_KEY` |
| API secret env | `CLOUDINARY_API_SECRET` |
| Preset env | `CLOUDINARY_UPLOAD_PRESET` |
| Production status | **NOT CONFIGURED** — env vars blank on Vercel |

**Upload configurations defined in `UPLOAD_CONFIGS`:**

| Config Key | Folder | Max Size | Allowed Formats | Resource Type | Transform |
|------------|--------|----------|-----------------|---------------|-----------|
| `PRODUCT_IMAGES` | `bell24h/products` | 10MB | jpg, jpeg, png, webp | image | 800×600, webp |
| **`PRODUCT_VIDEOS`** | `bell24h/products/videos` | **100MB** | mp4, mov, avi, webm | video | 1280×720, mp4 |
| `DOCUMENTS` | `bell24h/documents` | 25MB | pdf, doc, docx, xls, xlsx, ppt, pptx | raw | — |
| `CERTIFICATES` | `bell24h/certificates` | 15MB | pdf, jpg, jpeg, png | image | 1200×900 |
| `PROFILE_IMAGES` | `bell24h/profiles` | 5MB | jpg, jpeg, png, webp | image | 400×400, face crop |
| `COMPANY_LOGOS` | `bell24h/logos` | 5MB | jpg, jpeg, png, svg | image | 300×300, white bg |
| `RFQ_ATTACHMENTS` | `bell24h/rfq` | 50MB | pdf, doc, docx, jpg, jpeg, png, xls, xlsx, dwg, step | auto | — |

**Video-specific Cloudinary capability:**
- `PRODUCT_VIDEOS` config exists: 100MB limit, 1280×720 MP4 auto-quality
- RFQ videos use `bell24h/rfq/videos` folder (separate from product videos)
- Cloudinary natively generates thumbnails from videos (`fl_screenshot` parameter)
- Cloudinary provides CDN delivery, adaptive bitrate streaming, and lazy-loading poster images

### 1.2 Storage Provider: AWS S3 (Secondary — Not Active)

| Item | Detail |
|------|--------|
| Service file | `src/services/storage/S3Service.ts` |
| SDK | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` |
| Env vars | `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Production status | **NOT ACTIVE** — env vars defined in `.env.production.template` only |
| Bucket name | `bell24h-prod-files` (template only) |
| Usage | No route currently calls `s3Service` — it is a prepared utility |

### 1.3 Local Filesystem Fallback

- `/api/supplier/upload-image` falls back to `public/uploads/products/` when Cloudinary is not configured
- **This fallback does NOT work on Vercel** (read-only filesystem at runtime)
- Only relevant in local development

### 1.4 Vercel Blob

Not installed. No reference in package.json. Not under consideration.

### 1.5 Video Upload Architecture: Two Paths

**Path 1 — Web (multipart blob):**
```
Browser → MediaRecorder (webm) → FormData → POST /api/video-rfq → 
  Groq Whisper transcription → Llama 3.1 extraction → Prisma RFQ.create
```
- Limitation: Vercel request body cap is **4.5MB** → 60-90 seconds of webm recording max
- Current GROQ_WHISPER_MAX_BYTES guard: 25MB — but Vercel will reject before that

**Path 2 — Mobile (direct-to-Cloudinary):**
```
Mobile app → POST /api/cloudinary/upload-signature (auth-gated) →
  Client uploads directly to Cloudinary with signed credential →
  POST /api/video-rfq (JSON body with videoUrl + videoPublicId) →
  Groq fetches videoUrl itself → Whisper transcription → Llama extraction
```
- Bypasses Vercel 4.5MB cap entirely
- Cloudinary URL validated: must match `res.cloudinary.com/{cloudName}/` 
- This is the correct architecture for large files

**Recommendation:** Web path should migrate to the same direct-to-Cloudinary pattern. The current multipart path will break on videos > ~60 seconds.

### 1.6 Existing Video RFQ Component

`src/components/rfq/VideoRFQ.tsx` — **production-quality component, fully functional:**
- Camera/microphone permission request via `getUserMedia`
- Record mode: live preview, REC timer, stop button
- Preview mode: playback, re-record, submit
- Upload mode: progress bar
- File upload mode: `<input type="file" accept="video/*" />`
- States: idle → recording → preview → uploading → success

**Gap:** No upload size guard in the component. A 3-minute recording at webm quality can exceed 100MB. The client should warn before submission.

### 1.7 Existing Video Player

`src/components/homepage/VideoPlayer.tsx` — **production-quality custom HTML5 player:**
- Play/Pause toggle with overlay button
- Mute/Unmute
- Fullscreen
- Progress bar with seek support
- Time display (current / total)
- Poster image support
- `onEnded` handler

**Gaps:** No lazy loading, no thumbnail-before-play mode, no mobile touch gestures, no aspect-ratio lock (uses `aspect-video` class = 16:9 only).

### 1.8 Current Schema Support

```prisma
model RFQ {
  type          String?     // 'VIDEO' | 'VOICE' | 'TEXT' | null
  videoUrl      String?     // Cloudinary or direct URL
  videoPublicId String?     // Cloudinary public_id for management
  ...
}
```

**Gap:** No `videoThumbnailUrl`, no `videoDuration`, no `videoSize`, no `videoProcessingStatus`.

### 1.9 Feature Flag

```bash
# .env.example
NEXT_PUBLIC_VIDEO_RFQ_ENABLED=false
```

The Video RFQ feature is gated. Setting this to `true` and configuring Cloudinary is the immediate path to activation.

---

## 2. Storage Strategy Options

| Provider | Setup Effort | Cost (100 videos/month) | CDN | Video Transcoding | Thumbnail | Recommended? |
|----------|-------------|------------------------|-----|-------------------|-----------|-------------|
| **Cloudinary** | LOW (already coded) | ~$0–$89/month | ✅ | ✅ Auto | ✅ Auto | ✅ **MVP choice** |
| AWS S3 + CloudFront | MEDIUM (S3Service exists) | ~$3–$8/month | ✅ | ❌ (need Lambda) | ❌ (need Lambda) | Phase 2 cost-out |
| Vercel Blob | LOW | ~$20/month | ✅ | ❌ | ❌ | No — not installed |
| Local / Public dir | NONE | $0 | ❌ | ❌ | ❌ | Never — Vercel read-only |

### Storage Cost Analysis

**Assumptions for Year 1:**
- 100 Video RFQs/month × avg 50MB each = 5GB new storage/month
- 50 supplier capability videos × avg 200MB each = 10GB total supplier storage
- Streaming: 500 unique views/month × avg 30MB streamed = 15GB bandwidth/month

**Cloudinary Free Tier:** 25 credits/month — each video transformation costs credits
- Free tier exhausted at ~25 video transformations/month
- Pro tier ($89/month): 225GB storage, 225GB bandwidth — adequate for Year 1

**AWS S3 + CloudFront (Phase 2 option for cost control):**
- S3 storage: $0.023/GB = ~$0.35/month (15GB stored)
- CloudFront transfer: $0.085/GB = ~$1.28/month (15GB streamed)
- Lambda for thumbnails: ~$0.50/month
- **Total: ~$2–$5/month** — 95% cheaper than Cloudinary Pro at scale

**Recommendation:**
- **MVP (0–50 suppliers):** Cloudinary free tier + Pro when exhausted
- **Phase 2 (50+ suppliers):** Migrate video storage to S3 + CloudFront; keep Cloudinary for images

---

## 3. RFQ Video Architecture

### 3.1 Proposed Schema Changes (Future — NOT implementing now)

```prisma
model RFQ {
  // EXISTING (already in schema)
  type              String?
  videoUrl          String?
  videoPublicId     String?
  
  // PROPOSED ADDITIONS
  videoThumbnailUrl String?   // Cloudinary auto-generated thumbnail
  videoDurationSecs Int?      // Duration in seconds (from Cloudinary webhook or client)
  videoSizeBytes    BigInt?   // File size at upload time
  videoProcessing   VideoProcessingStatus?  // PENDING | PROCESSING | READY | FAILED
  videoMimeType     String?   // video/mp4 | video/webm | video/mov
}

enum VideoProcessingStatus {
  PENDING
  PROCESSING
  READY
  FAILED
}
```

**Backward compatibility:** All proposed fields are nullable. Existing RFQs unaffected. No migration risk.

### 3.2 API Implications

**`POST /api/video-rfq`** — already exists. Needs:
1. Store `videoThumbnailUrl` derived from `videoPublicId` (Cloudinary URL pattern)
2. Store `videoDurationSecs` from client (MediaRecorder timer) or Cloudinary webhook
3. Store `videoSizeBytes` from file size at upload
4. Set `videoProcessing: 'READY'` after successful transcription

**`GET /api/deal/[id]`** — no change needed

**New (future): `POST /api/supplier/upload-video`** — does not exist yet. Needed for supplier capability videos.

### 3.3 RFQ Type System

```
RFQ.type:
  'TEXT'   — traditional text form requirement
  'VOICE'  — audio recording + transcription (existing: /api/voice-rfq)
  'VIDEO'  — video recording + transcription (existing: /api/video-rfq)
  'IMAGE'  — image attachment (not yet built)
  null     — legacy RFQs before type field was added
```

The `type` field already exists and is used (`type: 'VIDEO'` is set in `/api/video-rfq/route.ts`).

---

## 4. Supplier Video Profile Design

### 4.1 Current State

The `User` model has no video fields. Video capability can currently only be stored in `preferences` JSON — informal and unindexed.

### 4.2 Proposed Supplier Video Structure

**Capability video types (for MVP):**
1. Factory Tour — top priority for trust-building
2. Production Line — shows process capability
3. Packaging Process — shows quality control
4. Product Showcase — specific product demonstration

**Storage design (future schema addition):**

```prisma
model SupplierCapabilityVideo {
  id           String    @id @default(cuid())
  supplierId   String    @map("supplier_id")
  videoType    String    // 'FACTORY_TOUR' | 'PRODUCTION_LINE' | 'PACKAGING' | 'PRODUCT'
  title        String
  videoUrl     String
  videoPublicId String?
  thumbnailUrl String?
  durationSecs Int?
  sizeBytes    BigInt?
  isPublic     Boolean   @default(true)
  isApproved   Boolean   @default(false)   // Founder reviews before public
  uploadedAt   DateTime  @default(now())
  supplier     User      @relation("SupplierVideos", fields: [supplierId], references: [id])
  
  @@map("supplier_capability_videos")
}
```

**Alternative (minimal schema impact):** Store in `preferences` JSON as:
```json
{
  "capabilityVideos": [
    {
      "id": "cuid",
      "type": "FACTORY_TOUR",
      "title": "Ishwar Steel — Factory Tour",
      "videoUrl": "https://res.cloudinary.com/...",
      "thumbnailUrl": "...",
      "durationSecs": 90,
      "isPublic": true,
      "uploadedAt": "2026-08-27T..."
    }
  ]
}
```
The JSON approach requires no schema migration but loses indexed queries. For MVP (≤100 suppliers), JSON in preferences is acceptable. Migrate to a relation table at 100+ suppliers.

### 4.3 Visibility Model

| Video | Visible To | Requires |
|-------|-----------|----------|
| RFQ video | Supplier who unlocked this lead (1 credit) | Lead unlock |
| Supplier factory tour | Any authenticated supplier (buyer browsing) | Auth only |
| Supplier product video | Any visitor | Public — no auth required |
| Supplier production process | Buyers who received a quote from this supplier | Quote context |

**Trust-building opportunity:**
- A supplier's factory tour video displayed on their quote card increases buyer confidence
- Currently: buyer sees only name, company, location, trust score
- With video: buyer sees the factory, process, and team → conversion rate should improve

### 4.4 Founder Moderation (MVP)

- All supplier videos go through founder approval before becoming `isApproved: true` and publicly visible
- Unapproved videos show only to the supplier themselves
- Approval via admin panel: `PUT /api/admin/users` with video approval action
- Not automated for MVP — manual founder review only

---

## 5. Video Player Recommendation

### 5.1 Current Component Audit

`src/components/homepage/VideoPlayer.tsx` exists and is functional. Assessment:

| Capability | Status |
|-----------|--------|
| Play/Pause | ✅ |
| Mute/Unmute | ✅ |
| Fullscreen | ✅ |
| Progress bar + seek | ✅ |
| Time display | ✅ |
| Poster/thumbnail | ✅ (via prop) |
| Lazy loading | ❌ Not implemented |
| Mobile touch gestures | ❌ No touch events |
| 9:16 vertical (mobile recordings) | ❌ Hardcoded 16:9 |
| Low-bandwidth mode | ❌ No adaptive quality |
| CDN delivery | ✅ (via Cloudinary URL) |
| Auto-pause on scroll away | ❌ No IntersectionObserver |

### 5.2 Recommendation: Extend Existing Component

**Do NOT add a third-party player library.** The existing component is 120 lines and covers 80% of needs. Extending it is lower risk and lower bundle size.

**Required extensions for Video RFQ use case:**

1. **Aspect ratio prop** — support 16:9 (landscape RFQ) and 9:16 (mobile portrait recording):
   ```tsx
   interface VideoPlayerProps {
     aspectRatio?: '16/9' | '9/16' | '4/3';
   }
   ```

2. **Lazy loading** — use `IntersectionObserver` to not load video until 80% visible:
   ```tsx
   const [shouldLoad, setShouldLoad] = useState(false);
   // Only render <video> when shouldLoad = true
   ```

3. **Thumbnail-first** — show poster image with play button; load video only on click:
   - Cloudinary auto-thumbnail: `https://res.cloudinary.com/{cloud}/video/upload/so_auto/{publicId}.jpg`

4. **Mobile touch** — tap-to-play overlay is already implemented; sufficient for MVP

### 5.3 Third-Party Players — Evaluated and Rejected for MVP

| Library | Bundle | CDN integration | India mobile perf | Decision |
|---------|--------|-----------------|-------------------|----------|
| `react-player` | 200KB | Good | Good | REJECT — too heavy for MVP |
| `video.js` | 400KB | Good | Medium | REJECT — overkill |
| `plyr` | 100KB | Good | Good | CONSIDER at Phase 2 |
| Native HTML5 | 0KB | Via URL | Good | ✅ RECOMMENDED (current) |

---

## 6. Feed Experience Recommendation

### 6.1 Current RFQ Feed

`src/components/homepage/LiveRFQFeed.tsx` and `LiveRFQFeedCompact.tsx` display RFQ cards with: category, title, location, budget, time. No media.

`src/components/rfq/RFQDetail.tsx` shows individual RFQ detail. Video URL not currently rendered.

### 6.2 Proposed RFQ Card Types

**Type A — Text RFQ (current):**
```
┌─────────────────────────────┐
│ [Category badge]            │
│ Title                       │
│ Budget · Location · Urgency │
│ Posted X minutes ago        │
└─────────────────────────────┘
```

**Type B — Video RFQ (proposed):**
```
┌─────────────────────────────┐
│ [📹 Video RFQ badge]        │
│ ┌───────────────────────┐   │
│ │  [Thumbnail + ▶ icon] │   │
│ │  Duration: 0:47       │   │
│ └───────────────────────┘   │
│ Title                       │
│ Budget · Location · Urgency │
│ AI-extracted summary        │
└─────────────────────────────┘
```

**UX rules for feed:**
- No autoplay in feed — thumbnail only
- Play button visible on card hover (desktop) / always visible (mobile)
- Video plays inline in feed (no full-page navigation required)
- Video card should load thumbnail lazy (only images, not video bytes, on feed load)
- `duration` badge on thumbnail corner (e.g. "0:47")

### 6.3 RFQ Detail Page — Video Layout

```
[Video Player — full width on mobile, 60% width on desktop]
[AI-extracted summary — from transcription]
[Quantity | Budget | Location | Urgency | Timeline]
[Submit Quote button]
```

### 6.4 Mobile-First Considerations

- Indian suppliers primarily browse on Android phones (4G, 2–5 Mbps typical)
- Thumbnail must load in < 1 second at 4G speeds → keep thumbnails < 50KB
- Video must NOT autoplay (data cost concern)
- First-play buffer: Cloudinary adaptive streaming starts at lowest quality
- Video player should show buffering indicator on slow connections

---

## 7. Security & Moderation Model

### 7.1 Upload Constraints (Recommended)

| Constraint | Buyer Video RFQ | Supplier Capability Video |
|------------|----------------|--------------------------|
| Max size | **50MB** (reduce from current 100MB limit) | **200MB** |
| Max duration | **2 minutes** | **5 minutes** |
| Allowed formats | mp4, webm, mov | mp4, webm, mov |
| Blocked formats | .avi, .mkv, .flv, .ts | .avi, .mkv, .flv |
| Min duration | 5 seconds | 15 seconds |
| Rate limit | 3 uploads/hour per user | 5 uploads/day per supplier |

**Rationale for 50MB buyer limit:** A 2-minute 720p webm recording is 15–40MB. 50MB allows for higher-quality recordings without enabling abuse. 100MB would allow 6+ minute recordings.

### 7.2 Validation Strategy

**Client-side (before upload):**
```typescript
// Check before showing "Upload" button
if (file.size > 50 * 1024 * 1024) → show "Video too large (max 50MB)"
if (recordingTimer > 120) → auto-stop recording at 2:00
```

**Server-side (at API route):**
```typescript
// /api/video-rfq
if (videoBuffer.length > 50 * 1024 * 1024) → 413 error
// Validate content-type header
const ALLOWED_MIME = ['video/mp4', 'video/webm', 'video/quicktime']
if (!ALLOWED_MIME.includes(file.type)) → 400 error
```

**Cloudinary-side:**
- Upload configs already restrict `allowed_formats` → Cloudinary rejects non-allowed formats before storage
- CLOUDINARY_UPLOAD_PRESET controls allowed transformations

### 7.3 Content Moderation Strategy (MVP)

**Manual moderation only for MVP:**
1. All buyer Video RFQs → auto-published but flagged for weekly founder review
2. All supplier capability videos → held for approval (`isApproved: false`) until founder reviews
3. Reporting: any user can flag a video → email to founder
4. Takedown: `DELETE /api/admin/videos/[publicId]` → Cloudinary `destroy` + DB null

**Future (Phase 2):**
- Cloudinary Content Moderation API (AWS Rekognition under the hood)
- Automatic nudity/violence detection → hold for review
- Cost: ~$0.01 per video analyzed

### 7.4 Virus Scanning

Cloudinary does NOT scan for malware. Videos are not executable — binary video files cannot carry active malware risk in standard formats. **Risk: LOW for .mp4/.webm/.mov**. No virus scanning needed at MVP.

For documents (`RFQ_ATTACHMENTS`) — existing `.pdf`, `.doc` — low risk, no current scanning. Not in scope for this sprint.

### 7.5 Storage Abuse Controls

- Rate limiting: 3 video uploads/hour per authenticated user (not yet implemented — future)
- Credit-gating: require ≥1 credit for video RFQ submission? (recommended — discourages spam)
- Account verification: only `isClaimed: true` users can upload supplier videos
- Orphan cleanup: Cloudinary webhook on upload → associate with RFQ ID; any video without an RFQ ID after 24h → delete (not implemented — future)

### 7.6 Copyright

VyaparSethu Terms of Service must include:
- "By uploading a video, you confirm you own or have rights to the content"
- "VyaparSethu reserves the right to remove videos that violate third-party rights"

No automated copyright detection for MVP. Manual takedown on request only.

---

## 8. Analytics Model

### 8.1 Proposed Video Analytics Events

These should be instrumented in the future when video is live. **NOT implementing now.**

| Event | Trigger | Fields to Capture |
|-------|---------|-------------------|
| `video_rfq_recorded` | Supplier clicks "Stop Recording" | userId, category, city, durationSecs |
| `video_rfq_submitted` | POST /api/video-rfq succeeds | rfqId, userId, category, durationSecs, sizeBytes |
| `video_rfq_viewed` | VideoPlayer `onPlay` fires | rfqId, viewerId, viewerRole, timestamp |
| `video_rfq_watch_duration` | VideoPlayer `onPause` / `onEnded` | rfqId, viewerId, watchedPercent, watchedSecs |
| `supplier_video_uploaded` | POST /api/supplier/upload-video | supplierId, videoType, durationSecs |
| `supplier_video_viewed` | VideoPlayer `onPlay` on supplier profile | supplierId, viewerId, videoType |
| `video_quote_conversion` | Quote submitted after video viewed | rfqId, supplierId, videoViewedAt |

### 8.2 Key Metrics

| Metric | Definition | Business Meaning |
|--------|------------|-----------------|
| **Video RFQs Created** | COUNT(rfqs WHERE type='VIDEO') | Video adoption rate |
| **Video RFQs Viewed** | COUNT(video_rfq_viewed events) | Supplier discovery of video RFQs |
| **Video RFQs Unlocked** | COUNT(lead unlocks WHERE rfq.type='VIDEO') | Supplier intent on video requirements |
| **Video-to-Quote Rate** | Quotes on video RFQs ÷ video RFQ views | Does video drive more quotes? |
| **Avg Watch Duration %** | Mean watchedPercent across all views | Are suppliers watching the full requirement? |
| **Supplier Video Views** | COUNT(supplier_video_viewed) | Buyer engagement with supplier profiles |
| **Video Conversion Delta** | Video RFQ quote rate vs Text RFQ quote rate | Business case for video |

### 8.3 Admin Dashboard Addition (Future)

Add to `/admin` page → new "Video Activity" section:
- Video RFQs this week vs last week
- Top categories by video RFQ volume
- Avg watch duration
- Video-to-quote conversion rate vs text RFQ baseline

---

## 9. Trade Intelligence Preparation Notes

**READ ONLY — NO IMPLEMENTATION. NO BELL24H-OS ACTIVATION.**

The following signals become available when video is active. These are future data contracts only.

| Signal | Source | What It Tells Bell24h-OS |
|--------|--------|--------------------------|
| `video_rfq_watch_duration` | VideoPlayer events | Which categories generate the most supplier engagement |
| `video_rfq_quote_rate` | Quotes ÷ video views per RFQ | Whether video quality predicts quote volume |
| `supplier_video_view_count` | Supplier profile views | Which supplier capability types build trust |
| `video_category_demand` | rfqs WHERE type='VIDEO' GROUP BY category | Visual demand signals by category |
| `buyer_video_urgency_signal` | RFQ.urgency WHERE type='VIDEO' | Whether video buyers are higher-urgency than text buyers |
| `supplier_trust_video` | SupplierCapabilityVideo.isApproved + views | Video presence as a trust signal component |

**Data contract readiness:** The RFQ table already captures `videoUrl`, `type`, `category`, `urgency`. The BOM life event system (`BusinessLifeEvent`) can receive a `VIDEO_RFQ_SUBMITTED` event type. No schema changes required to start collecting these signals — they become available the moment video is enabled.

**Intelligence gate:** Do not activate Bell24h-OS video intelligence until:
- ≥50 video RFQs exist with quote data
- ≥10 suppliers have capability videos
- `FLAGS.INTELLIGENCE_ENABLED = true` (requires 100 verified suppliers)

---

## 10. Cost Analysis

### 10.1 Cloudinary Pricing Breakdown

| Tier | Monthly Cost | Storage | Bandwidth | Video Transformations |
|------|-------------|---------|-----------|----------------------|
| Free | $0 | 25GB | 25GB | 25 credits |
| Essentials | $89 | 225GB | 225GB | 225 credits |
| Advanced | $224 | 600GB | 600GB | 600 credits |

**Year 1 projection (conservative: 50 video RFQs/month, 20 supplier videos total):**
- Storage: ~15GB total (50 × 50MB buyer + 20 × 200MB supplier = 6.5GB)
- Bandwidth: ~30GB/month at 100% view rate
- Credits consumed: ~70/month (each video transformation ≈ 1 credit)
- **Cost: Essentials tier ($89/month) from month 3 onward**
- **Year 1 total: ~$800**

### 10.2 S3 + CloudFront (Phase 2 Cost Optimization)

| Cost Item | Rate | Year 1 Estimate |
|-----------|------|-----------------|
| S3 storage | $0.023/GB/month | ~$4/month |
| CloudFront transfer | $0.085/GB | ~$30/month |
| S3 PUT requests | $0.005/1000 | ~$0.50/month |
| Lambda (thumbnail) | $0.0000002/req | ~$0.50/month |
| **Total** | | **~$35/month** |

**Break-even:** Migrate to S3 when Cloudinary cost exceeds $89/month — typically at 200+ video RFQs/month or 50+ supplier videos.

The S3Service is already written. Migration path: add a new `uploadVideoToS3` function that wraps `s3Service.uploadFile`, generate thumbnails via a Lambda function or `ffmpeg` layer, and update the `UPLOAD_CONFIGS` routing.

---

## 11. Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Vercel 4.5MB body cap blocks web video uploads | **HIGH** | High | Web path must migrate to direct-to-Cloudinary (same as mobile path). The signature endpoint exists. |
| Cloudinary env vars not set → silent failure | **HIGH** (current production state) | High | Fallback to local disk fails on Vercel. Must set 3 env vars before enabling. |
| Supplier uploads fake/inappropriate video | MEDIUM | Medium | Manual founder approval gate for supplier videos. |
| Groq Whisper quota exhaustion | MEDIUM | Low | Video RFQ transcription fails gracefully; RFQ still saved with user description. |
| Large video causes Vercel function timeout (10s default) | MEDIUM | Medium | Upload direct-to-Cloudinary; only pass URL to API. Already implemented for mobile. |
| Mobile browser no camera permission | LOW | Low | Error handled in `VideoRFQ.tsx` with user-facing alert. |
| Cloudinary billing surprise | LOW | Medium | Set Cloudinary usage alerts in dashboard. Enforce 50MB client-side guard. |
| Video recording in noisy environment | MEDIUM | Low | Whisper handles ambient noise well. Prompt user to speak clearly. |
| Long-running video holds Groq quota | MEDIUM | Low | Enforce 2-minute recording limit in component timer. |

---

## 12. Recommended MVP

### 12.1 What to Enable (Additive Only — No New Architecture)

**Step 1 — Set environment variables in Vercel (no code):**
```
CLOUDINARY_CLOUD_NAME=bell24h
CLOUDINARY_API_KEY=[real key]
CLOUDINARY_API_SECRET=[real secret]
CLOUDINARY_UPLOAD_PRESET=[upload preset name]
NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true
```

**Step 2 — Fix web upload path (1 file change):**
- Modify `VideoRFQ.tsx` to use `POST /api/cloudinary/upload-signature` → direct upload → then POST URL to `/api/video-rfq`
- This mirrors the mobile path and removes the Vercel 4.5MB bottleneck

**Step 3 — Add size guard to component (5 lines):**
- Warn users if recorded video exceeds 50MB before submission
- Auto-stop recording at 2:00 (currently: no limit)

**Step 4 — Show video in RFQ detail page (1 component):**
- Import `VideoPlayer` into `RFQDetail.tsx`
- Render `deal?.videoUrl` with the existing player

**Step 5 — Add "Video RFQ" badge to feed cards:**
- Add a `📹 Video Requirement` chip to RFQ cards where `type === 'VIDEO'`
- No player in feed (thumbnail only)

**That is the complete MVP.** The infrastructure, component, backend pipeline, and data model all exist. The missing pieces are configuration (Vercel env vars) and 2 small code changes.

### 12.2 MVP Scope Explicitly Excluded

- Supplier capability videos — requires new schema fields + new upload route
- Video thumbnail in feed cards — requires Cloudinary `fl_screenshot` URL construction
- Video analytics instrumentation — post-MVP
- Video moderation pipeline — manual founder review only at MVP
- Duration/size enforcement on server — add with supplier video work

### 12.3 Effort Estimate

| Item | Effort |
|------|--------|
| Set Vercel env vars | 10 minutes |
| Web upload path fix (direct-to-Cloudinary) | 2 hours |
| Size guard in VideoRFQ.tsx | 30 minutes |
| Video in RFQ detail page | 1 hour |
| Video badge in feed cards | 1 hour |
| **MVP total** | **~5 hours** |

---

## 13. Future Expansion Path

### Phase 1 — MVP (current: ~5 hours)
Enable existing Video RFQ for buyers. Feature-flag toggle + Cloudinary config + 2 small fixes.

### Phase 2 — Supplier Video Profiles (~1 sprint)
- New schema: `SupplierCapabilityVideo` table or `preferences.capabilityVideos` JSON
- New route: `POST /api/supplier/upload-video`
- New UI: supplier dashboard → "My Videos" section
- Admin approval queue in `/admin`

### Phase 3 — Video Feed Enhancement (~1 sprint)
- Cloudinary thumbnail generation on upload
- Thumbnail lazy-loading in feed cards
- Video preview on card hover
- Watch duration tracking

### Phase 4 — Video Analytics (~1 sprint)
- Instrument `video_rfq_viewed` and `video_rfq_watch_duration` events
- Admin dashboard video metrics section
- Video-to-quote conversion rate tracking

### Phase 5 — Intelligence Signals (post-Phase D gate)
- Feed video watch signals into BOM life events
- Bell24h-OS consumption of video engagement data
- Video presence as Trust Score component (after 100 verified suppliers)

### Phase 6 — Video Processing Pipeline (if high volume)
- Migrate to S3 + CloudFront for cost reduction
- AWS Elemental MediaConvert for adaptive bitrate streaming (HLS)
- Automatic video thumbnail at multiple timestamps
- Content moderation via Rekognition

---

## Success Criteria (Founder Answers)

| Question | Answer |
|----------|--------|
| Can buyers upload requirement videos? | **YES** — infrastructure complete. Enable `NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true` + Cloudinary env vars. |
| Can suppliers upload factory videos? | **NOT YET** — new schema field + upload route needed (~1 sprint). |
| Can RFQs contain videos? | **YES** — `RFQ.videoUrl` and `RFQ.videoPublicId` exist in schema. |
| Can videos be viewed on mobile? | **YES** — HTML5 VideoPlayer works on all browsers. |
| What is the recommended storage provider? | **Cloudinary** for MVP (already coded). AWS S3 + CloudFront at Phase 2 for cost. |
| What are the expected storage costs? | **$0** on free tier (≤25 videos), **$89/month** at 50–200 videos/month. |
| What is the MVP implementation path? | Set 4 Vercel env vars + fix web upload path (~5 hours). |
| What are the security risks? | Vercel 4.5MB cap (known, has fix), Cloudinary not configured (known, set env vars), no duration limit in component (fix: 30 min). |
| What future intelligence signals become available? | Watch duration, category demand, video-to-quote rate, supplier trust via video presence. |

---

*VS-SPRINT-VIDEO-RFQ-01 design complete. No code changes made. Document committed to `docs/sprints/VS-SPRINT-VIDEO-RFQ-01-DESIGN.md`. Implementation starts when founder approves MVP scope.*
