# VS-H6-11B — Voice RFQ Demo Video Asset
**Date:** 12 Aug 2026
**Follows:** VS-H6-11A (Voice RFQ SEO Landing Page)
**Scope:** Fills the one gap H6-11A explicitly flagged and declined to fabricate — a real demo visual for `/features/voice-rfq`.
**Status:** Not committed, not pushed. Applied via Cowork session with direct file access to this repo; needs the same tsc/build verification Claude Code ran for H6-11A before commit.

---

## What changed

**Source:** Real branded demo footage supplied by Vishal (`C:\Users\Sanika\Downloads\YAPARSETHU Videos`) — 7 short (~10s) clips of the live Speak Requirement flow, all showing the actual VyaparSethu app UI, mic button, waveform, and www.vyaparsethu.com URL. Not stock footage, not fabricated.

**Selected:** `Regenarate_the_video_RFQ Introduced.mp4` — highest source resolution of the set (1280×720 vs. 848×478 for the others).

**Processing:**
- Re-encoded with ffmpeg (H.264, CRF 27, 720p, mono AAC audio) to reduce payload: 2.4MB → 1.56MB
- Extracted a poster frame (first clean branded frame) as a static JPG fallback

**Added to repo:**
- `public/voice-rfq-demo.mp4` (1.56MB)
- `public/voice-rfq-demo-poster.jpg` (53KB)

**Edited:** `src/app/features/voice-rfq/page.tsx` — replaced the icon+waveform placeholder (lines ~139–152 as of H6-11A) with a real `<video>` element.

## Why it's not autoplay

H6-11A's own performance section says: "Do not autoplay large video files." The homepage's `brand-video.mp4` (~1MB, autoplay+loop) is already flagged in `src/data/seo-dashboard.ts` as a Lighthouse warning ("largest asset; autoplay loads on scroll"). Rather than repeat that pattern at a larger file size, this video uses:
- `preload="none"` — zero network cost until a visitor clicks play
- `poster` — a static image fills the space immediately, no layout shift, no LCP risk
- native `controls`, no `autoPlay`/`loop`

This should have negligible Core Web Vitals impact, unlike the existing homepage video.

## What still needs doing (Claude Code / your review)

1. Run `tsc --noEmit` and `next build` to confirm the JSX change compiles clean (attempted from this session but the type-check timed out against the mounted repo — needs a native run on your machine, same as H6-11A's validation step)
2. Visual check in a real browser — confirm the poster frame and 16:9 crop look right on mobile widths
3. Decide whether to also compress/replace `brand-video.mp4` on the homepage using the same approach, since it's flagged with the identical Lighthouse warning and now has a proven lower-payload pattern to follow
4. Not committed or pushed — same review gate as H6-11A
