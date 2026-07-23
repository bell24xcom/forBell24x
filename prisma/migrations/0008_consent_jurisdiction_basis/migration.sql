-- Adds jurisdiction + lawful-basis metadata to ConsentEvent. Additive only —
-- the table has no real rows yet (writes are gated by NO_CONSENT_UI), so this
-- is free now and would be a live-record migration later.

CREATE TYPE "public"."LawfulBasis" AS ENUM ('CONSENT', 'LEGITIMATE_INTEREST', 'CONTRACT', 'LEGAL_OBLIGATION');

ALTER TABLE "public"."consent_events" ADD COLUMN "jurisdiction" TEXT;
ALTER TABLE "public"."consent_events" ADD COLUMN "lawful_basis" "public"."LawfulBasis";
