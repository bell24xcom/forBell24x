-- H6-13 — Company Profile Claim Outreach foundation.
-- "Company" reuses the existing `users` table (role SUPPLIER, is_claimed
-- false) — no new company/business/profile table is introduced.
-- Live sending is gated by outreach_campaigns.status = 'LIVE'; every other
-- status must never reach a transport provider (enforced in application code,
-- not by this migration — see src/lib/outreach/campaignStateMachine.ts).

CREATE TYPE "public"."OutreachCampaignStatus" AS ENUM (
    'DRAFT', 'DRY_RUN', 'READY', 'LIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE "public"."OutreachChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS');

CREATE TYPE "public"."OutreachRecipientState" AS ENUM (
    'PENDING', 'ELIGIBLE', 'SUPPRESSED', 'DRY_RUN', 'QUEUED', 'SENT',
    'DELIVERED', 'FAILED', 'CLAIMED', 'SKIPPED'
);

CREATE TYPE "public"."SuppressionReason" AS ENUM (
    'OPT_OUT', 'BOUNCED', 'CLAIMED', 'INELIGIBLE'
);

CREATE TYPE "public"."ClaimInvitationStatus" AS ENUM (
    'ISSUED', 'VIEWED', 'CLAIMED', 'EXPIRED', 'REVOKED'
);

CREATE TABLE "public"."outreach_campaigns" (
    "id"                   TEXT NOT NULL,
    "name"                 TEXT NOT NULL,
    "description"          TEXT,
    "campaign_type"        TEXT NOT NULL DEFAULT 'company_claim',
    "channel"              "public"."OutreachChannel" NOT NULL,
    "status"               "public"."OutreachCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "message_template"     TEXT,
    "created_by"           TEXT NOT NULL,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    "promoted_to_live_at"  TIMESTAMP(3),
    "promoted_to_live_by"  TEXT,
    "paused_at"            TIMESTAMP(3),
    "cancelled_at"         TIMESTAMP(3),
    "last_dry_run_at"      TIMESTAMP(3),
    "dry_run_summary"      JSONB,

    CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outreach_campaigns_status_idx" ON "public"."outreach_campaigns"("status");

CREATE TABLE "public"."outreach_recipients" (
    "id"                  TEXT NOT NULL,
    "campaign_id"         TEXT NOT NULL,
    "company_id"          TEXT NOT NULL,
    "channel"             "public"."OutreachChannel" NOT NULL,
    "destination"         TEXT,
    "state"               "public"."OutreachRecipientState" NOT NULL DEFAULT 'PENDING',
    "eligibility_reason"  TEXT,
    "provider_message_id" TEXT,
    "failure_reason"      TEXT,
    "claim_invitation_id" TEXT,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL,
    "queued_at"           TIMESTAMP(3),
    "sent_at"             TIMESTAMP(3),
    "delivered_at"        TIMESTAMP(3),
    "failed_at"           TIMESTAMP(3),
    "claimed_at"          TIMESTAMP(3),

    CONSTRAINT "outreach_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "outreach_recipients_claim_invitation_id_key" ON "public"."outreach_recipients"("claim_invitation_id");
CREATE UNIQUE INDEX "outreach_recipients_campaign_id_company_id_key" ON "public"."outreach_recipients"("campaign_id", "company_id");
CREATE INDEX "outreach_recipients_company_id_idx" ON "public"."outreach_recipients"("company_id");
CREATE INDEX "outreach_recipients_state_idx" ON "public"."outreach_recipients"("state");

CREATE TABLE "public"."outreach_suppressions" (
    "id"          TEXT NOT NULL,
    "company_id"  TEXT,
    "destination" TEXT,
    "channel"     "public"."OutreachChannel",
    "reason"      "public"."SuppressionReason" NOT NULL,
    "source"      TEXT NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by"  TEXT,

    CONSTRAINT "outreach_suppressions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outreach_suppressions_company_id_idx" ON "public"."outreach_suppressions"("company_id");
CREATE INDEX "outreach_suppressions_destination_idx" ON "public"."outreach_suppressions"("destination");

CREATE TABLE "public"."claim_invitations" (
    "id"                 TEXT NOT NULL,
    "company_id"         TEXT NOT NULL,
    "campaign_id"        TEXT NOT NULL,
    "status"             "public"."ClaimInvitationStatus" NOT NULL DEFAULT 'ISSUED',
    "issued_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"         TIMESTAMP(3) NOT NULL,
    "viewed_at"          TIMESTAMP(3),
    "consumed_at"        TIMESTAMP(3),
    "revoked_at"         TIMESTAMP(3),
    "claimed_by_user_id" TEXT,

    CONSTRAINT "claim_invitations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "claim_invitations_company_id_idx" ON "public"."claim_invitations"("company_id");
CREATE INDEX "claim_invitations_campaign_id_idx" ON "public"."claim_invitations"("campaign_id");

ALTER TABLE "public"."outreach_recipients"
  ADD CONSTRAINT "outreach_recipients_campaign_id_fkey"
  FOREIGN KEY ("campaign_id") REFERENCES "public"."outreach_campaigns"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."outreach_recipients"
  ADD CONSTRAINT "outreach_recipients_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."outreach_recipients"
  ADD CONSTRAINT "outreach_recipients_claim_invitation_id_fkey"
  FOREIGN KEY ("claim_invitation_id") REFERENCES "public"."claim_invitations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."outreach_suppressions"
  ADD CONSTRAINT "outreach_suppressions_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "public"."users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."claim_invitations"
  ADD CONSTRAINT "claim_invitations_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."claim_invitations"
  ADD CONSTRAINT "claim_invitations_campaign_id_fkey"
  FOREIGN KEY ("campaign_id") REFERENCES "public"."outreach_campaigns"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
