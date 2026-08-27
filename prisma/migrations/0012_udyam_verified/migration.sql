-- Migration: 0012_udyam_verified
-- Adds UDYAM_VERIFIED to VerificationStatus enum.
-- Additive only — no existing rows are affected.
-- MANUAL_VERIFIED remains valid for in-person and legacy verifications.

ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'UDYAM_VERIFIED';
