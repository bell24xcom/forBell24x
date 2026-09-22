-- Marketplace Safety Framework (Option B — Founder Approval Required).
-- Created only when RFQ supplier matching falls back to a low-confidence
-- pool. No supplier is notified for the underlying RFQ until a founder
-- reviews candidate_pool and explicitly selects who to notify — enforced
-- in application code (lib/orchestration.ts), not by this migration.
-- See MARKETPLACE_SAFETY_IMPLEMENTATION_PLAN.

CREATE TYPE "public"."MatchApprovalStatus" AS ENUM (
    'PENDING_FOUNDER_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED'
);

CREATE TABLE "public"."match_approvals" (
    "id"                        TEXT NOT NULL,
    "rfq_id"                    TEXT NOT NULL,
    "status"                    "public"."MatchApprovalStatus" NOT NULL DEFAULT 'PENDING_FOUNDER_APPROVAL',
    "candidate_pool"            JSONB NOT NULL,
    "selected_supplier_ids"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "is_certification_test"     BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by"               TEXT,
    "reviewed_at"               TIMESTAMP(3),
    "rejection_reason"          TEXT,
    "notification_released_at"  TIMESTAMP(3),
    "expires_at"                TIMESTAMP(3) NOT NULL,
    "created_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_approvals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "match_approvals_status_idx" ON "public"."match_approvals"("status");
CREATE INDEX "match_approvals_rfq_id_idx" ON "public"."match_approvals"("rfq_id");

ALTER TABLE "public"."match_approvals"
  ADD CONSTRAINT "match_approvals_rfq_id_fkey"
  FOREIGN KEY ("rfq_id") REFERENCES "public"."rfqs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
