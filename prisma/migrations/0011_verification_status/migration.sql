-- Migration: 0011_verification_status
-- Adds VerificationStatus enum and verificationStatus column to users.
-- Separates phone-OTP verification (isVerified) from business verification
-- (GST/Udyam/manual review). All existing users default to PHONE_VERIFIED.

DO $$ BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM (
    'PHONE_VERIFIED',
    'GST_PENDING',
    'GST_VERIFIED',
    'MANUAL_VERIFIED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "verification_status" "VerificationStatus"
  NOT NULL DEFAULT 'PHONE_VERIFIED';
