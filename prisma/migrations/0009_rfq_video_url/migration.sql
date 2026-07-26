-- Preserves the Cloudinary video URL on RFQs created from a recorded
-- Video Requirement. Direct-to-Cloudinary upload (see
-- src/app/api/cloudinary/upload-signature/route.ts) produces this URL before
-- transcription; until now nothing persisted it past the extraction step, so
-- the recorded video itself was discarded once its text was extracted.

ALTER TABLE "public"."rfqs" ADD COLUMN "videoUrl" TEXT;

-- Cloudinary's transform/delete/watermark/analytics APIs key on public_id,
-- not the URL. Same upload response that yields videoUrl already carries
-- this — persisting it now avoids a migration later for any of those ops.
ALTER TABLE "public"."rfqs" ADD COLUMN "videoPublicId" TEXT;
