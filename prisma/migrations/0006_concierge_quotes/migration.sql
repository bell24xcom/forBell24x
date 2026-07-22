-- Concierge-sourced quotes: staff can enter a real quote obtained off-platform
-- from a real, identifiable supplier, on that supplier's behalf. Always
-- disclosed to the buyer and excluded from organic engagement/SEO counts —
-- see source column usage in admin quote submission and public stat queries.

CREATE TYPE "public"."QuoteSource" AS ENUM ('SELF_SUBMITTED', 'CONCIERGE_SOURCED');

ALTER TABLE "public"."quotes"
  ADD COLUMN "source" "public"."QuoteSource" NOT NULL DEFAULT 'SELF_SUBMITTED',
  ADD COLUMN "sourced_by_user_id" TEXT,
  ADD COLUMN "sourcing_note" TEXT;

ALTER TABLE "public"."quotes"
  ADD CONSTRAINT "quotes_sourced_by_user_id_fkey"
  FOREIGN KEY ("sourced_by_user_id") REFERENCES "public"."users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
