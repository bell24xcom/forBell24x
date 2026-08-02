-- Ratings: buyer reviews supplier, supplier reviews buyer, exactly once
-- each per completed Deal. Replaces the legacy InsForge-backed review
-- flow (src/app/api/review/submit/route.ts), which wrote to a separate,
-- disconnected backend with no matching table here.

CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewee_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reviews_deal_id_reviewer_id_key" ON "public"."reviews"("deal_id", "reviewer_id");
CREATE INDEX "reviews_reviewee_id_idx" ON "public"."reviews"("reviewee_id");

ALTER TABLE "public"."reviews"
  ADD CONSTRAINT "reviews_deal_id_fkey"
  FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."reviews"
  ADD CONSTRAINT "reviews_reviewer_id_fkey"
  FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."reviews"
  ADD CONSTRAINT "reviews_reviewee_id_fkey"
  FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
